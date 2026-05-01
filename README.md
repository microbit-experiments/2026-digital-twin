# micro:bit Digital Twin

A React + Vite app for connecting to a BBC micro:bit over WebUSB serial, mirroring the board in the browser, and flashing bundled demo programs directly from the UI.

The current version is centered on a guided demo workflow:

- connect to a micro:bit over USB
- flash a default all-input demo or a feature-specific demo
- watch the SVG board react to button, logo, gesture, and microphone events
- inspect accelerometer, magnetometer, and temperature data over time
- use the right panel to load demos, preview their behavior, and lock the current panel

## Current Features

- WebUSB serial connection through the browser
- In-browser flashing of bundled `.hex` demo programs
- Live SVG micro:bit twin with clickable Button A, Button B, logo, and microphone regions
- Event detection for:
  - Button A, Button B, and A+B
  - Logo touch / click / short press / long press
  - Loud / quiet microphone events
  - Tilt up, tilt down, tilt left, tilt right
  - Face up, face down
  - Freefall, shake, and 2g / 3g / 6g / 8g impact gestures
- Live charts for:
  - Accelerometer
  - Magnetometer
  - Temperature
- Right-side info panel with:
  - `Load` and `Restore`
  - animated 5x5 preview of the selected demo
  - lock / unlock control to freeze the current panel
  - direct MakeCode wiki link for the selected feature

## Demo Programs

The app ships with a default all-input demo plus a smaller set of focused interactive demos:

- `usb-serial-demo.hex`
  The default all-in-one demo. Emits buttons, logo, gestures, microphone, accelerometer, magnetometer, and temperature.

- `usb-serial-demo-simple-buttons.hex`
  Button demo where A moves a cross left, B moves it right, and A+B recenters it.

- `usb-serial-demo-simple-tilt.hex`
  Tilt demo with a moving dot for up, down, left, and right.

- `usb-serial-demo-simple-logo.hex`
  Logo demo with icon and number behavior.

- `usb-serial-demo-simple-microphone.hex`
  Microphone demo with sound-level bar behavior.

- `usb-serial-demo-simple-shake-impact.hex`
  Shake / freefall / impact demo with sparkle feedback.

Older per-action demo files are still present in `public/` and can be regenerated alongside the current demo set.

## Requirements

- Node.js and npm
- Chrome or Edge with WebUSB support
- BBC micro:bit V2 for logo touch and microphone features
- local development over `localhost`

## Getting Started

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev -- --host 127.0.0.1
```

Open:

```text
http://127.0.0.1:5173/
```

## Firmware Generation

The generated demo sources and firmware live in `public/`.

Scripts:

```bash
node scripts/build-default-demo.cjs
node scripts/build-simple-interaction-demos.cjs
```

These scripts write both `.hex` outputs and matching `.makecode.txt` source snapshots.

## Main App Structure

- `src/App.tsx`
  Main UI, USB connection flow, panel routing, input state, and chart layout.

- `src/components/InfoPanels.tsx`
  Right-side feature panel, animated demo previews, wiki links, and panel lock UI.

- `src/components/SensorChart.tsx`
  Accelerometer, magnetometer, and temperature chart rendering.

- `src/connectors/usb-serial-connector.ts`
  WebUSB serial connector used by the current app.

- `scripts/build-default-demo.cjs`
  Generates the default all-input demo firmware.

- `scripts/build-simple-interaction-demos.cjs`
  Generates the focused demo firmware set.

## Notes

- The app now uses WebUSB serial as the primary connection path.
- The right panel changes with detected input unless it is locked.
- Microphone focus is intentionally lower priority than direct physical inputs.
- The live status card returns to idle after a short pause.
