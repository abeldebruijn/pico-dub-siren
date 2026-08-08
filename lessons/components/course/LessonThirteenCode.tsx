import { File, type LineAnnotation } from "@pierre/diffs/react";
import { Check, Clipboard, MessageSquareOff } from "lucide-react";
import { useMemo, useState } from "react";

const code = `from array import array
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
    audio.deinit()`;

type LineNote = {
  body: string;
};

const notes: Record<number, LineNote> = {
  6: { body: "22,050 Hz is not on this list. The PCM5102A builds its master clock from BCK alone and cannot lock onto that rate." },
  15: { body: "sck, ws, and sd are MicroPython's names for BCK, LRCK, and DIN." },
  27: { body: "700 ms of stereo audio at 44,100 Hz needs about 123 KB — too much to allocate reliably. Building 100 ms keeps the buffer near 18 KB." },
  34: { body: "Both channels receive the same sample, so the left and right RCA outputs play the same test tone." },
  48: { body: "Writing the same 100 ms chunk seven times produces 700 ms without a second large allocation." },
  53: { body: "Always release the I2S bus, even if the loop is interrupted." },
};

export default function LessonThirteenCode() {
  const [showNotes, setShowNotes] = useState(true);
  const [copied, setCopied] = useState(false);
  const lineAnnotations = useMemo(
    () =>
      Object.entries(notes).map(([lineNumber, note]) => ({
        lineNumber: Number(lineNumber),
        metadata: note,
      })) satisfies LineAnnotation<LineNote>[],
    [],
  );

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <section className="course-code" aria-label="MicroPython lesson code">
      <header>
        <code>main.py</code>
        <div>
          <button type="button" onClick={() => setShowNotes((value) => !value)}>
            <MessageSquareOff aria-hidden="true" /> {showNotes ? "Hide notes" : "Show notes"}
          </button>
          <button type="button" onClick={() => void copyCode()}>
            {copied ? <Check aria-hidden="true" /> : <Clipboard aria-hidden="true" />} {copied ? "Copied" : "Copy code"}
          </button>
        </div>
      </header>
      <div className="course-code__viewer">
        <File
          file={{ name: "main.py", contents: code }}
          lineAnnotations={showNotes ? lineAnnotations : []}
          renderAnnotation={showNotes ? renderLineAnnotation : undefined}
          options={{ theme: "github-dark", overflow: "scroll", disableLineNumbers: false }}
        />
      </div>
    </section>
  );
}

function renderLineAnnotation(annotation: LineAnnotation<LineNote>) {
  return annotation.metadata ? <p className="course-code__annotation">{annotation.metadata.body}</p> : null;
}
