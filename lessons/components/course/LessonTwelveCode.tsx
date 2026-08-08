import { File, type LineAnnotation } from "@pierre/diffs/react";
import { Check, Clipboard, MessageSquareOff } from "lucide-react";
import { useMemo, useState } from "react";

const code = `from machine import Pin
from time import sleep_ms

# Physical selector positions 1-5 connect to GP2-GP6.
# Pin.PULL_UP keeps every input at 1 until the selector grounds it.
selector_inputs = (
    Pin(2, Pin.IN, Pin.PULL_UP),
    Pin(3, Pin.IN, Pin.PULL_UP),
    Pin(4, Pin.IN, Pin.PULL_UP),
    Pin(5, Pin.IN, Pin.PULL_UP),
    Pin(6, Pin.IN, Pin.PULL_UP),
)

mod_names = (
    "Rising saw",
    "Falling saw",
    "Triangle",
    "Sine",
    "Square",
)


def read_mod_type():
    # The selected input reads 0 because common A is connected to GND.
    for index, input_pin in enumerate(selector_inputs):
        if input_pin.value() == 0:
            return index

    # A break-before-make switch briefly selects nothing while turning.
    return None


last_mod_type = None

while True:
    mod_type = read_mod_type()

    if mod_type is not None and mod_type != last_mod_type:
        # Wait for the mechanical contact to settle, then verify it again.
        sleep_ms(10)

        if read_mod_type() == mod_type:
            last_mod_type = mod_type
            print("Mod type:", mod_type, mod_names[mod_type])

    sleep_ms(5)`;

type LineNote = {
  body: string;
};

const notes: Record<number, LineNote> = {
  7: { body: "All five inputs share the same pull-up wiring; only the code tells them apart." },
  26: { body: "Returns as soon as one input reads 0 — the selector only ever grounds one contact at a time." },
  38: { body: "A short settle-and-reread pair rejects the momentary None a break-before-make switch produces mid-turn." },
};

export default function LessonTwelveCode() {
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
