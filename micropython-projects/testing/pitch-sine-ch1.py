"""Play a pitch-controlled, frequency-modulated sine through the RCA DAC.

CD74HC4051: Rate CH0, Pitch CH1, Amount CH3 -> GP28.
Selectors: GP18/19/20. Rate: 0.5-50 Hz; Pitch: 50-4000 Hz.
Toggle button: GP14, active low. DAC: BCK GP16, LRCK GP17, DIN GP21.
Run temporarily with: mpremote run pitch-sine-ch1.py
"""

from array import array
from machine import ADC, I2S, Pin
from math import pi, sin
from time import sleep_us, ticks_add, ticks_diff, ticks_ms


# 256 frames give 8 ms of CPU time at 32 kHz; the FM loop needs about 5 ms.
SAMPLE_RATE = 32_000
AMPLITUDE = 8_000
# Q7 LFO values keep depth_step * LFO sample within a 32-bit Pico small int.
MOD_SHIFT = 7
MOD_SCALE = (1 << MOD_SHIFT) - 1
FRAMES_PER_BLOCK = 256
TABLE_SIZE = 1_024
PHASE_FRACTION_BITS = 16
PHASE_MODULUS = TABLE_SIZE << PHASE_FRACTION_BITS
PHASE_MASK = PHASE_MODULUS - 1
DEBOUNCE_MS = 40
PLOT_INTERVAL_MS = 100

# All used mux channels have S2 = 0.
mux_s0 = Pin(18, Pin.OUT, value=1)
mux_s1 = Pin(19, Pin.OUT, value=0)
mux_s2 = Pin(20, Pin.OUT, value=0)
pot_adc = ADC(Pin(28))
trigger = Pin(14, Pin.IN, Pin.PULL_UP)


def read_pot(channel):
    mux_s0.value(channel & 1)
    mux_s1.value((channel >> 1) & 1)
    sleep_us(10)  # Let the newly selected analogue channel settle.
    return pot_adc.read_u16()

# A small lookup table avoids calling sin() for every audio sample.
wave = array(
    "h",
    [int(AMPLITUDE * sin(2 * pi * i / TABLE_SIZE)) for i in range(TABLE_SIZE)],
)
mod_wave = array(
    "b",
    [int(MOD_SCALE * sin(2 * pi * i / TABLE_SIZE)) for i in range(TABLE_SIZE)],
)
block = array("h", [0] * (FRAMES_PER_BLOCK * 2))
silence_block = array("h", [0] * (FRAMES_PER_BLOCK * 2))


def fill_sine_block(samples, table, phase, step):
    """Fill one stereo block; local variables keep the sample loop fast."""
    for index in range(0, FRAMES_PER_BLOCK * 2, 2):
        sample = table[phase >> PHASE_FRACTION_BITS]
        samples[index] = sample
        samples[index + 1] = sample
        phase = (phase + step) & PHASE_MASK
    return phase


def fill_modulated_block(samples, table, lfo_table, phase, step,
                         lfo_phase, lfo_step, depth_step):
    """FM: instantaneous frequency = pitch * (1 + amount * LFO)."""
    for index in range(0, FRAMES_PER_BLOCK * 2, 2):
        sample = table[phase >> PHASE_FRACTION_BITS]
        samples[index] = sample
        samples[index + 1] = sample
        deviation = (depth_step * lfo_table[lfo_phase >> PHASE_FRACTION_BITS]) >> MOD_SHIFT
        phase = (phase + step + deviation) & PHASE_MASK
        lfo_phase = (lfo_phase + lfo_step) & PHASE_MASK
    return phase, lfo_phase


audio = I2S(
    0,
    sck=Pin(16),
    ws=Pin(17),
    sd=Pin(21),
    mode=I2S.TX,
    bits=16,
    format=I2S.STEREO,
    rate=SAMPLE_RATE,
    ibuf=4_096,
)

phase = 0
lfo_phase = 0
sound_on = False
button_was_pressed = trigger.value() == 0
last_press_ms = ticks_add(ticks_ms(), -DEBOUNCE_MS)
last_plot_ms = ticks_ms()
print("FM sine: Pitch CH1, Rate CH0, Amount CH3; GP14 toggles, initially off")
print("POT#,Pitch,Amount,Rate")

try:
    while True:
        pitch = read_pot(1) / 65_535  # 0.0 to 1.0
        rate = read_pot(0) / 65_535
        amount = read_pot(3) / 65_535
        pitch_hz = 50 + pitch * 3_950
        rate_hz = 0.5 + rate * 49.5
        phase_step = int(pitch_hz * PHASE_MODULUS / SAMPLE_RATE)
        lfo_step = int(rate_hz * PHASE_MODULUS / SAMPLE_RATE)
        depth_step = int(phase_step * amount)
        button_pressed = trigger.value() == 0
        now = ticks_ms()
        if (
            button_pressed
            and not button_was_pressed
            and ticks_diff(now, last_press_ms) >= DEBOUNCE_MS
        ):
            sound_on = not sound_on
            last_press_ms = now
            if sound_on:
                phase = 0  # Start a new note at the sine wave's zero crossing.
                lfo_phase = 0
            print("Sound:", "on" if sound_on else "off")
        button_was_pressed = button_pressed

        if sound_on:
            if depth_step:
                phase, lfo_phase = fill_modulated_block(
                    block, wave, mod_wave, phase, phase_step,
                    lfo_phase, lfo_step, depth_step,
                )
            else:
                phase = fill_sine_block(block, wave, phase, phase_step)
            audio.write(block)
        else:
            audio.write(silence_block)

        if ticks_diff(now, last_plot_ms) >= PLOT_INTERVAL_MS:
            print("POT,%.4f,%.4f,%.4f" % (pitch, amount, rate))
            last_plot_ms = now
finally:
    audio.deinit()
