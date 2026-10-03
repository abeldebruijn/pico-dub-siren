"""Play a pitch-controlled sine wave through the lesson 15 RCA DAC wiring.

Pitch pot: CD74HC4051 channel 1 -> GP28. Selectors: GP18/19/20.
Toggle button: GP14, active low. DAC: BCK GP16, LRCK GP17, DIN GP21.
Run temporarily with: mpremote run pitch-sine-ch1.py
"""

from array import array
from machine import ADC, I2S, Pin
from math import pi, sin
from time import sleep_ms, ticks_add, ticks_diff, ticks_ms


SAMPLE_RATE = 44_100
AMPLITUDE = 8_000
FRAMES_PER_BLOCK = 256
TABLE_SIZE = 1_024
PHASE_FRACTION_BITS = 16
PHASE_MODULUS = TABLE_SIZE << PHASE_FRACTION_BITS
PHASE_MASK = PHASE_MODULUS - 1
DEBOUNCE_MS = 40

# Select mux channel 1: S2 S1 S0 = 0 0 1.
mux_s0 = Pin(18, Pin.OUT, value=1)
mux_s1 = Pin(19, Pin.OUT, value=0)
mux_s2 = Pin(20, Pin.OUT, value=0)
pitch_adc = ADC(Pin(28))
trigger = Pin(14, Pin.IN, Pin.PULL_UP)
sleep_ms(2)  # Let the selected analogue channel settle.

# A small lookup table avoids calling sin() for every audio sample.
wave = array(
    "h",
    [int(AMPLITUDE * sin(2 * pi * i / TABLE_SIZE)) for i in range(TABLE_SIZE)],
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
sound_on = False
button_was_pressed = trigger.value() == 0
last_press_ms = ticks_add(ticks_ms(), -DEBOUNCE_MS)
print("CH1 pitch sine: 50-4000 Hz; GP14 toggles sound, initially off")

try:
    while True:
        pitch = pitch_adc.read_u16() / 65_535  # 0.0 to 1.0
        frequency_hz = 50 + pitch * 3_950
        phase_step = int(frequency_hz * PHASE_MODULUS / SAMPLE_RATE)
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
            print("Sound:", "on" if sound_on else "off")
        button_was_pressed = button_pressed

        if sound_on:
            phase = fill_sine_block(block, wave, phase, phase_step)
            audio.write(block)
        else:
            audio.write(silence_block)
finally:
    audio.deinit()
