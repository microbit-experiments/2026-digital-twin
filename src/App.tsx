import { Button, VStack } from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import "./App.css";
import MicrobitSVG from "./assets/microbit-drawing.svg?react";
import { MicrobitDrawing } from "./microbitDrawing";
import { createUniversalHexFlashDataSource, createWebUSBConnection } from "@microbit/microbit-connection"

function App() {
  const microbitDrawing = useMemo(() => new MicrobitDrawing(), []);
  const handleButtonAMouseDown = useCallback(() => {
    microbitDrawing.highlightButtonA();
  }, [microbitDrawing]);
  const handleButtonAMouseUp = useCallback(() => {
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
      <Button
        onMouseDown={handleButtonAMouseDown}
        onMouseUp={handleButtonAMouseUp}
      >
        Button A
      </Button>
    </VStack>
  );
}

export default App;
