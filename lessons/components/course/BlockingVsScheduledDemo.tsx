import { useEffect, useRef, useState } from "react";

const TRACK_MS = 200;
const BLOCKING_INTERVAL_MS = 14;
const SCHEDULED_INTERVAL_MS = 1;
const SLOW_MOTION_MS = 4000;

function ticksAcrossTrack(intervalMs: number) {
  const count = Math.floor(TRACK_MS / intervalMs);
  return Array.from({ length: count + 1 }, (_, index) => (index * intervalMs) / TRACK_MS);
}

export default function BlockingVsScheduledDemo() {
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef(0);
  const frameRef = useRef(0);

  useEffect(() => {
    if (!running) return;

    startRef.current = performance.now();
    const step = (now: number) => {
      const loopMs = ((now - startRef.current) / SLOW_MOTION_MS) * TRACK_MS;
      setElapsedMs(loopMs % TRACK_MS);
      frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [running]);

  const playheadPercent = (elapsedMs / TRACK_MS) * 100;
  const blockingTicks = ticksAcrossTrack(BLOCKING_INTERVAL_MS);
  const scheduledTicks = ticksAcrossTrack(SCHEDULED_INTERVAL_MS);

  return (
    <section className="course-simulator" aria-labelledby="blocking-vs-scheduled-title">
      <div>
        <h3 id="blocking-vs-scheduled-title">Blocking sleep vs. a scheduled wait</h3>
      </div>
      <div className="course-simulator__body">
        <div className="course-timeline">
          <div className="course-timeline__row">
            <span className="course-timeline__label">
              Lesson 8 <code>sleep(0.002)</code>
              <small>checks LED timing every ~{BLOCKING_INTERVAL_MS} ms</small>
            </span>
            <div className="course-timeline__track">
              {blockingTicks.map((position) => (
                <span key={position} className="course-timeline__tick" style={{ left: `${position * 100}%` }} />
              ))}
              {running ? <span className="course-timeline__playhead" style={{ left: `${playheadPercent}%` }} /> : null}
            </div>
          </div>
          <div className="course-timeline__row">
            <span className="course-timeline__label">
              Lesson 9 <code>ticks_ms()</code> schedule
              <small>checks LED timing every ~{SCHEDULED_INTERVAL_MS} ms</small>
            </span>
            <div className="course-timeline__track course-timeline__track--dense">
              {scheduledTicks.map((position) => (
                <span key={position} className="course-timeline__tick course-timeline__tick--dense" style={{ left: `${position * 100}%` }} />
              ))}
              {running ? <span className="course-timeline__playhead" style={{ left: `${playheadPercent}%` }} /> : null}
            </div>
          </div>
        </div>
        <div className="course-simulator__controls">
          <button type="button" className="course-reset" onClick={() => setRunning((value) => !value)}>
            {running ? "Stop" : "Play in slow motion"}
          </button>
          <output>
            <code>200 ms of loop time</code>
            <strong>{Math.floor(TRACK_MS / BLOCKING_INTERVAL_MS)} blocking checks vs. {Math.floor(TRACK_MS / SCHEDULED_INTERVAL_MS)} scheduled checks</strong>
          </output>
        </div>
      </div>
    </section>
  );
}
