import { LessonOnePage } from "./lesson-001/LessonPage";
import { lessonOneContent } from "./lesson-001/content";
import type { LessonMeta } from "./types";

const titles = [
  "Make your first light blink",
  "Control the light with a button",
  "Read a turning knob",
  "Control blink speed with a knob",
  "Control speed and brightness together",
  "Add a pitch dial",
  "Route pitch through the switch chip",
  "Share one Pico input between two dials",
  "Keep timing responsive",
  "Add a third dial to the switch chip",
  "Add feedback and tempo dials",
  "Read the Mod Type selector",
  "Hear three tones from a second Pico",
  "Keep prepared tones playing",
  "Merge both builds onto one Pico",
];

const subtitles = [
  "Wire one safe LED path, then make the Pico pulse it with MicroPython.",
  "Compare momentary and toggle behavior with one button.",
  "Measure a potentiometer, then map it to LED brightness.",
  "Use a knob to control modulation speed.",
  "Make two knobs control two different behaviours.",
  "Add the pitch control that will shape the siren.",
  "Send pitch through the CD74HC4051 switch chip.",
  "Read two dials through one Pico analog input.",
  "Keep the mux reading loop responsive.",
  "Expand the switch chip to a third control.",
  "Finish the switch chip with feedback and tempo controls.",
  "Wire a five-position rotary switch to select modulation shapes.",
  "Wire a second Pico 2 to the RCA Module 13.2's DAC over I²S and hear three test tones.",
  "Prepare tone blocks before playback starts so five pitches stream without crackling.",
  "Combine the five-pot mux build and the I²S audio build on one shared Pico and breadboard.",
];

const doneItemIds = [
  ["blink", "identify-path", "change-speed", "usb-safety"],
  ["button-controls-led", "button-sides", "internal-pull-up", "callbacks", "button-toggles-led", "control-rules", "release-omitted"],
  ["all-five-values", "pot-pins", "adc0", "safe-voltage", "button-gates-led", "pot-controls-brightness", "safe-led-swap", "siren-controls"],
  ["led-off-released", "slow-end-counted", "rate-changes-live", "release-stops-fast", "explain-interval", "lfo-to-siren"],
  ["rate-changes-speed-only", "amount-changes-brightness-only", "trigger-stops-immediately", "identify-adc0-adc1", "predict-swapped-wipers"],
  ["pitch-sweeps-range", "three-way-independence", "trigger-stays-responsive", "name-three-adc-pins", "explain-smoothing"],
  ["notch-and-pins", "pitch-through-mux", "pitch-still-sweeps", "explain-000", "quiz-passed"],
  ["gp28-two-pots", "gp18-controls-s0", "s1-s2-grounded", "pitch-controls-frequency", "amount-controls-brightness"],
  ["explain-blocking", "explain-scheduled", "mux-still-works", "flash-feels-faster"],
  ["explain-two-bits", "three-controls-through-common", "gp18-gp19-drive-s0-s1", "gp26-free", "controls-stay-separate"],
  ["five-pots-share-gp28", "feedback-on-ch3", "tempo-on-ch4", "gp18-gp19-gp20-drive-selectors", "explain-ch3-ch4-binary", "all-five-independent"],
  ["common-a-reaches-gnd", "contacts-reach-gp2-gp6", "five-stable-mod-types", "explain-active-low", "common-c-unused"],
  ["dc-jack-empty", "vbus-powers-module", "bck-lrck-din-wired", "heard-three-tones", "both-channels-tested"],
  ["heard-five-pitches", "pitches-lasted-one-second", "crackling-gone", "explain-underrun", "explain-prepare-before-play"],
  ["one-shared-pico", "din-moved-gp21", "rotary-on-breadboard", "mux-led-stay-responsive", "heard-tone-on-press"],
];

export const lessons: LessonMeta[] = titles.map((title, index) => {
  const number = index + 1;
  const slug = `lesson-${String(number).padStart(3, "0")}`;
  const doneItems = doneItemIds[index].map((id) => ({ id, label: id }));

  if (number === 1) {
    return {
      number,
      slug,
      title,
      subtitle: subtitles[index],
      isMigrated: true,
      doneItems: lessonOneContent.doneItems,
      Component: LessonOnePage,
    };
  }

  return {
    number,
    slug,
    title,
    subtitle: subtitles[index],
    isMigrated: true,
    doneItems,
  };
});

export function getLessonBySlug(slug: string) {
  return lessons.find((lesson) => lesson.slug === slug);
}

export function getPreviousLesson(current: LessonMeta) {
  return lessons.find((lesson) => lesson.number === current.number - 1);
}

export function getNextLesson(current: LessonMeta) {
  return lessons.find((lesson) => lesson.number === current.number + 1);
}
