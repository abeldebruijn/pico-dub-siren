import { CodeDiffPanel } from "./LessonCodeDiff";

const pitchOnly = `from picozero import Pot
from time import sleep

pitch = Pot(28)
last_pitch_hz = -1

while True:
    pitch_hz = int(100 + pitch.value * 900)

    if abs(pitch_hz - last_pitch_hz) >= 5:
        print("Pitch through 4051:", pitch_hz, "Hz")
        last_pitch_hz = pitch_hz

    sleep(0.01)
`;

const twoChannels = `from machine import Pin
from picozero import Button, LED, Pot
from time import sleep, ticks_diff, ticks_ms

led = LED(15)
button = Button(14)
rate = Pot(26)
mux_adc = Pot(28)

mux_s0 = Pin(18, Pin.OUT)


def read_mux(channel):
    mux_s0.value(channel)
    sleep(0.002)
    return mux_adc.value


pitch_value = read_mux(0)
amount_value = read_mux(1)
last_pitch_hz = -1
last_change = ticks_ms()
light_on = False


while True:
    pitch_value = read_mux(0)
    amount_value = read_mux(1)

    pitch_hz = int(100 + pitch_value * 900)
    if abs(pitch_hz - last_pitch_hz) >= 5:
        print("Pitch:", pitch_hz, "Hz", "Amount:", round(amount_value, 2))
        last_pitch_hz = pitch_hz

    if button.is_pressed:
        interval = int(500 - rate.value * 450)
        now = ticks_ms()

        if ticks_diff(now, last_change) >= interval:
            light_on = not light_on
            last_change = now

        led.value = amount_value if light_on else 0
    else:
        led.off()
        light_on = False
        last_change = ticks_ms()

    sleep(0.01)
`;

export default function LessonEightCodeDiff() {
  return <CodeDiffPanel before={pitchOnly} after={twoChannels} label="Changes to main.py adding Amount on 4051 channel 1" />;
}
