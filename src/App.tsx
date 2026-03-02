import { Button, VStack } from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import "./App.css";
import MicrobitSVG from "./assets/microbit-drawing.svg?react";
import { MicrobitDrawing } from "./microbitDrawing";

function App() {
  const microbitDrawing = useMemo(() => new MicrobitDrawing(), []);
  const handleButtonAMouseDown = useCallback(() => {
    microbitDrawing.highlightButtonA();
  }, [microbitDrawing]);
  const handleButtonAMouseUp = useCallback(() => {
    microbitDrawing.reset();
  }, [microbitDrawing]);
  const handleConnect = useCallback(async () => {
    // TODO: Follow documentation in https://github.com/microbit-foundation/microbit-connection
    // to connect and flash the meet the micro:bit hex using USB. 
    // Version to install: https://www.npmjs.com/package/@microbit/microbit-connection.
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
