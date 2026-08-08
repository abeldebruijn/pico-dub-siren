import { CodeDiffPanel } from "./LessonCodeDiff";

const firstTones = `from array import array
from machine import I2S, Pin
from math import pi, sin
from time import sleep_ms

SAMPLE_RATE = 44_100
AMPLITUDE = 8_000
TONES_HZ = (220, 440, 880)
TONE_LENGTH_MS = 700
CHUNK_LENGTH_MS = 100

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


try:
    for frequency_hz in TONES_HZ:
        print("Tone:", frequency_hz, "Hz")
        tone = make_tone(frequency_hz)

        # Reuse 100 ms of audio seven times instead of allocating
        # one large 700 ms stereo buffer.
        for _ in range(TONE_LENGTH_MS // CHUNK_LENGTH_MS):
            audio.write(tone)

        del tone
        sleep_ms(300)
finally:
    audio.deinit()
`;

const preparedTones = `from array import array
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

export default function LessonFourteenCodeDiff() {
  return (
    <CodeDiffPanel
      before={firstTones}
      after={preparedTones}
      label="Changes to main.py preparing five tone blocks before I2S starts, then streaming them in a playback loop"
    />
  );
}
