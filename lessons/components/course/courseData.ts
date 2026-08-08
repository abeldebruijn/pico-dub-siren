export const docsBase = "/pico-dub-siren/lessons";

export const lessonOneDoneItems = [
  { id: "blink", label: "The external LED blinks with the 1 kΩ resistor installed." },
  { id: "identify-path", label: "You can identify GP15, resistor, LED anode, LED cathode, and GND." },
  { id: "change-speed", label: "You changed blink speed and explained why it changed." },
  { id: "usb-safety", label: "You unplugged USB before every wiring change." },
] as const;

export const lessonTwoDoneItems = [
  { id: "button-controls-led", label: "The LED is on only while the button is held." },
  { id: "button-sides", label: "You can identify the button’s two connected sides." },
  { id: "internal-pull-up", label: "You can explain why the input needs no external resistor." },
  { id: "callbacks", label: "You know why the callback names have no parentheses." },
  { id: "button-toggles-led", label: "One press turns the LED on; the next turns it off." },
  { id: "control-rules", label: "You can explain momentary versus toggle control." },
  { id: "release-omitted", label: "You know omitted release code means release has no assigned action." },
] as const;

export const lessonThreeDoneItems = [
  { id: "all-five-values", label: "The Shell reaches every integer from 0 through 4." },
  { id: "pot-pins", label: "You can identify both outside pins and the centre wiper." },
  { id: "adc0", label: "You know GP26 is both GPIO 26 and ADC0." },
  { id: "safe-voltage", label: "You used 3V3(OUT), never VBUS or VSYS, for the potentiometer." },
  { id: "button-gates-led", label: "The button gates the LED." },
  { id: "pot-controls-brightness", label: "The potentiometer changes brightness while the button is held." },
  { id: "safe-led-swap", label: "You safely swapped the red LED for yellow or green." },
  { id: "siren-controls", label: "You can connect this pattern to Trigger and Mod Amount." },
] as const;

export const lessonFourDoneItems = [
  { id: "led-off-released", label: "The LED stays off at every knob position while Trigger is released." },
  { id: "slow-end-counted", label: "You counted flashes at the slowest end of the knob." },
  { id: "rate-changes-live", label: "Turning the knob while holding Trigger changes the rate immediately." },
  { id: "release-stops-fast", label: "Releasing Trigger turns the LED off without waiting for the interval." },
  { id: "explain-interval", label: "You can explain why a smaller interval means a faster rate." },
  { id: "lfo-to-siren", label: "You can connect this LFO to the siren’s Mod Rate control." },
] as const;

export const lessonFiveDoneItems = [
  { id: "rate-changes-speed-only", label: "Turning Rate changes speed without changing peak brightness." },
  { id: "amount-changes-brightness-only", label: "Turning Amount changes brightness without changing speed." },
  { id: "trigger-stops-immediately", label: "Releasing Trigger still stops the LED immediately." },
  { id: "identify-adc0-adc1", label: "You can identify GP26/ADC0 and GP27/ADC1." },
  { id: "predict-swapped-wipers", label: "You predicted the symptom of swapped centre-wiper connections." },
] as const;

export const lessonSixDoneItems = [
  { id: "pitch-sweeps-range", label: "Pitch reaches roughly 100–1000 Hz turning clockwise." },
  { id: "three-way-independence", label: "Rate, Amount, and Pitch each change only their own property." },
  { id: "trigger-stays-responsive", label: "Trigger remains responsive while Pitch is read." },
  { id: "name-three-adc-pins", label: "You can name all three exposed ADC inputs and their assigned controls." },
  { id: "explain-smoothing", label: "You can explain why the low-pass filter was added." },
] as const;

export const lessonSevenDoneItems = [
  { id: "notch-and-pins", label: "The IC notch and all sixteen pin numbers make sense." },
  { id: "pitch-through-mux", label: "Pitch travels through pin 13 to pin 3 and GP28." },
  { id: "pitch-still-sweeps", label: "Pitch still reaches roughly 100–1000 Hz clockwise." },
  { id: "explain-000", label: "You can explain why selector state 000 chooses channel 0." },
  { id: "quiz-passed", label: "You scored full marks on the multiplexer quiz." },
] as const;

export const lessonEightDoneItems = [
  { id: "gp28-two-pots", label: "GP28 reads two different pots through the 4051." },
  { id: "gp18-controls-s0", label: "GP18 controls S0." },
  { id: "s1-s2-grounded", label: "S1 and S2 stay grounded." },
  { id: "pitch-controls-frequency", label: "Pitch controls printed frequency." },
  { id: "amount-controls-brightness", label: "Amount controls LED brightness." },
] as const;

export const lessonNineDoneItems = [
  { id: "explain-blocking", label: "You can explain why blocking sleeps slow the whole loop." },
  { id: "explain-scheduled", label: "You can explain why scheduled waits let other code keep running." },
  { id: "mux-still-works", label: "Pitch and Amount still work through the 4051." },
  { id: "flash-feels-faster", label: "The fastest LED flash feels less affected by mux reading." },
] as const;

export const lessonTenDoneItems = [
  { id: "explain-two-bits", label: "You can explain why two selector bits offer four combinations." },
  { id: "three-controls-through-common", label: "Pitch, Amount and Rate all travel through COMMON to GP28." },
  { id: "gp18-gp19-drive-s0-s1", label: "GP18 drives S0 and GP19 drives S1." },
  { id: "gp26-free", label: "GP26 is free." },
  { id: "controls-stay-separate", label: "All three controls keep their separate jobs." },
] as const;

export const lessonElevenDoneItems = [
  { id: "five-pots-share-gp28", label: "All five potentiometers share GP28." },
  { id: "feedback-on-ch3", label: "Feedback’s centre wiper reaches CH3 pin 12." },
  { id: "tempo-on-ch4", label: "Tempo’s centre wiper reaches CH4 pin 1." },
  { id: "gp18-gp19-gp20-drive-selectors", label: "GP18, GP19 and GP20 drive S0, S1 and S2." },
  { id: "explain-ch3-ch4-binary", label: "You know CH3 selects binary 011 and CH4 selects binary 100." },
  { id: "all-five-independent", label: "All five controls remain independent." },
] as const;

export const lessonTwelveDoneItems = [
  { id: "common-a-reaches-gnd", label: "Common A reaches GND." },
  { id: "contacts-reach-gp2-gp6", label: "Contacts 1–5 reach GP2–GP6 in order." },
  { id: "five-stable-mod-types", label: "The Shell prints five stable Mod Types, numbered 0–4." },
  { id: "explain-active-low", label: "You can explain why selected means 0." },
  { id: "common-c-unused", label: "Common C and contacts 6–10 remain disconnected." },
] as const;

export const lessonThirteenDoneItems = [
  { id: "dc-jack-empty", label: "The module's DC jack stayed empty." },
  { id: "vbus-powers-module", label: "Pico VBUS powered the module's 5V header input." },
  { id: "bck-lrck-din-wired", label: "BCK, LRCK, and DIN reached GP16, GP17, and GP18." },
  { id: "heard-three-tones", label: "You heard a low, middle, and high tone." },
  { id: "both-channels-tested", label: "Both left and right outputs were tested." },
] as const;

export const lessonFourteenDoneItems = [
  { id: "heard-five-pitches", label: "You heard all five pitch steps." },
  { id: "pitches-lasted-one-second", label: "Each pitch lasted approximately one second." },
  { id: "crackling-gone", label: "The repeated crackling disappeared." },
  { id: "explain-underrun", label: "You understand what an I²S buffer underrun is." },
  { id: "explain-prepare-before-play", label: "You understand why preparation happens before playback." },
] as const;

export const lessonFifteenDoneItems = [
  { id: "one-shared-pico", label: "The five-pot mux build and the I²S audio build share one Pico and one breadboard." },
  { id: "din-moved-gp21", label: "You can explain why DIN moved from GP18 to GP21." },
  { id: "rotary-on-breadboard", label: "The CK1050 rotary selector is wired onto the real breadboard, not just the schematic." },
  { id: "mux-led-stay-responsive", label: "The mux scan and LED stay responsive between tone plays." },
  { id: "heard-tone-on-press", label: "You heard the Mod-Type-selected tone play on a Trigger press." },
] as const;

export const lessons = [
  ["Make your first light blink", "Wire one safe LED path, then make the Pico pulse it with MicroPython."],
  ["Control the light with a button", "Compare momentary and toggle behavior with one button."],
  ["Read a turning knob", "Measure a potentiometer, then map it to LED brightness."],
  ["Control blink speed with a knob", "Use a knob to control modulation speed."],
  ["Control speed and brightness together", "Make two knobs control two different behaviours."],
  ["Add a pitch dial", "Add the pitch control that will shape the siren."],
  ["Route pitch through the switch chip", "Send pitch through the CD74HC4051 switch chip."],
  ["Share one Pico input between two dials", "Read two dials through one Pico analog input."],
  ["Keep timing responsive", "Keep the mux reading loop responsive."],
  ["Add a third dial to the switch chip", "Expand the switch chip to a third control."],
  ["Add feedback and tempo dials", "Finish the switch chip with feedback and tempo controls."],
  ["Read the Mod Type selector", "Wire a five-position rotary switch to select modulation shapes."],
  ["Hear three tones from a second Pico", "Wire a second Pico 2 to the RCA Module 13.2's DAC over I²S and hear three test tones."],
  ["Keep prepared tones playing", "Prepare tone blocks before playback starts so five pitches stream without crackling."],
  ["Merge both builds onto one Pico", "Combine the five-pot mux build and the I²S audio build on one shared Pico and breadboard."],
] as const;

export function lessonSlug(number: number) {
  return `lesson${number}`;
}
