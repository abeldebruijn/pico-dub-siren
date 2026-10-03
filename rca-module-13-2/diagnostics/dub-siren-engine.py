"""Dub Siren V3 sound engine for Pico 2 + RCA Module 13.2 (PCM5102A).

A digital model of the analogue Dub Siren V3.1 circuit:

    NE555 #1 (47 uF)  ->  slow capacitor ramp        = the LFO
    UA741 buffer      ->  NE555 #2 pin 5 (CON)       = the control voltage
    NE555 #2 (150 nF) ->  rectangular pulse, 90 Hz.. = the audible oscillator
    momentary switch  ->  gates the pulse into the   = the trigger
    PT2399 module     ->  echo with feedback         = the repeats

Every component value below is taken from `Dub Siren V3.1.pdf` in the
repository root, so the frequency ranges match the real instrument.

NOT YET TESTED ON HARDWARE. Run it, listen, then adjust the mappings.

Wiring
    GP16 -> RCA BCK      GP17 -> RCA LRCK     GP18 -> RCA DIN
    GP28 -> CD74HC4051 common out (Z)
    GP19/GP20/GP21 -> 4051 S0/S1/S2
        NOTE: the earlier mux lessons drive S0/S1/S2 from GP18/GP19/GP20.
        GP18 is the I2S data line, so the selector bits move up by one.
    GP14 -> trigger button to ground     GP15 -> LFO indicator LED
    GP2..GP6 -> five-position modulation selector, common leg to ground
"""

from array import array
from machine import ADC, I2S, Pin
from math import exp, log
from time import ticks_add, ticks_diff, ticks_ms

import micropython


# --------------------------------------------------------------------------
# Audio configuration
# --------------------------------------------------------------------------

SAMPLE_RATE = 44_100
BLOCK_FRAMES = 256            # 5.8 ms of audio rendered per pass
AMPLITUDE = 9_000             # peak of the raw pulse wave, well below 32767
MASTER_VOLUME = 0.6           # the original VOL pot has no knob on this build
ECHO_MAX_MS = 500


# --------------------------------------------------------------------------
# Component values from the Dub Siren V3.1 schematic
# --------------------------------------------------------------------------

VCC = 9.0                     # the original runs on 9 V; only used for maths
LN2 = log(2.0)

LFO_R1 = 560.0                # +9V -> pin 7
LFO_R2_MIN = 560.0            # pin 7 -> 47 uF, in series with the SPEED pot
LFO_POT = 50_000.0
LFO_C = 47e-6

OSC_R1 = 2_200.0              # +9V -> pin 7
OSC_R2_MIN = 2_200.0          # pin 7 -> 150 nF, in series with the TONE pot
OSC_POT = 50_000.0
OSC_C = 150e-9

NOMINAL_CV = 2.0 * VCC / 3.0  # pin 5 sits at 2/3 Vcc when nothing drives it
CV_MIN_V = 1.5                # the widest control voltage the model covers
CV_MAX_V = 8.5


# --------------------------------------------------------------------------
# Lookup tables
# --------------------------------------------------------------------------

# tables[0:256]   the 47 uF capacitor ramp, 0..255
# tables[256:512] one phase increment per control-voltage step
tables = array("i", [0] * 512)

# Rising portion of the LFO cycle. The real duty is (R1+R2)/(R1+2*R2), which
# moves between 50% and 67% across the SPEED pot; one fixed value is enough
# to hear the characteristic slow-rise/fast-fall siren shape.
LFO_RISE_FRACTION = 0.55

for index in range(256):
    position = index / 256.0

    if position < LFO_RISE_FRACTION:
        # Charging towards +9V: fast at first, then flattening off.
        step = position / LFO_RISE_FRACTION
        level = 2.0 * (1.0 - 2.0 ** (-step))
    else:
        # Discharging towards 0 V through the same resistance.
        step = (position - LFO_RISE_FRACTION) / (1.0 - LFO_RISE_FRACTION)
        level = 2.0 * (2.0 ** (-step)) - 1.0

    tables[index] = int(level * 255.0)


def charge_factor(control_volts):
    """The 555 charge time in units of R*C, for one control-pin voltage.

    The threshold comparator trips at the control voltage and the trigger
    comparator at half of it, so raising pin 5 lengthens the charge and
    lowers the pitch. The discharge time never depends on pin 5.
    """
    return log((VCC - control_volts / 2.0) / (VCC - control_volts))


# One entry per control-voltage step, computed once because `log` is slow.
charge_factors = [
    charge_factor(CV_MIN_V + (CV_MAX_V - CV_MIN_V) * index / 255.0)
    for index in range(256)
]

# f = 1 / (C * resistance_units), and increment = f * 2**30 / SAMPLE_RATE.
INCREMENT_NUMERATOR = (1 << 30) / (SAMPLE_RATE * OSC_C)


def rebuild_increment_table(tone):
    """Refill tables[256:512] for one position of the TONE pot."""
    r2 = OSC_R2_MIN + (1.0 - tone) * OSC_POT
    charge_resistance = OSC_R1 + r2
    discharge_units = r2 * LN2

    for index in range(256):
        units = charge_resistance * charge_factors[index] + discharge_units
        tables[256 + index] = int(INCREMENT_NUMERATOR / units)


def control_voltage_index(volts):
    if volts < CV_MIN_V:
        volts = CV_MIN_V
    elif volts > CV_MAX_V:
        volts = CV_MAX_V

    return int((volts - CV_MIN_V) / (CV_MAX_V - CV_MIN_V) * 255.0 + 0.5)


def lfo_hz(speed, mod):
    """SPEED fully clockwise is fast; MOD loads pin 5 and slows the ramp."""
    r2 = LFO_R2_MIN + (1.0 - speed) * LFO_POT
    rate = 1.44 / ((LFO_R1 + 2.0 * r2) * LFO_C)

    return rate / (1.0 + 2.0 * mod)


def pulse_duty(tone):
    """The 555 output is high while the capacitor charges, low while it discharges."""
    r2 = OSC_R2_MIN + (1.0 - tone) * OSC_POT

    return (OSC_R1 + r2) / (OSC_R1 + 2.0 * r2)


# --------------------------------------------------------------------------
# Engine state shared with the render loop
# --------------------------------------------------------------------------

FRAMES = 0
OSC_PHASE = 1
LFO_PHASE = 2
LFO_INCREMENT = 3
DUTY_THRESHOLD = 4
CV_LOW = 5
CV_SPAN = 6
DELAY_LENGTH = 7
WRITE_INDEX = 8
FEEDBACK = 9
FILTER_STATE = 10
FILTER_COEFFICIENT = 11
GATE = 12
VOLUME = 13
PEAK = 14
BUFFER_LENGTH = 15

state = array("i", [0] * 16)

delay_frames = SAMPLE_RATE * ECHO_MAX_MS // 1_000
delay_buffer = array("h", [0] * delay_frames)
output_block = array("h", [0] * (BLOCK_FRAMES * 2))

state[FRAMES] = BLOCK_FRAMES
state[BUFFER_LENGTH] = delay_frames
state[PEAK] = AMPLITUDE

# One-pole low-pass in the feedback path. The PT2399 loses its top end on
# every repeat, which is most of why a cheap echo module sounds warm.
_cutoff_hz = 4_000.0
state[FILTER_COEFFICIENT] = int((1.0 - exp(-6.283185 * _cutoff_hz / SAMPLE_RATE)) * 256.0)


@micropython.viper
def render(out_p: ptr16, buf_p: ptr16, st_p: ptr32, tbl_p: ptr32) -> int:
    frames = int(st_p[0])
    osc_phase = int(st_p[1])
    lfo_phase = int(st_p[2])
    lfo_increment = int(st_p[3])
    duty = int(st_p[4])
    cv_low = int(st_p[5])
    cv_span = int(st_p[6])
    delay_length = int(st_p[7])
    write_index = int(st_p[8])
    feedback = int(st_p[9])
    filter_state = int(st_p[10])
    filter_coefficient = int(st_p[11])
    gate = int(st_p[12])
    volume = int(st_p[13])
    peak = int(st_p[14])
    buffer_length = int(st_p[15])

    frame = 0

    while frame < frames:
        # The 47 uF capacitor ramp, read straight out of the shape table.
        shape = int(tbl_p[lfo_phase >> 22])
        lfo_phase = (lfo_phase + lfo_increment) & 0x3FFFFFFF

        # PITCH slides the wiper between the fixed 6 V node and that ramp.
        step = cv_low + ((shape * cv_span) >> 8)
        osc_phase = (osc_phase + int(tbl_p[256 + step])) & 0x3FFFFFFF

        if osc_phase < duty:
            dry = peak
        else:
            dry = 0 - peak

        dry = dry * gate

        # PT2399-style echo: read, darken, feed back, write.
        read_index = write_index - delay_length

        if read_index < 0:
            read_index += buffer_length

        wet = int(buf_p[read_index])

        if wet > 32767:
            wet -= 65536

        filter_state = filter_state + (((wet - filter_state) * filter_coefficient) >> 8)
        written = dry + ((filter_state * feedback) >> 8)

        if written > 32767:
            written = 32767
        elif written < -32768:
            written = -32768

        buf_p[write_index] = written & 0xFFFF
        write_index += 1

        if write_index >= buffer_length:
            write_index = 0

        sample = ((dry + wet) * volume) >> 8

        if sample > 32767:
            sample = 32767
        elif sample < -32768:
            sample = -32768

        sample = sample & 0xFFFF
        out_p[frame + frame] = sample
        out_p[frame + frame + 1] = sample
        frame += 1

    st_p[1] = osc_phase
    st_p[2] = lfo_phase
    st_p[8] = write_index
    st_p[10] = filter_state

    return 0


# --------------------------------------------------------------------------
# Controls
# --------------------------------------------------------------------------

mux_adc = ADC(28)
mux_select = (Pin(19, Pin.OUT), Pin(20, Pin.OUT), Pin(21, Pin.OUT))

trigger = Pin(14, Pin.IN, Pin.PULL_UP)
indicator = Pin(15, Pin.OUT)

mod_selector = tuple(Pin(number, Pin.IN, Pin.PULL_UP) for number in range(2, 7))

TONE_CHANNEL = 0        # 4051 CH0, labelled Pitch in the earlier lessons
DEPTH_CHANNEL = 1       # CH1, labelled Amount
SPEED_CHANNEL = 2       # CH2, labelled Rate
FEEDBACK_CHANNEL = 3    # CH3
ECHO_CHANNEL = 4        # CH4, labelled Tempo

knobs = [0.5, 0.5, 0.5, 0.3, 0.4]
next_channel = 0

# Position 1 of the selector is the MODULATION-SW switched off.
MOD_DEPTHS = (0.0, 0.25, 0.5, 0.75, 1.0)
mod_depth = 0.0

SMOOTHING = 0.25


def read_knob(channel):
    """Select one 4051 channel, let it settle, and smooth the reading."""
    mux_select[0].value(channel & 1)
    mux_select[1].value((channel >> 1) & 1)
    mux_select[2].value((channel >> 2) & 1)

    # The mux needs a moment; one throwaway conversion is enough at 5.8 ms
    # per block because the same channel is re-read every 29 ms.
    mux_adc.read_u16()
    reading = mux_adc.read_u16() / 65535.0

    knobs[channel] += SMOOTHING * (reading - knobs[channel])


def read_mod_depth():
    for position, pin in enumerate(mod_selector):
        if pin.value() == 0:
            return MOD_DEPTHS[position]

    # A break-before-make switch selects nothing while it is turning.
    return None


last_tone = -1.0


def apply_controls():
    """Turn smoothed knob positions into engine state."""
    global last_tone

    tone = knobs[TONE_CHANNEL]
    depth = knobs[DEPTH_CHANNEL]
    speed = knobs[SPEED_CHANNEL]

    if abs(tone - last_tone) > 0.004:
        rebuild_increment_table(tone)
        state[DUTY_THRESHOLD] = int(pulse_duty(tone) * (1 << 30))
        last_tone = tone

    state[LFO_INCREMENT] = int(lfo_hz(speed, mod_depth) * (1 << 30) / SAMPLE_RATE)

    # MOD drives the first 555's own control pin, which widens the swing the
    # capacitor makes; PITCH then decides how much of that swing reaches the
    # audio oscillator, with the rest held at the fixed 6 V node.
    low_volts = NOMINAL_CV + depth * ((3.0 - 1.0 * mod_depth) - NOMINAL_CV)
    high_volts = NOMINAL_CV + depth * ((6.0 + 2.5 * mod_depth) - NOMINAL_CV)

    low_step = control_voltage_index(low_volts)
    span = control_voltage_index(high_volts) - low_step

    if span < 0:
        span = 0

    state[CV_LOW] = low_step
    state[CV_SPAN] = span

    echo_ms = 30.0 + knobs[ECHO_CHANNEL] * (ECHO_MAX_MS - 30.0)
    state[DELAY_LENGTH] = int(SAMPLE_RATE * echo_ms / 1_000.0)
    state[FEEDBACK] = int(knobs[FEEDBACK_CHANNEL] * 220.0)
    state[VOLUME] = int(MASTER_VOLUME * 256.0)


# --------------------------------------------------------------------------
# Run
# --------------------------------------------------------------------------

audio = I2S(
    0,
    sck=Pin(16),
    ws=Pin(17),
    sd=Pin(18),
    mode=I2S.TX,
    bits=16,
    format=I2S.STEREO,
    rate=SAMPLE_RATE,
    ibuf=20_000,
)

rebuild_increment_table(knobs[TONE_CHANNEL])
apply_controls()

next_selector_read = ticks_ms()

try:
    print("Dub siren running. Hold the trigger button on GP14.")

    while True:
        state[GATE] = 1 if trigger.value() == 0 else 0

        render(output_block, delay_buffer, state, tables)
        audio.write(output_block)

        # One knob per block keeps every control fresh within about 29 ms.
        read_knob(next_channel)
        next_channel = (next_channel + 1) % 5
        apply_controls()

        now = ticks_ms()

        if ticks_diff(now, next_selector_read) >= 0:
            position = read_mod_depth()

            if position is not None:
                mod_depth = position

            # The LED follows the first half of the LFO ramp, like the 2N3904.
            indicator.value(1 if state[LFO_PHASE] < 0x20000000 else 0)
            next_selector_read = ticks_add(now, 20)
finally:
    audio.deinit()
