# Lesson 11 with a plot feed.
#
# Same wiring and same scheduled scan as lesson 11: all five dial values --
# Pitch, Amount, Rate, Feedback and Tempo -- come through 4051 channels 0 to 4
# on GP28, with selector bits on GP18, GP19 and GP20.
#
# The lesson's throttled print is replaced by one CSV line per scan so the host
# script plot_pots.py can draw all five dials over time.
#
# Run it from the Mac with:   uv run plot_pots.py --lesson 11
# or copy it to the Pico as main.py and run:   uv run plot_pots.py --port auto

from machine import Pin
from picozero import Button, LED, Pot
from time import sleep_ms, ticks_add, ticks_diff, ticks_ms

led = LED(15)
button = Button(14)
mux_adc = Pot(28)

# Three selector bits can reach all eight 4051 channels.
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

# Names the plotter uses for the traces, in the order they are printed.
CHANNEL_NAMES = "Pitch,Amount,Rate,Feedback,Tempo"

# How often to send a line to the plotter, in milliseconds.
PLOT_INTERVAL_MS = 50

# Repeat the header now and then so a plotter that attaches late still
# learns the channel names.
HEADER_EVERY = 100

pitch_value = 0
amount_value = 0
rate_value = 0
feedback_value = 0
tempo_value = 0

last_change = ticks_ms()
last_plot = ticks_ms()
light_on = False
samples_sent = 0

next_control_scan = ticks_ms()
mux_waiting = False
mux_channel = PITCH_CHANNEL
mux_started = ticks_ms()


def select_mux_channel(channel):
    # Extract the three binary bits for S0, S1 and S2.
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


print("POT#," + CHANNEL_NAMES)

while True:
    now = ticks_ms()

    # Job 1: scan all five pots through GP28.
    if not mux_waiting and ticks_diff(now, next_control_scan) >= 0:
        start_mux_read(PITCH_CHANNEL)

    if mux_waiting and ticks_diff(now, mux_started) >= MUX_SETTLE_MS:
        finish_mux_read()

    # Job 2: feed the plotter, in the same order as CHANNEL_NAMES.
    if ticks_diff(now, last_plot) >= PLOT_INTERVAL_MS:
        print(
            "POT,%.4f,%.4f,%.4f,%.4f,%.4f"
            % (pitch_value, amount_value, rate_value, feedback_value, tempo_value)
        )
        last_plot = now

        samples_sent += 1
        if samples_sent % HEADER_EVERY == 0:
            print("POT#," + CHANNEL_NAMES)

    # Rate controls LED speed; Amount controls LED brightness.
    # Feedback and Tempo are only measured in this lesson.
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

    sleep_ms(1)
