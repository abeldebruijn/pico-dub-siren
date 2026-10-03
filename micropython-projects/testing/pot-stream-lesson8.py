# Lesson 8 with a plot feed.
#
# Same wiring and same behaviour as lesson 8 (Pitch on 4051 CH0, Amount on
# CH1, Rate straight into GP26), plus one CSV line per sample so the host
# script plot_pots.py can draw the three dials over time.
#
# Run it from the Mac with:   uv run plot_pots.py --lesson 8
# or copy it to the Pico as main.py and run:   uv run plot_pots.py --port auto

from machine import Pin
from picozero import Button, LED, Pot
from time import sleep, ticks_diff, ticks_ms

led = LED(15)
button = Button(14)
rate = Pot(26)
mux_adc = Pot(28)

mux_s0 = Pin(18, Pin.OUT)

# How often to send a line to the plotter, in milliseconds.
PLOT_INTERVAL_MS = 50

# Names the plotter uses for the traces, in the order they are printed.
CHANNEL_NAMES = "Pitch,Amount,Rate"

# Repeat the header now and then so a plotter that attaches late still
# learns the channel names.
HEADER_EVERY = 100


def read_mux(channel):
    mux_s0.value(channel)
    sleep(0.002)
    return mux_adc.value


last_change = ticks_ms()
last_plot = ticks_ms()
light_on = False
samples_sent = 0

print("POT#," + CHANNEL_NAMES)

while True:
    pitch_value = read_mux(0)
    amount_value = read_mux(1)
    rate_value = rate.value

    now = ticks_ms()

    if ticks_diff(now, last_plot) >= PLOT_INTERVAL_MS:
        # One machine-readable line: POT,<pitch>,<amount>,<rate>
        print("POT,%.4f,%.4f,%.4f" % (pitch_value, amount_value, rate_value))
        last_plot = now

        samples_sent += 1
        if samples_sent % HEADER_EVERY == 0:
            print("POT#," + CHANNEL_NAMES)

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

    sleep(0.01)
