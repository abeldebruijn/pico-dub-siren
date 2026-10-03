# /// script
# requires-python = ">=3.9"
# dependencies = ["matplotlib>=3.8", "pyserial>=3.5"]
# ///
"""Live matplotlib plot of the lesson pots.

The Pico runs one of the pot-stream-lessonN.py files, which name their traces
once and then print one line per sample:

    POT#,Pitch,Amount,Rate
    POT,0.5120,0.3310,0.8740

This script reads those lines and draws a scrolling window of the last few
seconds. It follows whatever the header says, so three dials or five dials both
work without changing anything here. Anything the Pico prints that is not a POT
line is passed through to the terminal, so normal print() debugging still works.

Two ways to get the data:

    uv run plot_pots.py --lesson 11        # push the code with mpremote and plot
    uv run plot_pots.py --port auto        # Pico already runs the code; just read serial

Optional:

    --window 20        seconds of history on screen (default 10)
    --csv run.csv      also append every sample to a CSV file
"""

from __future__ import annotations

import argparse
import csv
import shutil
import signal
import subprocess
import sys
import threading
import time
from collections import deque
from pathlib import Path

import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

HERE = Path(__file__).resolve().parent
DEFAULT_LESSON = 8
DATA_PREFIX = "POT,"
HEADER_PREFIX = "POT#,"
COLOURS = (
    "#2e86ab",  # Pitch: blue
    "#a663cc",  # Amount: purple
    "#e4572e",  # Rate: red
    "#3fb950",  # Feedback
    "#f2a541",  # Tempo
    "#00b4d8",
    "#ff6b9d",
    "#8d99ae",
)


def script_for_lesson(lesson: int) -> Path:
    return HERE / f"pot-stream-lesson{lesson}.py"


def find_mpremote() -> str:
    """mpremote from PATH, or from the project venv next to this script."""
    venv_mpremote = HERE / ".venv" / "bin" / "mpremote"
    if venv_mpremote.exists():
        return str(venv_mpremote)

    found = shutil.which("mpremote")
    if found:
        return found

    sys.exit(
        "mpremote not found. Install it with `uv add --dev mpremote`, "
        "or pass --port to read a Pico that is already running the code."
    )


def find_port() -> str:
    """First USB serial device that looks like a Pico."""
    from serial.tools import list_ports

    candidates = [
        port.device
        for port in list_ports.comports()
        if "usbmodem" in port.device or "ACM" in port.device
    ]
    if not candidates:
        sys.exit("No Pico serial port found. Plug the Pico in, or pass --port /dev/cu.usbmodemXXXX")
    return candidates[0]


class Samples:
    """Everything the reader thread writes and the plot reads."""

    def __init__(self, window: float, csv_writer=None):
        self.window = window
        self.csv_writer = csv_writer
        self.csv_header_written = False
        self.lock = threading.Lock()
        self.times: deque = deque()
        self.series: list[deque] = []
        self.names: list[str] = []
        self.names_version = 0
        self.start = time.monotonic()

    def set_names(self, names: list[str]) -> None:
        with self.lock:
            if names != self.names:
                self.names = names
                self.names_version += 1

    def add(self, values: list[float]) -> None:
        stamp = time.monotonic() - self.start
        with self.lock:
            if len(self.series) != len(values):
                # First sample, or the board restarted with a different dial count.
                self.series = [deque() for _ in values]
                self.times.clear()
                if len(self.names) != len(values):
                    self.names = [f"Ch{index}" for index in range(len(values))]
                    self.names_version += 1

            self.times.append(stamp)
            for buffer, value in zip(self.series, values):
                buffer.append(value)

            # Keep a little more than one window so the left edge stays clean.
            cutoff = stamp - self.window * 1.2
            while self.times and self.times[0] < cutoff:
                self.times.popleft()
                for buffer in self.series:
                    buffer.popleft()

            names = list(self.names)

        if self.csv_writer:
            if not self.csv_header_written:
                self.csv_writer.writerow(["seconds", *(name.lower() for name in names)])
                self.csv_header_written = True
            self.csv_writer.writerow([f"{stamp:.3f}", *(f"{value:.4f}" for value in values)])

    def snapshot(self):
        with self.lock:
            return (
                list(self.times),
                [list(buffer) for buffer in self.series],
                list(self.names),
                self.names_version,
            )


class Reader(threading.Thread):
    """Reads lines in the background and hands samples to the plot."""

    def __init__(self, samples: Samples):
        super().__init__(daemon=True)
        self.samples = samples
        self.stop_event = threading.Event()
        self.error: str | None = None

    def handle(self, line: str) -> None:
        line = line.strip()
        if not line:
            return

        if line.startswith(HEADER_PREFIX):
            names = [name.strip() for name in line[len(HEADER_PREFIX) :].split(",") if name.strip()]
            if names:
                self.samples.set_names(names)
            return

        if not line.startswith(DATA_PREFIX):
            print(line)
            return

        try:
            values = [float(part) for part in line[len(DATA_PREFIX) :].split(",")]
        except ValueError:
            return
        if values:
            self.samples.add(values)


class MpremoteReader(Reader):
    def __init__(self, samples: Samples, script: Path):
        super().__init__(samples)
        self.script = script
        self.process = None

    def run(self) -> None:
        self.process = subprocess.Popen(
            [find_mpremote(), "run", str(self.script)],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
        )
        last_error = None
        for line in self.process.stdout:
            if self.stop_event.is_set():
                break
            if line.startswith("mpremote:"):
                last_error = line.strip()
            self.handle(line)

        code = self.process.wait()
        if code not in (None, 0) and not self.stop_event.is_set():
            self.error = last_error or f"mpremote exited with code {code}"

    def close(self) -> None:
        self.stop_event.set()
        if self.process and self.process.poll() is None:
            # SIGINT so mpremote sends a KeyboardInterrupt to the board first.
            self.process.send_signal(signal.SIGINT)
            try:
                self.process.wait(timeout=3)
            except subprocess.TimeoutExpired:
                self.process.kill()


class SerialReader(Reader):
    def __init__(self, samples: Samples, port: str):
        super().__init__(samples)
        self.port = port
        self.serial = None

    def run(self) -> None:
        import serial

        try:
            self.serial = serial.Serial(self.port, 115200, timeout=1)
        except serial.SerialException as exc:
            self.error = f"Could not open {self.port}: {exc}"
            return

        while not self.stop_event.is_set():
            try:
                raw = self.serial.readline()
            except Exception as exc:  # port yanked mid-run
                if not self.stop_event.is_set():
                    self.error = str(exc)
                return
            if raw:
                self.handle(raw.decode("utf-8", errors="replace"))

    def close(self) -> None:
        self.stop_event.set()
        if self.serial and self.serial.is_open:
            self.serial.close()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
        "--lesson",
        type=int,
        default=DEFAULT_LESSON,
        help=f"Which pot-stream-lessonN.py to push (default {DEFAULT_LESSON})",
    )
    parser.add_argument(
        "--script",
        type=Path,
        help="Push this MicroPython file instead of the one --lesson picks",
    )
    parser.add_argument(
        "--port",
        nargs="?",
        const="auto",
        help="Read a Pico that is already running the code. 'auto' picks the first USB serial port.",
    )
    parser.add_argument(
        "--window", type=float, default=10.0, help="Seconds of history on screen (default 10)"
    )
    parser.add_argument("--csv", type=Path, help="Also append every sample to this CSV file")
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    csv_file = None
    csv_writer = None
    if args.csv:
        csv_file = args.csv.open("w", newline="")
        csv_writer = csv.writer(csv_file)

    samples = Samples(args.window, csv_writer)

    if args.port:
        port = find_port() if args.port == "auto" else args.port
        reader: Reader = SerialReader(samples, port)
        source = f"serial {port}"
    else:
        script = args.script or script_for_lesson(args.lesson)
        if not script.exists():
            sys.exit(f"{script} not found")
        reader = MpremoteReader(samples, script)
        source = f"mpremote run {script.name}"

    reader.start()

    figure, axes = plt.subplots(figsize=(11, 5))
    figure.canvas.manager.set_window_title("Pot plotter")
    axes.set_title(source)
    axes.set_xlabel("seconds")
    axes.set_ylabel("pot value (0–1)")
    axes.set_ylim(-0.02, 1.02)
    axes.set_xlim(0, args.window)
    axes.grid(alpha=0.25)

    # Live values live under the x-axis so they never sit on top of the traces.
    readout = axes.text(
        0.5,
        -0.18,
        "waiting for data…",
        transform=axes.transAxes,
        ha="center",
        va="top",
        family="monospace",
        fontsize=11,
    )
    figure.subplots_adjust(bottom=0.2)

    lines: list = []
    drawn_version = [-1]

    def rebuild_lines(names: list[str]) -> None:
        for line in lines:
            line.remove()
        lines.clear()
        for index, name in enumerate(names):
            lines.append(
                axes.plot([], [], color=COLOURS[index % len(COLOURS)], linewidth=1.8, label=name)[0]
            )
        axes.legend(loc="upper left", ncol=max(1, len(names) // 3), framealpha=0.9)

    def update(_frame):
        xs, ys, names, version = samples.snapshot()

        if not xs:
            if reader.error:
                readout.set_text(reader.error)
            return [*lines, readout]

        if version != drawn_version[0] or len(lines) != len(ys):
            rebuild_lines(names)
            drawn_version[0] = version

        for line, values in zip(lines, ys):
            line.set_data(xs, values)

        newest = xs[-1]
        axes.set_xlim(max(0.0, newest - args.window), max(args.window, newest))
        readout.set_text(
            "   ".join(f"{name} {values[-1]:.3f}" for name, values in zip(names, ys))
        )

        if reader.error:
            axes.set_title(reader.error)
        return [*lines, readout]

    # Held in a name so the animation is not garbage collected mid-run.
    animation = FuncAnimation(figure, update, interval=50, blit=False, cache_frame_data=False)

    try:
        plt.show()
    except KeyboardInterrupt:
        pass
    finally:
        reader.close()
        if csv_file:
            csv_file.close()
        if reader.error:
            print(reader.error, file=sys.stderr)
        if args.csv:
            print(f"Samples written to {args.csv}")


if __name__ == "__main__":
    main()
