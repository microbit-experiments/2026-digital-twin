import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Box, Button, Divider, Heading, Stack, Text } from "@chakra-ui/react";

export type InfoPanelMode =
  | "default"
  | "buttonA"
  | "buttonB"
  | "buttonAB"
  | "logo"
  | "microphone"
  | "shake"
  | "tiltLeft"
  | "tiltRight"
  | "tiltUpDown"
  | "faceUp"
  | "faceDown"
  | "freefall"
  | "accel2g"
  | "accel3g"
  | "accel6g"
  | "accel8g";

type InfoPanelData = {
  title: string;
  description: string;
  docsUrl?: string;
  embedUrl?: string;
};

export type DemoProgram = {
  id: string;
  title: string;
  description: string;
  hexPath: string;
  supportedModes?: InfoPanelMode[];
};

const infoPanels: Record<InfoPanelMode, InfoPanelData> = {
  default: {
    title: "Digital Twin",
    description:
      "Connect the micro:bit and interact with it to see live button, logo, gesture, LED, and sensor updates.",
    docsUrl: "https://makecode.microbit.org/reference/input",
  },
  buttonA: {
    title: "Button A Pressed",
    description:
      "Button A was pressed on the connected micro:bit. The reference below shows the MakeCode block, JavaScript, Python, examples, and simulator context.",
    docsUrl: "https://makecode.microbit.org/reference/input/on-button-pressed",
    embedUrl: "https://makecode.microbit.org/---docs#doc:/reference/input/on-button-pressed:blocks:live-en",
  },
  buttonB: {
    title: "Button B Pressed",
    description:
      "Button B was pressed on the connected micro:bit. The reference below uses the same MakeCode input event with Button B selected.",
    docsUrl: "https://makecode.microbit.org/reference/input/on-button-pressed",
    embedUrl: "https://makecode.microbit.org/---docs#doc:/reference/input/on-button-pressed:blocks:live-en",
  },
  logo: {
    title: "Logo Pressed",
    description:
      "The micro:bit logo touch input was pressed. The reference below includes the block options, examples, and V2 hardware notes.",
    docsUrl: "https://makecode.microbit.org/reference/input/on-logo-event",
    embedUrl: "https://makecode.microbit.org/---docs#doc:/reference/input/on-logo-event:blocks:live-en",
  },
  buttonAB: {
    title: "Button A+B Pressed",
    description:
      "Both buttons were pressed together on the connected micro:bit. See the MakeCode reference for combined button input handling.",
    docsUrl: "https://makecode.microbit.org/reference/input/on-button-pressed",
    embedUrl: "https://makecode.microbit.org/---docs#doc:/reference/input/on-button-pressed:blocks:live-en",
  },
  microphone: {
    title: "Microphone Sound",
    description:
      "The micro:bit microphone detected a loud or quiet sound event. The reference below includes sound event options and V2 hardware notes.",
    docsUrl: "https://makecode.microbit.org/reference/input/on-sound",
    embedUrl: "https://makecode.microbit.org/---docs#doc:/reference/input/on-sound:blocks:live-en",
  },
  shake: {
    title: "Shake Gesture",
    description:
      "The accelerometer detected a shake gesture. The reference below includes gesture options, blocks, examples, and simulator behavior.",
    docsUrl: "https://makecode.microbit.org/reference/input/on-gesture",
    embedUrl: "https://makecode.microbit.org/---docs#doc:/reference/input/on-gesture:blocks:live-en",
  },
  tiltLeft: {
    title: "Tilt Left Gesture",
    description:
      "The accelerometer detected a tilt-left gesture. The reference below shows gesture thresholds and handler options.",
    docsUrl: "https://makecode.microbit.org/reference/input/on-gesture",
    embedUrl: "https://makecode.microbit.org/---docs#doc:/reference/input/on-gesture:blocks:live-en",
  },
  tiltRight: {
    title: "Tilt Right Gesture",
    description:
      "The accelerometer detected a tilt-right gesture. The reference below shows gesture thresholds and handler options.",
    docsUrl: "https://makecode.microbit.org/reference/input/on-gesture",
    embedUrl: "https://makecode.microbit.org/---docs#doc:/reference/input/on-gesture:blocks:live-en",
  },
  tiltUpDown: {
    title: "Tilt Up / Down Gesture",
    description:
      "The micro:bit reported tilt-up or tilt-down movement events. This mode reuses the same MakeCode gesture API and can be filtered on event type.",
    docsUrl: "https://makecode.microbit.org/reference/input/on-gesture",
    embedUrl: "https://makecode.microbit.org/---docs#doc:/reference/input/on-gesture:blocks:live-en",
  },
  faceUp: {
    title: "Face Up Gesture",
    description:
      "The micro:bit was moved face-up. Use this panel as a quick reference for orientation-sensitive actions.",
    docsUrl: "https://makecode.microbit.org/reference/input/on-gesture",
    embedUrl: "https://makecode.microbit.org/---docs#doc:/reference/input/on-gesture:blocks:live-en",
  },
  faceDown: {
    title: "Face Down Gesture",
    description:
      "The micro:bit was moved face-down. The reference below includes equivalent MakeCode gesture configuration.",
    docsUrl: "https://makecode.microbit.org/reference/input/on-gesture",
    embedUrl: "https://makecode.microbit.org/---docs#doc:/reference/input/on-gesture:blocks:live-en",
  },
  freefall: {
    title: "Freefall Gesture",
    description:
      "The micro:bit detected a freefall gesture. Use this for gravity-freefall or drop-style interactions.",
    docsUrl: "https://makecode.microbit.org/reference/input/on-gesture",
    embedUrl: "https://makecode.microbit.org/---docs#doc:/reference/input/on-gesture:blocks:live-en",
  },
  accel2g: {
    title: "2g Threshold Gesture",
    description:
      "Acceleration crossed the 2g threshold. The reference below shows how to respond to high-force events.",
    docsUrl: "https://makecode.microbit.org/reference/input/on-gesture",
    embedUrl: "https://makecode.microbit.org/---docs#doc:/reference/input/on-gesture:blocks:live-en",
  },
  accel3g: {
    title: "3g Threshold Gesture",
    description:
      "Acceleration crossed the 3g threshold. Use this when stronger shocks should trigger logic.",
    docsUrl: "https://makecode.microbit.org/reference/input/on-gesture",
    embedUrl: "https://makecode.microbit.org/---docs#doc:/reference/input/on-gesture:blocks:live-en",
  },
  accel6g: {
    title: "6g Threshold Gesture",
    description:
      "Acceleration crossed the 6g threshold. The reference below covers the high-acceleration event handler.",
    docsUrl: "https://makecode.microbit.org/reference/input/on-gesture",
    embedUrl: "https://makecode.microbit.org/---docs#doc:/reference/input/on-gesture:blocks:live-en",
  },
  accel8g: {
    title: "8g Threshold Gesture",
    description:
      "Acceleration crossed the 8g threshold. Useful for crash/impact-style demo behavior.",
    docsUrl: "https://makecode.microbit.org/reference/input/on-gesture",
    embedUrl: "https://makecode.microbit.org/---docs#doc:/reference/input/on-gesture:blocks:live-en",
  },
};

export function getInfoPanelTitle(mode: InfoPanelMode) {
  return infoPanels[mode].title;
}

function MakeCodeReferenceFrame({ panel }: { panel: InfoPanelData }) {
  if (!panel.embedUrl) {
    return (
      <Box
        border="1px solid"
        borderColor="gray.200"
        borderRadius="8px"
        bg="gray.50"
        px={4}
        py={4}
      >
        <Text color="gray.600" fontSize="sm">
          Select an input event to show the matching MakeCode reference and interactive micro:bit demo.
        </Text>
      </Box>
    );
  }

  return (
    <Box
      border="1px solid"
      borderColor="gray.200"
      borderRadius="8px"
      overflow="hidden"
      bg="white"
      boxShadow="0 8px 18px rgba(15, 23, 42, 0.06)"
    >
      <Box px={4} py={3} borderBottom="1px solid" borderColor="gray.200" bg="gray.50">
        <Heading size="xs" mb={1}>
          MakeCode reference
        </Heading>
        <Text color="gray.600" fontSize="sm">
          Blocks, code examples, and the interactive micro:bit simulator.
        </Text>
      </Box>
      <Box
        as="iframe"
        title={`${panel.title} MakeCode reference`}
        src={panel.embedUrl}
        w="100%"
        h={{ base: "560px", md: "680px" }}
        border={0}
        display="block"
      />
    </Box>
  );
}

interface InfoPanelContentProps {
  mode: InfoPanelMode;
  demoPrograms?: DemoProgram[];
  isFlashing?: boolean;
  flashingDemoId?: string | null;
  onFlashDemo?: (demo: DemoProgram) => void;
}

export function InfoPanelContent({
  mode,
  demoPrograms,
  isFlashing = false,
  flashingDemoId = null,
  onFlashDemo,
}: InfoPanelContentProps) {
  const panel = infoPanels[mode];

  return (
    <Stack spacing={5} px={6} py={6}>
      <Box>
        <Heading size="md" mb={2}>
          {panel.title}
        </Heading>
        <Divider />
      </Box>

      <Box>
        <Text color="gray.600" fontSize="sm">
          {panel.description}
        </Text>
      </Box>

      <MakeCodeReferenceFrame panel={panel} />

      {panel.docsUrl && (
        <Button
          as="a"
          href={panel.docsUrl}
          target="_blank"
          rel="noreferrer"
          rightIcon={<ExternalLinkIcon />}
          colorScheme="teal"
          variant="outline"
          alignSelf="flex-start"
        >
          Open full docs
        </Button>
      )}

      {demoPrograms && demoPrograms.length > 0 && (
        <Box>
          <Divider />
          <Heading size="sm" mt={5}>
            Demo programs
          </Heading>
          <Text color="gray.600" fontSize="sm" mb={3}>
            Flash one of these demo programs to test one input path at a time.
          </Text>
          <Stack spacing={3}>
            {demoPrograms.map((demo) => (
              <Box
                key={demo.id}
                border="1px solid"
                borderColor="gray.200"
                borderRadius="8px"
                p={3}
              >
                <Text fontWeight="semibold" fontSize="sm">
                  {demo.title}
                </Text>
                <Text color="gray.600" fontSize="sm" mt={1} mb={2}>
                  {demo.description}
                </Text>
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="blue"
                  isLoading={isFlashing && flashingDemoId === demo.id}
                  isDisabled={isFlashing}
                  onClick={() => onFlashDemo?.(demo)}
                >
                  Send this demo
                </Button>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  );
}
