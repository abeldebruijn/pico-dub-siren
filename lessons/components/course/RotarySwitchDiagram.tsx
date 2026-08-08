const usedPositions = [
  { position: 1, gpio: "GP2", color: "#6b46a8" },
  { position: 2, gpio: "GP3", color: "#2b7a8c" },
  { position: 3, gpio: "GP4", color: "#2f6b46" },
  { position: 4, gpio: "GP5", color: "#a35d1f" },
  { position: 5, gpio: "GP6", color: "#9c3565" },
] as const;

const unusedPositions = [6, 7, 8, 9, 10] as const;

const CENTER = 150;
const POSITION_RADIUS = 108;
const OUTER_RADIUS = 132;
const RING_OUTER = 96;
const RING_INNER = 60;
const HUB_RADIUS = 28;

function angleFor(slot: number) {
  // Slot 1 sits at the bottom; slots continue clockwise, matching the
  // moulded terminal order printed on the CK1050's front face.
  return (Math.PI / 2) + ((slot - 1) / 10) * 2 * Math.PI;
}

function pointFor(slot: number, radius: number) {
  const angle = angleFor(slot);
  return { x: CENTER + radius * Math.cos(angle), y: CENTER + radius * Math.sin(angle) };
}

export default function RotarySwitchDiagram() {
  return (
    <div className="course-rotary">
      <div className="course-rotary__header">
        <strong>Front view · shaft toward you</strong>
        <span>Rear view is mirrored.</span>
      </div>
      <svg viewBox="0 0 300 300" role="img" aria-label="CK1050 five-position rotary switch, front view, with common A wired to positions 1 through 5 and common C and positions 6 through 10 left unused">
        <circle cx={CENTER} cy={CENTER} r={OUTER_RADIUS} className="course-rotary__outline" />
        <circle cx={CENTER} cy={CENTER} r={RING_OUTER} className="course-rotary__ring" />
        <circle cx={CENTER} cy={CENTER} r={RING_INNER} className="course-rotary__inner" />
        <circle cx={CENTER} cy={CENTER} r={HUB_RADIUS} className="course-rotary__hub" />

        {usedPositions.map(({ position, color }) => {
          const { x, y } = pointFor(position, POSITION_RADIUS);
          return (
            <g key={position}>
              <circle cx={x} cy={y} r={22} fill={color} />
              <text x={x} y={y} className="course-rotary__label course-rotary__label--used">
                {position}
              </text>
            </g>
          );
        })}

        {unusedPositions.map((position) => {
          const { x, y } = pointFor(position, POSITION_RADIUS);
          return (
            <g key={position}>
              <circle cx={x} cy={y} r={22} className="course-rotary__unused" />
              <text x={x} y={y} className="course-rotary__label course-rotary__label--unused">
                {position}
              </text>
            </g>
          );
        })}

        <g transform={`translate(${CENTER - 22}, ${CENTER + 4})`}>
          <circle r={18} className="course-rotary__common course-rotary__common--a" />
          <text className="course-rotary__label course-rotary__label--used">A</text>
        </g>
        <g transform={`translate(${CENTER + 24}, ${CENTER - 20})`}>
          <circle r={18} className="course-rotary__unused" />
          <text className="course-rotary__label course-rotary__label--unused">C</text>
        </g>
      </svg>
      <dl className="course-rotary__legend">
        <div>
          <dt>Used</dt>
          <dd>A + 1 2 3 4 5</dd>
        </div>
        <div>
          <dt>Unused</dt>
          <dd>C, 6–10</dd>
        </div>
      </dl>
      <p className="course-rotary__footnote">Trust the moulded terminal labels when wiring, not a guessed clock position.</p>
    </div>
  );
}
