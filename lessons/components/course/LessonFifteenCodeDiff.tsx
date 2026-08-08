import { CodeDiffPanel } from "./LessonCodeDiff";

const lesson14PreparedTones = `from array import array
from machine import I2S, Pin
from math import pi, sin

SAMPLE_RATE = 44_100
AMPLITUDE = 8_000
PITCHES_HZ = (220, 330, 440, 660, 880)
CHUNK_LENGTH_MS = 100
REPEATS_PER_PITCH = 10


def make_tone(frequency_hz):
    # Keep this buffer small enough for the Pico's RAM.
    frame_count = SAMPLE_RATE * CHUNK_LENGTH_MS // 1_000
    samples = array("h", [0] * (frame_count * 2))

    for frame in range(frame_count):
        angle = 2 * pi * frequency_hz * frame / SAMPLE_RATE
        sample = int(AMPLITUDE * sin(angle))

        samples[frame * 2] = sample
        samples[frame * 2 + 1] = sample

    return samples


print("Preparing tone blocks")
tones = []

for frequency_hz in PITCHES_HZ:
    tones.append(make_tone(frequency_hz))

audio = I2S(
    0,
    sck=Pin(16),       # GP16 -> BCK
    ws=Pin(17),        # GP17 -> LRCK
    sd=Pin(18),        # GP18 -> DIN
    mode=I2S.TX,
    bits=16,
    format=I2S.STEREO,
    rate=SAMPLE_RATE,
    ibuf=20_000,
)

try:
    for frequency_hz, tone in zip(PITCHES_HZ, tones):
        print("Pitch:", frequency_hz, "Hz")

        for _ in range(REPEATS_PER_PITCH):
            audio.write(tone)
finally:
    audio.deinit()
`;

const mergedBuild = `from array import array
from machine import I2S, Pin
from math import pi, sin
from picozero import Button, LED, Pot
from time import sleep_ms, ticks_add, ticks_diff, ticks_ms

# --- Five-pot mux scan, LED, and Trigger button (lesson 11) ---
led = LED(15)
button = Button(14)
mux_adc = Pot(28)

mux_s0 = Pin(18, Pin.OUT)
mux_s1 = Pin(19, Pin.OUT)
mux_s2 = Pin(20, Pin.OUT)

PITCH_CHANNEL = 0
AMOUNT_CHANNEL = 1
RATE_CHANNEL = 2
FEEDBACK_CHANNEL = 3
TEMPO_CHANNEL = 4

MUX_SETTLE_MS = 2
CONTROL_SCAN_MS = 20

pitch_value = 0
amount_value = 0
rate_value = 0
feedback_value = 0
tempo_value = 0

next_control_scan = ticks_ms()
mux_waiting = False
mux_channel = PITCH_CHANNEL
mux_started = ticks_ms()


def select_mux_channel(channel):
    mux_s0.value(channel & 1)
    mux_s1.value((channel >> 1) & 1)
    mux_s2.value((channel >> 2) & 1)


def start_mux_read(channel):
    global mux_channel, mux_started, mux_waiting

    mux_channel = channel
    select_mux_channel(channel)
    mux_started = ticks_ms()
    mux_waiting = True


def finish_mux_read():
    global amount_value, feedback_value, mux_waiting
    global next_control_scan, pitch_value, rate_value, tempo_value

    reading = mux_adc.value

    if mux_channel == PITCH_CHANNEL:
        pitch_value = reading
        start_mux_read(AMOUNT_CHANNEL)
    elif mux_channel == AMOUNT_CHANNEL:
        amount_value = reading
        start_mux_read(RATE_CHANNEL)
    elif mux_channel == RATE_CHANNEL:
        rate_value = reading
        start_mux_read(FEEDBACK_CHANNEL)
    elif mux_channel == FEEDBACK_CHANNEL:
        feedback_value = reading
        start_mux_read(TEMPO_CHANNEL)
    else:
        tempo_value = reading
        mux_waiting = False
        next_control_scan = ticks_add(ticks_ms(), CONTROL_SCAN_MS)


# --- Rotary Mod Type selector, now on the real breadboard (lesson 12) ---
selector_inputs = (
    Pin(2, Pin.IN, Pin.PULL_UP),
    Pin(3, Pin.IN, Pin.PULL_UP),
    Pin(4, Pin.IN, Pin.PULL_UP),
    Pin(5, Pin.IN, Pin.PULL_UP),
    Pin(6, Pin.IN, Pin.PULL_UP),
)

mod_names = ("Rising saw", "Falling saw", "Triangle", "Sine", "Square")


def read_mod_type():
    for index, input_pin in enumerate(selector_inputs):
        if input_pin.value() == 0:
            return index

    # A break-before-make switch briefly selects nothing while turning.
    return None


# --- Prepared I2S tone blocks, one per Mod Type position (lesson 14) ---
SAMPLE_RATE = 44_100
AMPLITUDE = 8_000
PITCHES_HZ = (220, 330, 440, 660, 880)
CHUNK_LENGTH_MS = 100
REPEATS_PER_TRIGGER = 5


def make_tone(frequency_hz):
    frame_count = SAMPLE_RATE * CHUNK_LENGTH_MS // 1_000
    samples = array("h", [0] * (frame_count * 2))

    for frame in range(frame_count):
        angle = 2 * pi * frequency_hz * frame / SAMPLE_RATE
        sample = int(AMPLITUDE * sin(angle))

        samples[frame * 2] = sample
        samples[frame * 2 + 1] = sample

    return samples


print("Preparing tone blocks")
tones = [make_tone(frequency_hz) for frequency_hz in PITCHES_HZ]

# The only wiring change from lesson 13: DIN moves from GP18 to GP21,
# because GP18 is already the mux's S0 select line on this shared Pico.
audio = I2S(
    0,
    sck=Pin(16),       # GP16 -> BCK
    ws=Pin(17),        # GP17 -> LRCK
    sd=Pin(21),        # GP21 -> DIN (lessons 13-14 used GP18)
    mode=I2S.TX,
    bits=16,
    format=I2S.STEREO,
    rate=SAMPLE_RATE,
    ibuf=20_000,
)

last_mod_type = 0
last_pitch_hz = -1
last_amount = -1
last_rate = -1
last_feedback = -1
last_tempo_bpm = -1
last_change = ticks_ms()
light_on = False
button_was_pressed = False

try:
    while True:
        now = ticks_ms()

        # Job 1: scan all five pots through GP28. This never waits for I2S.
        if not mux_waiting and ticks_diff(now, next_control_scan) >= 0:
            start_mux_read(PITCH_CHANNEL)

        if mux_waiting and ticks_diff(now, mux_started) >= MUX_SETTLE_MS:
            finish_mux_read()

        # Job 2: read the rotary Mod Type selector.
        mod_type = read_mod_type()
        if mod_type is not None:
            last_mod_type = mod_type

        pitch_hz = int(100 + pitch_value * 900)
        tempo_bpm = int(40 + tempo_value * 160)

        if (
            abs(pitch_hz - last_pitch_hz) >= 5
            or abs(amount_value - last_amount) >= 0.03
            or abs(rate_value - last_rate) >= 0.03
            or abs(feedback_value - last_feedback) >= 0.03
            or abs(tempo_bpm - last_tempo_bpm) >= 2
        ):
            print(
                "Mod type:", last_mod_type, mod_names[last_mod_type],
                "Pitch:", pitch_hz, "Hz",
                "Amount:", round(amount_value, 2),
                "Rate:", round(rate_value, 2),
                "Feedback:", round(feedback_value, 2),
                "Tempo:", tempo_bpm, "BPM",
            )
            last_pitch_hz = pitch_hz
            last_amount = amount_value
            last_rate = rate_value
            last_feedback = feedback_value
            last_tempo_bpm = tempo_bpm

        # Rate controls LED speed; Amount controls LED brightness.
        if button.is_pressed:
            interval = int(500 - rate_value * 450)

            if ticks_diff(now, last_change) >= interval:
                light_on = not light_on
                last_change = now

            led.value = amount_value if light_on else 0
        else:
            led.off()
            light_on = False
            last_change = now

        # Job 3: a fresh press plays the Mod-Type-selected tone once.
        # audio.write() blocks, so the mux scan and LED pause for its
        # duration -- this lesson does not solve that, only shows it.
        if button.is_pressed and not button_was_pressed:
            tone = tones[last_mod_type]
            for _ in range(REPEATS_PER_TRIGGER):
                audio.write(tone)

        button_was_pressed = button.is_pressed

        sleep_ms(1)
finally:
    audio.deinit()
`;

export default function LessonFifteenCodeDiff() {
  return (
    <CodeDiffPanel
      before={lesson14PreparedTones}
      after={mergedBuild}
      label="Changes to main.py merging the lesson 11 five-pot mux scan, the lesson 12 rotary Mod Type selector, and the lesson 14 prepared I2S tones onto one shared Pico, with DIN moved from GP18 to GP21"
    />
  );
}
