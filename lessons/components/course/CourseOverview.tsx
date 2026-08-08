import { Check, LockKeyhole, RotateCcw } from "lucide-react";
import {
  docsBase,
  lessonEightDoneItems,
  lessonElevenDoneItems,
  lessonFiveDoneItems,
  lessonFourDoneItems,
  lessonNineDoneItems,
  lessonOneDoneItems,
  lessonSevenDoneItems,
  lessonSixDoneItems,
  lessonTenDoneItems,
  lessonThreeDoneItems,
  lessonTwelveDoneItems,
  lessonTwoDoneItems,
  lessons,
  lessonSlug,
} from "./courseData";
import { clearProgress, isLessonDone, useCourseProgress } from "./progress";

export default function CourseOverview() {
  const progress = useCourseProgress();
  const lessonOneDone = isLessonDone(progress, "lesson-001", lessonOneDoneItems.map(({ id }) => id));
  const lessonTwoDone = isLessonDone(progress, "lesson-002", lessonTwoDoneItems.map(({ id }) => id));
  const lessonThreeDone = isLessonDone(progress, "lesson-003", lessonThreeDoneItems.map(({ id }) => id));
  const lessonFourDone = isLessonDone(progress, "lesson-004", lessonFourDoneItems.map(({ id }) => id));
  const lessonFiveDone = isLessonDone(progress, "lesson-005", lessonFiveDoneItems.map(({ id }) => id));
  const lessonSixDone = isLessonDone(progress, "lesson-006", lessonSixDoneItems.map(({ id }) => id));
  const lessonSevenDone = isLessonDone(progress, "lesson-007", lessonSevenDoneItems.map(({ id }) => id));
  const lessonEightDone = isLessonDone(progress, "lesson-008", lessonEightDoneItems.map(({ id }) => id));
  const lessonNineDone = isLessonDone(progress, "lesson-009", lessonNineDoneItems.map(({ id }) => id));
  const lessonTenDone = isLessonDone(progress, "lesson-010", lessonTenDoneItems.map(({ id }) => id));
  const lessonElevenDone = isLessonDone(progress, "lesson-011", lessonElevenDoneItems.map(({ id }) => id));
  const lessonTwelveDone = isLessonDone(progress, "lesson-012", lessonTwelveDoneItems.map(({ id }) => id));

  return (
    <section className="course-roadmap" aria-label="Course lessons">
      <header className="course-roadmap__header">
        <div>
          <p className="course-eyebrow">Pico Dub Siren</p>
          <h2>Twelve small circuits</h2>
          <p>Each lesson adds one useful control. Finish a lesson’s checklist to unlock the next circuit.</p>
        </div>
        {Object.keys(progress).length > 0 ? (
          <button type="button" className="course-reset" onClick={clearProgress}>
            <RotateCcw aria-hidden="true" /> Reset progress
          </button>
        ) : null}
      </header>

      <ol className="course-roadmap__list">
        {lessons.map(([title, subtitle], index) => {
          const number = index + 1;
          const slug = lessonSlug(number);
          const done = (number === 1 && lessonOneDone) || (number === 2 && lessonTwoDone) || (number === 3 && lessonThreeDone) || (number === 4 && lessonFourDone) || (number === 5 && lessonFiveDone) || (number === 6 && lessonSixDone) || (number === 7 && lessonSevenDone) || (number === 8 && lessonEightDone) || (number === 9 && lessonNineDone) || (number === 10 && lessonTenDone) || (number === 11 && lessonElevenDone) || (number === 12 && lessonTwelveDone);
          const available = number === 1 || (number === 2 && lessonOneDone) || (number === 3 && lessonTwoDone) || (number === 4 && lessonThreeDone) || (number === 5 && lessonFourDone) || (number === 6 && lessonFiveDone) || (number === 7 && lessonSixDone) || (number === 8 && lessonSevenDone) || (number === 9 && lessonEightDone) || (number === 10 && lessonNineDone) || (number === 11 && lessonTenDone) || (number === 12 && lessonElevenDone);
          const contentReady = number <= 12;
          const state = done ? "done" : available && contentReady ? "available" : "locked";
          const content = (
            <>
              <span className="course-roadmap__number">{String(number).padStart(2, "0")}</span>
              <span className="course-roadmap__copy">
                <strong>{title}</strong>
                <small>{subtitle}</small>
              </span>
              <span className={`course-roadmap__state course-roadmap__state--${state}`}>
                {done ? <Check aria-hidden="true" /> : state === "locked" ? <LockKeyhole aria-hidden="true" /> : null}
                {done ? "Done" : state === "available" ? (number === 1 ? "Start" : "Unlocked") : "Locked"}
              </span>
            </>
          );

          return (
            <li key={slug}>
              {available && contentReady ? (
                <a href={`${docsBase}/${slug}.html`} className="course-roadmap__lesson">
                  {content}
                </a>
              ) : (
                <div className="course-roadmap__lesson course-roadmap__lesson--locked" aria-disabled="true">
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
