import { Check, LockKeyhole } from "lucide-react";
import { lessonEightDoneItems } from "./courseData";
import { isLessonDone, setChecklistItem, useCourseProgress } from "./progress";

export default function LessonEightChecklist() {
  const progress = useCourseProgress();
  const checked = progress["lesson-008"]?.checked ?? {};
  const done = isLessonDone(progress, "lesson-008", lessonEightDoneItems.map(({ id }) => id));

  return (
    <section className="course-checklist" aria-labelledby="lesson-eight-done-heading">
      <header><h2 id="lesson-eight-done-heading">Done means</h2></header>
      <div className="course-checklist__items">
        {lessonEightDoneItems.map((item) => {
          const isChecked = Boolean(checked[item.id]);
          return (
            <label className={isChecked ? "course-check course-check--done" : "course-check"} key={item.id}>
              <input type="checkbox" checked={isChecked} onChange={(event) => setChecklistItem("lesson-008", item.id, event.target.checked)} />
              <span aria-hidden="true">{isChecked ? <Check /> : null}</span>
              <strong>{item.label}</strong>
            </label>
          );
        })}
      </div>
      <footer className={done ? "course-unlock course-unlock--ready" : "course-unlock"} aria-live="polite">
        <LockKeyhole aria-hidden="true" />
        <div>
          <strong>{done ? "Lesson 8 complete" : "Next lesson is locked"}</strong>
          <p>{done ? "Every checkpoint is complete. You are ready to keep the mux reading loop responsive." : "Check every item above to finish this lesson."}</p>
        </div>
      </footer>
    </section>
  );
}
