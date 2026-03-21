import { Button, HStack, VStack } from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import "./App.css";
import MicrobitSVG from "./assets/microbit-drawing.svg?react";
import { MicrobitDrawing } from "./utils/microbitDrawing";
import { createUniversalHexFlashDataSource, createWebUSBConnection } from "@microbit/microbit-connection";

function App() {
  const microbitDrawing = useMemo(() => new MicrobitDrawing(), []);
  const handleButtonAMouseDown = useCallback(() => {
    microbitDrawing.buttonA = true;
  }, [microbitDrawing]);
  const handleButtonAMouseUp = useCallback(() => {
    microbitDrawing.buttonA = false;
  }, [microbitDrawing]);
  const handleButtonBMouseDown = useCallback(() => {
    microbitDrawing.buttonB = true;
  }, [microbitDrawing]);
  const handleButtonBMouseUp = useCallback(() => {
    microbitDrawing.buttonB = false;
  }, [microbitDrawing]);
  const handleMicMouseDown = useCallback(() => {
    microbitDrawing.microphone = true;
  }, [microbitDrawing]);
  const handleMicMouseUp = useCallback(() => {
    microbitDrawing.microphone = false;
  }, [microbitDrawing]);
  const handleTemplateLedMouseDown = useCallback(() => {
    microbitDrawing.templateLed = true;
  }, [microbitDrawing]);
  const handleTemplateLedMouseUp = useCallback(() => {
    microbitDrawing.templateLed = false;
  }, [microbitDrawing]);
  const handleRandomLedMouseDown = useCallback(() => {
    const rand_id = Math.floor(Math.random() * 25);
    microbitDrawing.toggleLed(rand_id);
  }, [microbitDrawing]);
  const handleResetMouseDown = useCallback(() => {
    microbitDrawing.reset();
  }, [microbitDrawing]);

  const handleConnect = useCallback(async () => {
    const usb = createWebUSBConnection();
    await usb.connect();

    const response = await fetch("/Meet-the-microbit-for-microbit-V2.hex");
    const universalHexString = await response.text();

    await usb.flash(createUniversalHexFlashDataSource(universalHexString), {
      partial: true,
      progress: (percentage: number | undefined) => {
        console.log("Flashing: " + percentage);
      },
    });
  }, []);
  return (
    // TODO: User interface.
    <VStack width="100%" height="100%">
      <Button onClick={handleConnect}>Connect</Button>
      <MicrobitSVG width="400px" />

      <HStack>
        <Button
          onMouseDown={handleButtonAMouseDown}
          onMouseUp={handleButtonAMouseUp}
        >
          Button A
        </Button>
        <Button
          onMouseDown={handleButtonBMouseDown}
          onMouseUp={handleButtonBMouseUp}
        >
          Button B
        </Button>
        <Button
          onMouseDown={handleMicMouseDown}
          onMouseUp={handleMicMouseUp}
        >
          Mic
        </Button>
        <Button
          onMouseDown={handleTemplateLedMouseDown}
          onMouseUp={handleTemplateLedMouseUp}
        >
          Template Led
        </Button>
        <Button
          onMouseDown={handleRandomLedMouseDown}
        >
          Random LED
        </Button>
        <Button
          onMouseDown={handleResetMouseDown}
        >
          Reset
        </Button>

      </HStack>

    </VStack>
  );
}

export default App;
