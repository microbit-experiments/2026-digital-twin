import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Badge, Box, Button, Divider, Heading, Stack, Text } from "@chakra-ui/react";

export type InfoPanelMode = "default" | "buttonA" | "buttonB" | "logo" | "shake";

type InfoPanelData = {
  title: string;
  label: string;
  description: string;
  docsUrl?: string;
  embedUrl?: string;
};

const infoPanels: Record<InfoPanelMode, InfoPanelData> = {
  default: {
    title: "Digital Twin",
    label: "Demo program information",
    description:
      "Connect the micro:bit and interact with it to see live button, logo, gesture, LED, and sensor updates.",
    docsUrl: "https://makecode.microbit.org/reference/input",
  },
  buttonA: {
    title: "Button A Pressed",
    label: "Button A down event detected",
    description:
      "Button A was pressed on the connected micro:bit. The reference below shows the MakeCode block, JavaScript, Python, examples, and simulator context.",
    docsUrl: "https://makecode.microbit.org/reference/input/on-button-pressed",
    embedUrl: "https://makecode.microbit.org/---docs#doc:/reference/input/on-button-pressed:blocks:live-en",
  },
  buttonB: {
    title: "Button B Pressed",
    label: "Button B down event detected",
    description:
      "Button B was pressed on the connected micro:bit. The reference below uses the same MakeCode input event with Button B selected.",
    docsUrl: "https://makecode.microbit.org/reference/input/on-button-pressed",
    embedUrl: "https://makecode.microbit.org/---docs#doc:/reference/input/on-button-pressed:blocks:live-en",
  },
  logo: {
    title: "Logo Pressed",
    label: "Logo touch event detected",
    description:
      "The micro:bit logo touch input was pressed. The reference below includes the block options, examples, and V2 hardware notes.",
    docsUrl: "https://makecode.microbit.org/reference/input/on-logo-event",
    embedUrl: "https://makecode.microbit.org/---docs#doc:/reference/input/on-logo-event:blocks:live-en",
  },
  shake: {
    title: "Shake Gesture",
    label: "Shake event detected",
    description:
      "The accelerometer detected a shake gesture. The reference below includes gesture options, blocks, examples, and simulator behavior.",
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

export function InfoPanelContent({ mode }: { mode: InfoPanelMode }) {
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
        <Badge colorScheme={mode === "default" ? "teal" : "purple"} mb={3}>
          {panel.label}
        </Badge>
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
    </Stack>
  );
}
