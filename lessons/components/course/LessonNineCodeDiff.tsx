import { CodeDiffPanel } from "./LessonCodeDiff";

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

const scheduled = `from machine import Pin
from picozero import Button, LED, Pot
from time import sleep_ms, ticks_add, ticks_diff, ticks_ms

led = LED(15)
button = Button(14)
rate = Pot(26)
mux_adc = Pot(28)

# S0 selects which 4051 channel reaches the shared ADC:
# 0 selects Pitch on CH0; 1 selects Amount on CH1.
mux_s0 = Pin(18, Pin.OUT)

# After changing channel, give the voltage 2 ms to settle before reading.
MUX_SETTLE_MS = 2

# Human hands move slowly. Reading both knobs every 20 ms is responsive enough.
CONTROL_SCAN_MS = 20

pitch_value = 0
amount_value = 0

last_pitch_hz = -1
last_change = ticks_ms()
light_on = False

next_control_scan = ticks_ms()
mux_waiting = False
mux_channel = 0
mux_started = ticks_ms()


def start_mux_read(channel):
    global mux_channel, mux_started, mux_waiting

    mux_channel = channel
    mux_s0.value(channel)
    mux_started = ticks_ms()
    mux_waiting = True


def finish_mux_read():
    global amount_value, mux_waiting, next_control_scan, pitch_value

    reading = mux_adc.value

    if mux_channel == 0:
        pitch_value = reading
        start_mux_read(1)
    else:
        amount_value = reading
        mux_waiting = False
        next_control_scan = ticks_add(ticks_ms(), CONTROL_SCAN_MS)


while True:
    now = ticks_ms()

    # Job 1: when the next control scan is due, start with Pitch on CH0.
    if not mux_waiting and ticks_diff(now, next_control_scan) >= 0:
        start_mux_read(0)

    # Keep looping while the selected channel settles. No blocking sleep(0.002).
    if mux_waiting and ticks_diff(now, mux_started) >= MUX_SETTLE_MS:
        finish_mux_read()

    pitch_hz = int(100 + pitch_value * 900)
    if abs(pitch_hz - last_pitch_hz) >= 5:
        print("Pitch:", pitch_hz, "Hz", "Amount:", round(amount_value, 2))
        last_pitch_hz = pitch_hz

    # Job 2: update the LED whenever its own timer says it is time.
    if button.is_pressed:
        interval = int(500 - rate.value * 450)

        if ticks_diff(now, last_change) >= interval:
            light_on = not light_on
            last_change = now

        led.value = amount_value if light_on else 0
    else:
        led.off()
        light_on = False
        last_change = now

    sleep_ms(1)
`;

export default function LessonNineCodeDiff() {
  return <CodeDiffPanel before={twoChannels} after={scheduled} label="Changes to main.py replacing the blocking mux settle with a scheduled state machine" />;
}
