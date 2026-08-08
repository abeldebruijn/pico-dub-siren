import { BreadboardDiagram } from "./CircuitPath";

export const lessonThirteenSource = `breadboard Lesson13 rows 40 columns 9
chip Pico2 {
  height 20
  width 6
  color forest
  pin 21 GP16
  pin 22 GP17
  pin 24 GP18
  pin 38 GND
  pin 40 VBUS
} at R1

chip RcaModule {
  height 14
  width 4
  color orange
  pin 1 GND
  pin 22 BCK
  pin 23 DIN
  pin 24 LRCK
  pin 28 V5
} at R22

wire Pico2.GP16 --> RcaModule.BCK via RT-R20C5, RT-R28C5 color yellow saturation 18%
wire Pico2.GP17 --> RcaModule.LRCK via RT-R19C6, RT-R26C6 color cyan saturation 18%
wire Pico2.GP18 --> RcaModule.DIN via RT-R17C7, RT-R27C7 color green saturation 18%
wire Pico2.GND --> RcaModule.GND color blue saturation 12%
wire Pico2.VBUS --> RcaModule.V5 via RT-R1C8, RT-R22C8 color red saturation 18%`;

export default function LessonThirteenCircuit() {
  return (
    <BreadboardDiagram
      source={lessonThirteenSource}
      label="Lesson 13 breadboard: a separate Pico 2 sends five wires to the RCA Module 13.2's M-Bus header — GP16 physical pin 21 to BCK M-Bus pin 22, GP17 physical pin 22 to LRCK M-Bus pin 24, GP18 physical pin 24 to DIN M-Bus pin 23, GND physical pin 38 to module GND M-Bus pin 1, and VBUS physical pin 40 to module 5V M-Bus pin 28, with the module's own DC jack left empty"
      caption="Yellow: GP16 → BCK · cyan: GP17 → LRCK · green: GP18 → DIN · blue: GND → GND · red: VBUS → 5V"
    />
  );
}
