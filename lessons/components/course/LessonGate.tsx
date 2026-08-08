import { LockKeyhole } from "lucide-react";
import type { ReactNode } from "react";
import {
  docsBase,
  lessonEightDoneItems,
  lessonElevenDoneItems,
  lessonFifteenDoneItems,
  lessonFiveDoneItems,
  lessonFourDoneItems,
  lessonNineDoneItems,
  lessonOneDoneItems,
  lessonSevenDoneItems,
  lessonFourteenDoneItems,
  lessonSixDoneItems,
  lessonTenDoneItems,
  lessonThirteenDoneItems,
  lessonThreeDoneItems,
  lessonTwelveDoneItems,
  lessonTwoDoneItems,
} from "./courseData";
import { isLessonDone, useCourseProgress } from "./progress";

const prerequisites = {
  "lesson-001": { items: lessonOneDoneItems, lesson: 1 },
  "lesson-002": { items: lessonTwoDoneItems, lesson: 2 },
  "lesson-003": { items: lessonThreeDoneItems, lesson: 3 },
  "lesson-004": { items: lessonFourDoneItems, lesson: 4 },
  "lesson-005": { items: lessonFiveDoneItems, lesson: 5 },
  "lesson-006": { items: lessonSixDoneItems, lesson: 6 },
  "lesson-007": { items: lessonSevenDoneItems, lesson: 7 },
  "lesson-008": { items: lessonEightDoneItems, lesson: 8 },
  "lesson-009": { items: lessonNineDoneItems, lesson: 9 },
  "lesson-010": { items: lessonTenDoneItems, lesson: 10 },
  "lesson-011": { items: lessonElevenDoneItems, lesson: 11 },
  "lesson-012": { items: lessonTwelveDoneItems, lesson: 12 },
  "lesson-013": { items: lessonThirteenDoneItems, lesson: 13 },
  "lesson-014": { items: lessonFourteenDoneItems, lesson: 14 },
  "lesson-015": { items: lessonFifteenDoneItems, lesson: 15 },
} as const;

export default function LessonGate({ children, prerequisite = "lesson-001" }: { children: ReactNode; prerequisite?: keyof typeof prerequisites }) {
  const progress = useCourseProgress();
  const requirement = prerequisites[prerequisite];
  const unlocked = isLessonDone(progress, prerequisite, requirement.items.map(({ id }) => id));

  if (unlocked) return <>{children}</>;

  return (
    <section className="course-gate">
      <LockKeyhole aria-hidden="true" />
      <p className="course-eyebrow">Lesson locked</p>
      <h1>Finish lesson {requirement.lesson} first</h1>
      <p>The next lesson becomes available after every “Done means” checkpoint in lesson {requirement.lesson} is checked.</p>
      <a href={`${docsBase}/lesson${requirement.lesson}.html`}>Return to lesson {requirement.lesson}</a>
    </section>
  );
}
