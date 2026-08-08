import { useState } from "react";

const channels = [
  { channel: 0, control: "Pitch" },
  { channel: 1, control: "Amount" },
  { channel: 2, control: "Rate" },
  { channel: 3, control: "unused today" },
] as const;

export default function MuxBitCalculator() {
  const [channel, setChannel] = useState(0);
  const s0 = channel & 1;
  const s1 = (channel >> 1) & 1;
  const control = channels.find((row) => row.channel === channel)!.control;

  return (
    <section className="course-simulator" aria-labelledby="mux-bit-calculator-title">
      <div>
        <h3 id="mux-bit-calculator-title">Try the bit operations</h3>
      </div>
      <div className="course-simulator__body">
        <div className="course-led-stage">
          <output aria-live="polite">
            <small>Selects</small>
            CH{channel} · {control}
          </output>
        </div>
        <div className="course-simulator__controls">
          <div className="course-mux-bits" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            {channels.map((row) => (
              <button
                type="button"
                key={row.channel}
                className={row.channel === channel ? "course-mux-bit course-mux-bit--high" : "course-mux-bit"}
                onClick={() => setChannel(row.channel)}
                aria-pressed={row.channel === channel}
              >
                <span>CH{row.channel}</span>
                <strong>{row.channel}</strong>
              </button>
            ))}
          </div>
          <output>
            <code>channel &amp; 1</code>
            <strong>S0 = {s0}</strong>
          </output>
          <output>
            <code>(channel &gt;&gt; 1) &amp; 1</code>
            <strong>S1 = {s1}</strong>
          </output>
        </div>
      </div>
    </section>
  );
}
