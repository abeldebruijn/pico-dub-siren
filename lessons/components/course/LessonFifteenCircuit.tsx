import { BreadboardDiagram } from "./CircuitPath";
import MuxPinoutDiagram from "./MuxPinoutDiagram";

export const lessonFifteenSource = `breadboard Lesson15 rows 80 columns 16
chip Pico2 {
  height 20
  width 6
  color forest
  pin 4 GP2
  pin 5 GP3
  pin 6 GP4
  pin 7 GP5
  pin 9 GP6
  pin 18 GND
  pin 19 GP14
  pin 20 GP15
  pin 21 GP16
  pin 22 GP17
  pin 24 GP18
  pin 25 GP19
  pin 26 GP20
  pin 27 GP21
  pin 31 GP26 | ADC0
  pin 32 GP27 | ADC1
  pin 34 GP28 | ADC2
  pin 36 3V3
  pin 38 GND
  pin 40 VBUS
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

chip ModSwitch {
  height 6
  width 3
  color grey
  pin 1 A
  pin 2 CONTACT1
  pin 3 CONTACT2
  pin 4 CONTACT3
  pin 5 CONTACT4
  pin 6 CONTACT5
  pin 7 C
  pin 8 CONTACT6
  pin 9 CONTACT7
  pin 10 CONTACT8
  pin 11 CONTACT9
  pin 12 CONTACT10
} at R55

chip RcaModule {
  height 14
  width 4
  color orange
  pin 1 GND
  pin 22 BCK
  pin 23 DIN
  pin 24 LRCK
  pin 28 V5
} at R64

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
wire Mux4051.GND --> G color blue saturation 12%
wire ModSwitch.A --> G color blue saturation 12%
wire Pico2.GP2 --> ModSwitch.CONTACT1 via LT-R4C10, LT-R56C10 color #6b46a8
wire Pico2.GP3 --> ModSwitch.CONTACT2 via LT-R5C11, LT-R57C11 color #2b7a8c
wire Pico2.GP4 --> ModSwitch.CONTACT3 via LT-R6C12, LT-R58C12 color #2f6b46
wire Pico2.GP5 --> ModSwitch.CONTACT4 via LT-R7C13, LT-R59C13 color #a35d1f
wire Pico2.GP6 --> ModSwitch.CONTACT5 via LT-R9C14, LT-R60C14 color #9c3565
wire Pico2.GP16 --> RcaModule.BCK via RT-R20C11, RT-R70C11 color yellow saturation 18%
wire Pico2.GP17 --> RcaModule.LRCK via RT-R19C12, RT-R68C12 color cyan saturation 18%
wire Pico2.GP21 --> RcaModule.DIN via RT-R14C13, RT-R69C13 color green saturation 18%
wire Pico2.GND --> RcaModule.GND via LT-R18C15, LT-R64C15 color blue saturation 12%
wire Pico2.VBUS --> RcaModule.V5 via RT-R1C14, RT-R64C14 color red saturation 18%`;

export default function LessonFifteenCircuit() {
  return (
    <BreadboardDiagram
      source={lessonFifteenSource}
      label="Lesson 15 breadboard: the complete lesson 11 five-pot mux circuit plus a CK1050 rotary switch wired with common A to GND and contacts 1-5 to GP2 through GP6, plus an RCA Module 13.2 wired with GP16 to BCK, GP17 to LRCK, GP21 to DIN, GND to GND, and VBUS to 5V — all on the one shared Pico 2"
      caption="Purple/teal/green/orange/pink: rotary contacts 1-5 → GP2-GP6 · blue: common A → GND · yellow: GP16 → BCK · cyan: GP17 → LRCK · green: GP21 → DIN (not GP18) · blue: GND → GND · red: VBUS → 5V"
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
