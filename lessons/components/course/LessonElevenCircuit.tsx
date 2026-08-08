import { BreadboardDiagram } from "./CircuitPath";
import MuxPinoutDiagram from "./MuxPinoutDiagram";

export const lessonElevenSource = `breadboard Lesson11 rows 58 columns 9
chip Pico2 {
  height 20
  width 6
  color forest
  pin 18 GND
  pin 19 GP14
  pin 20 GP15
  pin 24 GP18
  pin 25 GP19
  pin 26 GP20
  pin 31 GP26 | ADC0
  pin 32 GP27 | ADC1
  pin 34 GP28 | ADC2
  pin 36 3V3
  pin 38 GND
} at R1

button S1 {
  on false
} at R21

resistor R1 from Pico2.GP15 to LT-R23C4 {
  value 1k
}

led D1 from R1.2 to RT-R23C2 {
  color red
  on true
}

potentiometer P1 {
  resistance 10k
  value 0.5
} at R26 outside

potentiometer P2 {
  resistance 10k
  value 0.5
} at R26 right outside

chip Mux4051 {
  height 8
  width 5
  color purple
  pin 1 CH4
  pin 2 CH6
  pin 3 COMMON
  pin 4 CH7
  pin 5 CH5
  pin 6 ENABLE
  pin 7 VEE
  pin 8 GND
  pin 9 S2
  pin 10 S1
  pin 11 S0
  pin 12 CH3
  pin 13 CH0
  pin 14 CH1
  pin 15 CH2
  pin 16 VCC
} at R32

potentiometer P3 {
  resistance 10k
  value 0.5
} at R42 outside

potentiometer P4 {
  resistance 10k
  value 0.5
} at R48 outside

potentiometer P5 {
  resistance 10k
  value 0.5
} at R48 right outside

capacitor C1 from Mux4051.VCC to Mux4051.GND {
  type ceramic
  capacitance 0.1
  displayed capacitance
}

wire Pico2.38 --> G color blue saturation 12%
wire D1.2 --> G color blue saturation 12%
wire Pico2.GP14 --> S1.left1 color purple saturation 18%
wire S1.right1 --> G color blue saturation 12%
wire Pico2.36 --> P color red saturation 18%
wire P1.3 --> P color red saturation 18%
wire P1.2 --> Mux4051.CH2 via LT-R31C6 color cyan saturation 18%
wire P1.1 --> G color blue saturation 12%
wire P2.3 --> P color red saturation 12%
wire P2.2 --> Mux4051.CH1 via RT-R27C7, RT-R34C7 color yellow saturation 18%
wire P2.1 --> G color grey saturation 18%
wire LP --> RP color red saturation 8%
wire LG --> RG color blue saturation 6%
wire P3.3 --> P color red saturation 18%
wire P3.1 --> G color blue saturation 12%
wire P3.2 --> Mux4051.CH0 via RT-R43C7, RT-R35C7 color green saturation 18%
wire P4.3 --> P color red saturation 18%
wire P4.1 --> G color blue saturation 12%
wire P4.2 --> Mux4051.CH3 via RT-R49C9, RT-R36C9 color purple saturation 24%
wire P5.3 --> P color red
wire P5.1 --> G color black
wire P5.2 --> Mux4051.CH4 via RT-R51C8, LT-R32C8 color orange
wire Mux4051.COMMON --> Pico2.GP28 via LT-R30C2, RT-R25C7, RT-R7C7 color orange saturation 18%
wire Pico2.GP18 --> Mux4051.S0 via RT-R37C5 color brown saturation 18%
wire Pico2.GP19 --> Mux4051.S1 via RT-R37C6 color purple
wire Pico2.GP20 --> Mux4051.S2 via RT-R39C8 color brown
wire Mux4051.ENABLE --> G color grey
wire Mux4051.VEE --> G color grey
wire Mux4051.VCC --> P color red saturation 18%
wire Mux4051.GND --> G color blue saturation 12%`;

export default function LessonElevenCircuit() {
  return (
    <BreadboardDiagram
      source={lessonElevenSource}
      label="Lesson 11 breadboard: a Feedback potentiometer's wiper connects to 4051 channel 3 pin 12, a Tempo potentiometer's wiper connects to channel 4 pin 1, and select pin S2 pin 9 moves from ground to GP20, joining S0 on GP18 and S1 on GP19"
      caption="Purple: Feedback wiper → CH3 (pin 12) · orange (pot wire): Tempo wiper → CH4 (pin 1) · brown: GP18 → S0, GP19 → S1, GP20 → S2"
      extraPinout={{
        id: "mux-pinout",
        buttonLabel: "View Mux pinout",
        source: "Texas Instruments CD74HC4051 datasheet",
        title: "CD74HC4051E pinout",
        content: <MuxPinoutDiagram />,
      }}
    />
  );
}
