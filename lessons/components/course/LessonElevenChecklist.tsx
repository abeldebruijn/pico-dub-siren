import { Check, LockKeyhole } from "lucide-react";
import { lessonElevenDoneItems } from "./courseData";
import { isLessonDone, setChecklistItem, useCourseProgress } from "./progress";

export default function LessonElevenChecklist() {
  const progress = useCourseProgress();
  const checked = progress["lesson-011"]?.checked ?? {};
  const done = isLessonDone(progress, "lesson-011", lessonElevenDoneItems.map(({ id }) => id));

  return (
    <section className="course-checklist" aria-labelledby="lesson-eleven-done-heading">
      <header><h2 id="lesson-eleven-done-heading">Done means</h2></header>
      <div className="course-checklist__items">
        {lessonElevenDoneItems.map((item) => {
          const isChecked = Boolean(checked[item.id]);
          return (
            <label className={isChecked ? "course-check course-check--done" : "course-check"} key={item.id}>
              <input type="checkbox" checked={isChecked} onChange={(event) => setChecklistItem("lesson-011", item.id, event.target.checked)} />
              <span aria-hidden="true">{isChecked ? <Check /> : null}</span>
              <strong>{item.label}</strong>
            </label>
          );
        })}
      </div>
      <footer className={done ? "course-unlock course-unlock--ready" : "course-unlock"} aria-live="polite">
        <LockKeyhole aria-hidden="true" />
        <div>
          <strong>{done ? "Lesson 11 complete" : "Next lesson is locked"}</strong>
          <p>{done ? "Every checkpoint is complete. All five dub siren controls are wired." : "Check every item above to finish this lesson."}</p>
        </div>
      </footer>
    </section>
  );
}
