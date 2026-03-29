import { Divider, Heading, Text } from "@chakra-ui/react";

export type InfoPanelMode = "default" | "buttonA" | "buttonB" | "logo" | "shake";

function DefaultInfoPanel() {
  return (
    <>
      <Heading size="md" mb={2} mx={6}>
        Digital Twin
      </Heading>
      <Divider mb={4} mx={6} />
      <Text color="gray.600" mx={6}>Demo Program Information</Text>
      <Text mt={2} color="gray.500" fontSize="sm" mx={6}>
        This project represents a digital twin of a bluetooth-connected Microbit.
      </Text>
    </>
  );
}

function ButtonAInfoPanel() {
  return (
    <>
      <Heading size="md" mb={2} mx={6}>
        Button A Pressed
      </Heading>
      <Divider mb={4} mx={6} />
      <Text color="gray.700" mx={6}>Button A down event detected.</Text>
      <Text mt={2} mb={6} color="gray.500" fontSize="sm" mx={6}>
        The Button A has been pressed. Here is some useful information regarding Button Presses:
      </Text>
      <iframe src="https://makecode.microbit.org/---docs#doc:/reference/input/on-button-pressed:blocks:live-en"></iframe>
    </>
  );
}

function ButtonBInfoPanel() {
  return (
    <>
      <Heading size="md" mb={2} mx={6}>
        Button B Pressed
      </Heading>
      <Divider mb={4} mx={6} />
      <Text color="gray.700" mx={6}>Button B down event detected.</Text>
      <Text mt={2} mb={6} color="gray.500" fontSize="sm" mx={6}>
        The Button B has been pressed. Here is some useful information regarding Button Presses:
      </Text>
      <iframe src="https://makecode.microbit.org/---docs#doc:/reference/input/on-button-pressed:blocks:live-en"></iframe>
    </>
  );
}

function ShakeInfoPanel() {
  return (
    <>
      <Heading size="md" mb={2} mx={6}>
        Shake Gesture
      </Heading>
      <Divider mb={4} mx={6} />
      <Text color="gray.700" mx={6}> A shake event was triggered.</Text>
      <Text mt={2} mb={6} color="gray.500" fontSize="sm" mx={6}>
        This Microbit was shaken. Here is some useful information regarding Shaking:
      </Text>
      <iframe src="https://makecode.microbit.org/---docs#doc:/reference/input/on-gesture:blocks:live-en"></iframe>
    </>
  );
}

function LogoInfoPanel() {
  return (
    <>
      <Heading size="md" mb={2} mx={6}>
        Logo Pressed
      </Heading>
      <Divider mb={4} mx={6} />
      <Text color="gray.700" mx={6}>Logo touch event detected.</Text>
      <Text mt={2} mb={6} color="gray.500" fontSize="sm" mx={6}>
        The Micro:bit logo was pressed. Here is some useful information regarding logo touch events:
      </Text>
      <iframe src="https://makecode.microbit.org/---docs#doc:/reference/input/on-logo-event:blocks:live-en"></iframe>
    </>
  );
}

export function InfoPanelContent({ mode }: { mode: InfoPanelMode }) {
  if (mode === "buttonA") return <ButtonAInfoPanel />;
  if (mode === "buttonB") return <ButtonBInfoPanel />;
  if (mode === "logo") return <LogoInfoPanel />;
  if (mode === "shake") return <ShakeInfoPanel />;
  return <DefaultInfoPanel />;
}
