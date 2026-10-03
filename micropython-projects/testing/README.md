# testing

Scratch workspace for running lesson code on the Pico from VS Code (MicroPico) or the terminal.

## Plotting the pots

`print()` in a console is useless for several knobs that move at the same time. Instead the
Pico streams one CSV line per sample and the Mac draws it.

- `pot-stream-lesson8.py` — lesson 8 code (Pitch on 4051 CH0, Amount on CH1, Rate on GP26).
- `pot-stream-lesson11.py` — lesson 11 code (Pitch, Amount, Rate, Feedback and Tempo on
  4051 CH0–CH4, selector bits on GP18/GP19/GP20).
- `plot_pots.py` — host-side live matplotlib window with a scrolling window of the last
  10 seconds.

Each stream file keeps the lesson's wiring and LED/Trigger behaviour. The only change is
that the lesson's throttled `print()` is replaced by a plot feed: a one-off header naming
the traces, then one line per sample every 50 ms.

```
POT#,Pitch,Amount,Rate,Feedback,Tempo
POT,0.5120,0.3310,0.8740,0.1020,0.6600
```

`plot_pots.py` follows whatever the header says, so three dials and five dials both work
with no change to the plotter.

## Running it

Close the MicroPico REPL first — only one program can hold the serial port.

```bash
uv run plot_pots.py --lesson 11
```

That pushes `pot-stream-lesson11.py` to the board with `mpremote run` (nothing is written to
the Pico's flash) and opens the plot. Close the window or press Ctrl-C to stop the board.

If the Pico already runs a streaming file as its own `main.py`, just read the port instead:

```bash
uv run plot_pots.py --port auto
```

Useful flags:

| Flag | Meaning |
| --- | --- |
| `--lesson 8` | Which `pot-stream-lessonN.py` to push (default 8) |
| `--window 20` | Seconds of history on screen (default 10) |
| `--csv run.csv` | Also write every sample to a CSV file for a static plot later |
| `--port /dev/cu.usbmodem13101` | Pick a specific serial port instead of auto-detect |
| `--script other.py` | Push some other MicroPython file |

`plot_pots.py` carries its own dependencies in a PEP 723 header, so `uv run` fetches
matplotlib and pyserial into a throwaway environment. The project `.venv` is not touched.

Any line the Pico prints that does not start with `POT` is echoed to the terminal, so
ordinary `print()` debugging keeps working while the plot is up.

## Adding a later lesson

Copy the lesson's `main.py`, replace its throttled `print()` with the header plus one
`print("POT,%.4f,...")` per scan, and save it as `pot-stream-lesson<N>.py`. The plotter
picks it up with `--lesson <N>`.
