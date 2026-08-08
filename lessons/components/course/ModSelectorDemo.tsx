import { useState } from "react";

const positions = [
  { position: 1, gpio: "GP2", value: 0, shape: "Rising saw" },
  { position: 2, gpio: "GP3", value: 1, shape: "Falling saw" },
  { position: 3, gpio: "GP4", value: 2, shape: "Triangle" },
  { position: 4, gpio: "GP5", value: 3, shape: "Sine" },
  { position: 5, gpio: "GP6", value: 4, shape: "Square" },
] as const;

export default function ModSelectorDemo() {
  const [selected, setSelected] = useState<(typeof positions)[number]["position"]>(1);
  const current = positions.find((p) => p.position === selected)!;

  return (
    <section className="course-mod-selector" aria-label="Mod Type selector simulator">
      <div className="course-mod-selector__positions">
        {positions.map((p) => (
          <button
            key={p.position}
            type="button"
            className={p.position === selected ? "course-mod-selector__position course-mod-selector__position--active" : "course-mod-selector__position"}
            onClick={() => setSelected(p.position)}
          >
            {p.position}
          </button>
        ))}
      </div>
      <output className="course-mod-selector__readout">
        <span>Common A → contact {current.position} → {current.gpio}</span>
        <strong>Mod type: {current.value} {current.shape}</strong>
      </output>
    </section>
  );
}
