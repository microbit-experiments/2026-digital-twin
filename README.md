# micro:bit Digital Twin

A React and Vite web app that visualises a connected BBC micro:bit as a digital twin. The app connects to a micro:bit over Web Bluetooth, mirrors live board state, and shows input, gesture, microphone, LED, and sensor activity in the browser.

## Features

- Connect to a micro:bit using `@microbit/microbit-connection`
- Flash the demo firmware from the browser over USB
- Show a live SVG micro:bit with button, logo, microphone, and LED state
- Detect detailed input behaviours:
  - Button A, Button B, and A+B events
  - Logo touch events
  - Pressed, released, click, long click, hold, double click, short press, and long press
- Detect microphone sound events:
  - Loud
  - Quiet
- Detect gesture events:
  - Tilt up, tilt down, tilt left, tilt right
  - Face up, face down
  - Freefall
  - Shake
- Plot accelerometer and magnetometer readings
- Open contextual MakeCode reference panels from detected events or by clicking parts of the micro:bit drawing

## Requirements

- Node.js and npm
- A browser with Web Bluetooth support, such as Chrome or Edge
- A BBC micro:bit V2 for logo touch and microphone features
- HTTPS or localhost. Web Bluetooth works on `localhost` during development.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev -- --host 127.0.0.1
```

Open the local URL printed by Vite, usually:

```text
http://127.0.0.1:5173/
```

## Demo Firmware

Use the **Flash Demo** button in the app to flash the bundled demo hex to a micro:bit over USB. The running micro:bit program must raise the expected events for the browser to receive them.

The app fetches the firmware from:

```text
public/Meet-the-microbit-for-microbit-V2.hex
```

## Event Handling

The Bluetooth connector is implemented in:

```text
src/connectors/bluetooth-connector.ts
```

The shared connector contract is in:

```text
src/types/microbit-connector.ts
```

The main UI registers event handlers in:

```text
src/App.tsx
```

The latest input display separates each detection into two parts:

- **Component**: the source, such as Button A, Logo, Microphone, or Gesture
- **Event**: the behaviour, such as Pressed, Hold, Loud, or Tilt left

## Useful Scripts

Run a production build:

```bash
npm run build
```

Run ESLint:

```bash
npm run lint
```

Preview the production build:

```bash
npm run preview
```

## Current Notes

- `npm run build` should pass.
- `npm run lint` currently reports pre-existing issues in parts of the codebase that are not required to run the app.
- Web Bluetooth device selection requires a direct user gesture, so connect/flash flows must be started from browser button clicks.
- Microphone and logo events require micro:bit V2 hardware.
