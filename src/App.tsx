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
  return (
    <VStack width="100%" height="100%">
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
