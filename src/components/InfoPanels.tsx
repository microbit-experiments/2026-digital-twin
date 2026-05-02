import { ChevronDownIcon, ChevronUpIcon, ExternalLinkIcon, LockIcon, RepeatIcon, UnlockIcon } from "@chakra-ui/icons";
import { Box, Button, Collapse, Divider, Flex, Heading, IconButton, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";

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
  | "tiltUp"
  | "tiltDown"
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
  wikiUrl: string;
};

export type DemoProgram = {
  id: string;
  title: string;
  description: string;
  hexPath: string;
  supportedModes?: InfoPanelMode[];
};

type MiniPreview = {
  frames: number[][];
  accent: string;
  glow: string;
};

function cell(x: number, y: number) {
  if (x < 0 || x > 4 || y < 0 || y > 4) {
    return null;
  }

  return y * 5 + x;
}

function crossAt(x: number, y: number): number[] {
  return [cell(x, y), cell(x - 1, y), cell(x + 1, y), cell(x, y - 1), cell(x, y + 1)].filter(
    (value): value is number => value !== null,
  );
}

function dotAt(x: number, y: number): number[] {
  const value = cell(x, y);
  return value === null ? [] : [value];
}

function barLevel(level: number): number[] {
  const safeLevel = Math.max(0, Math.min(5, level));
  const active: number[] = [];
  const columns = [1, 2, 3];

  for (let row = 4; row >= 5 - safeLevel; row--) {
    for (const column of columns) {
      const value = cell(column, row);
      if (value !== null) {
        active.push(value);
      }
    }
  }

  return active;
}

function getMiniPreview(mode: InfoPanelMode): MiniPreview {
  if (mode === "buttonA") {
    return {
      frames: [crossAt(2, 2), crossAt(1, 2), crossAt(2, 2), crossAt(0, 2), crossAt(2, 2)],
      accent: "#14b8a6",
      glow: "rgba(20, 184, 166, 0.45)",
    };
  }

  if (mode === "buttonB") {
    return {
      frames: [crossAt(2, 2), crossAt(3, 2), crossAt(2, 2), crossAt(4, 2), crossAt(2, 2)],
      accent: "#14b8a6",
      glow: "rgba(20, 184, 166, 0.45)",
    };
  }

  if (mode === "buttonAB") {
    return {
      frames: [crossAt(1, 2), crossAt(2, 2), crossAt(3, 2), crossAt(2, 2)],
      accent: "#14b8a6",
      glow: "rgba(20, 184, 166, 0.45)",
    };
  }

  if (mode === "logo") {
    return {
      frames: [
        [6, 7, 8, 11, 13, 16, 17, 18],
        [0, 1, 2, 3, 4, 9, 14, 19, 24],
        [1, 2, 3, 9, 12, 15, 21, 22, 23],
        [1, 2, 3, 9, 11, 12, 13, 19, 21, 22, 23],
        [2, 7, 12, 17, 22],
        [6, 7, 8, 11, 13, 16, 18, 21, 23],
      ],
      accent: "#f59e0b",
      glow: "rgba(245, 158, 11, 0.45)",
    };
  }

  if (mode === "microphone") {
    return {
      frames: [[], barLevel(1), barLevel(2), barLevel(3), barLevel(4), barLevel(5), barLevel(4), []],
      accent: "#06b6d4",
      glow: "rgba(6, 182, 212, 0.45)",
    };
  }

  if (mode === "tiltLeft") {
    return {
      frames: [dotAt(2, 2), dotAt(1, 2), dotAt(0, 2), dotAt(1, 2), dotAt(2, 2)],
      accent: "#22c55e",
      glow: "rgba(34, 197, 94, 0.45)",
    };
  }

  if (mode === "tiltRight") {
    return {
      frames: [dotAt(2, 2), dotAt(3, 2), dotAt(4, 2), dotAt(3, 2), dotAt(2, 2)],
      accent: "#22c55e",
      glow: "rgba(34, 197, 94, 0.45)",
    };
  }

  if (mode === "tiltUp") {
    return {
      frames: [dotAt(2, 2), dotAt(2, 1), dotAt(2, 0), dotAt(2, 1), dotAt(2, 2)],
      accent: "#22c55e",
      glow: "rgba(34, 197, 94, 0.45)",
    };
  }

  if (mode === "tiltDown") {
    return {
      frames: [dotAt(2, 2), dotAt(2, 3), dotAt(2, 4), dotAt(2, 3), dotAt(2, 2)],
      accent: "#22c55e",
      glow: "rgba(34, 197, 94, 0.45)",
    };
  }

  if (mode === "faceUp" || mode === "faceDown") {
    return {
      frames: [dotAt(2, 2), dotAt(2, 1), dotAt(2, 2)],
      accent: "#22c55e",
      glow: "rgba(34, 197, 94, 0.45)",
    };
  }

  if (
    mode === "shake" ||
    mode === "freefall" ||
    mode === "accel2g" ||
    mode === "accel3g" ||
    mode === "accel6g" ||
    mode === "accel8g"
  ) {
    return {
      frames: [
        crossAt(2, 2),
        [0, 4, 12, 20, 24],
        [2, 6, 18, 22, 23],
        [4, 10, 12, 14, 24],
        crossAt(2, 2),
      ],
      accent: "#ef4444",
      glow: "rgba(239, 68, 68, 0.45)",
    };
  }

  return {
    frames: [[6, 8, 15, 19, 21, 22, 23]],
    accent: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.45)",
  };
}

function getWikiEmbedUrl(wikiUrl: string) {
  try {
    const url = new URL(wikiUrl);

    if (url.hostname === "makecode.microbit.org") {
      const docPath = url.pathname.replace(/\/$/, "");
      return `https://makecode.microbit.org/---docs#doc:${docPath}:blocks:live-en`;
    }
  } catch {
    return wikiUrl;
  }

  return wikiUrl;
}

const infoPanels: Record<InfoPanelMode, InfoPanelData> = {
  default: {
    title: "Digital Twin",
    description: "All inputs and sensors stream from one program.",
    wikiUrl: "https://makecode.microbit.org/reference/input",
  },
  buttonA: {
    title: "Button A",
    description: "A moves a cross left.\nB moves it right.\n\nA+B recenters it.",
    wikiUrl: "https://makecode.microbit.org/reference/input/on-button-pressed",
  },
  buttonB: {
    title: "Button B",
    description: "A moves a cross left.\nB moves it right.\n\nA+B recenters it.",
    wikiUrl: "https://makecode.microbit.org/reference/input/on-button-pressed",
  },
  logo: {
    title: "Logo",
    description: "Tap for an icon. Hold for a number.",
    wikiUrl: "https://makecode.microbit.org/reference/input/on-logo-event",
  },
  buttonAB: {
    title: "Buttons A+B",
    description: "A moves a cross left.\nB moves it right.\n\nA+B recenters it.",
    wikiUrl: "https://makecode.microbit.org/reference/input/on-button-pressed",
  },
  microphone: {
    title: "Microphone",
    description: "Sound level becomes a bar.",
    wikiUrl: "https://makecode.microbit.org/reference/input/on-sound",
  },
  shake: {
    title: "Shake",
    description: "Shake makes a sparkle.",
    wikiUrl: "https://makecode.microbit.org/reference/input/on-gesture",
  },
  tiltLeft: {
    title: "Tilt Left",
    description: "Tilt left moves the dot left.",
    wikiUrl: "https://makecode.microbit.org/reference/input/on-gesture",
  },
  tiltRight: {
    title: "Tilt Right",
    description: "Tilt right moves the dot right.",
    wikiUrl: "https://makecode.microbit.org/reference/input/on-gesture",
  },
  tiltUp: {
    title: "Tilt Up",
    description: "Tilt forward to move the dot up.",
    wikiUrl: "https://makecode.microbit.org/reference/input/on-gesture",
  },
  tiltDown: {
    title: "Tilt Down",
    description: "Tilt backward to move the dot down.",
    wikiUrl: "https://makecode.microbit.org/reference/input/on-gesture",
  },
  faceUp: {
    title: "Face Up",
    description: "Face-up movement is detected as a gesture.",
    wikiUrl: "https://makecode.microbit.org/reference/input/on-gesture",
  },
  faceDown: {
    title: "Face Down",
    description: "Face-down movement is detected as a gesture.",
    wikiUrl: "https://makecode.microbit.org/reference/input/on-gesture",
  },
  freefall: {
    title: "Freefall",
    description: "Freefall triggers the impact demo.",
    wikiUrl: "https://makecode.microbit.org/reference/input/on-gesture",
  },
  accel2g: {
    title: "2g Impact",
    description: "A strong movement triggers a sparkle.",
    wikiUrl: "https://makecode.microbit.org/reference/input/on-gesture",
  },
  accel3g: {
    title: "3g Impact",
    description: "A stronger movement triggers a sparkle.",
    wikiUrl: "https://makecode.microbit.org/reference/input/on-gesture",
  },
  accel6g: {
    title: "6g Impact",
    description: "A hard movement triggers a sparkle.",
    wikiUrl: "https://makecode.microbit.org/reference/input/on-gesture",
  },
  accel8g: {
    title: "8g Impact",
    description: "The strongest movement triggers a sparkle.",
    wikiUrl: "https://makecode.microbit.org/reference/input/on-gesture",
  },
};

export function getInfoPanelTitle(mode: InfoPanelMode) {
  return infoPanels[mode].title;
}

interface InfoPanelContentProps {
  mode: InfoPanelMode;
  currentDemo?: DemoProgram;
  restoreDemo?: DemoProgram;
  flashUnavailableReason?: string;
  isFlashing?: boolean;
  flashingDemoId?: string | null;
  onFlashDemo?: (demo: DemoProgram) => void;
  isPanelLocked?: boolean;
  onReturnHome?: () => void;
  onTogglePanelLock?: () => void;
}

export function InfoPanelContent({
  mode,
  currentDemo,
  restoreDemo,
  flashUnavailableReason,
  isFlashing = false,
  flashingDemoId = null,
  onFlashDemo,
  isPanelLocked = false,
  onReturnHome,
  onTogglePanelLock,
}: InfoPanelContentProps) {
  const panel = infoPanels[mode];
  const miniPreview = getMiniPreview(mode);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isWikiOpen, setIsWikiOpen] = useState(false);
  const wikiEmbedUrl = getWikiEmbedUrl(panel.wikiUrl);

  useEffect(() => {
    setFrameIndex(0);

    if (miniPreview.frames.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setFrameIndex((value) => (value + 1) % miniPreview.frames.length);
    }, 700);

    return () => {
      window.clearInterval(timer);
    };
  }, [miniPreview.frames.length, mode]);

  const activeCells = miniPreview.frames[frameIndex % miniPreview.frames.length];
  const canFlash = onFlashDemo !== undefined && flashUnavailableReason === undefined;

  return (
    <Stack spacing={5} px={5} py={5}>
      <Box>
        <Flex align="center" justify="space-between" gap={3} mb={3}>
          <Heading size="lg">{panel.title}</Heading>
          <Flex gap={2} flexShrink={0}>
            <IconButton
              aria-label="Return to Digital Twin"
              icon={
                <Box
                  as="span"
                  aria-hidden="true"
                  display="block"
                  w="14px"
                  h="14px"
                  position="relative"
                  sx={{
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: "1px",
                      top: "0px",
                      width: "12px",
                      height: "12px",
                      background: "currentColor",
                      clipPath: "polygon(50% 0%, 100% 42%, 100% 100%, 64% 100%, 64% 62%, 36% 62%, 36% 100%, 0% 100%, 0% 42%)",
                    },
                  }}
                />
              }
              size="sm"
              variant="outline"
              colorScheme="gray"
              onClick={onReturnHome}
            />
            <IconButton
              aria-label={isPanelLocked ? "Unlock panel" : "Lock panel"}
              icon={isPanelLocked ? <UnlockIcon /> : <LockIcon />}
              size="sm"
              variant={isPanelLocked ? "solid" : "outline"}
              colorScheme={isPanelLocked ? "blue" : "gray"}
              onClick={onTogglePanelLock}
            />
          </Flex>
        </Flex>
      </Box>

      {currentDemo && (
        <Box
          border="1px solid"
          borderColor="gray.200"
          borderRadius="8px"
          bg="gray.50"
          p={4}
        >
          <Stack direction="row" spacing={2} mb={3}>
            <Button
              size="md"
              colorScheme="blue"
              isLoading={isFlashing && flashingDemoId === currentDemo.id}
              isDisabled={isFlashing || !canFlash}
              onClick={() => onFlashDemo?.(currentDemo)}
              flex={1}
            >
              Load
            </Button>
            {restoreDemo && (
              <Button
                size="md"
                variant="outline"
                colorScheme="gray"
                leftIcon={<RepeatIcon />}
                isLoading={isFlashing && flashingDemoId === restoreDemo.id}
                isDisabled={isFlashing || !canFlash}
                onClick={() => onFlashDemo?.(restoreDemo)}
                flex={1}
              >
                Restore
              </Button>
            )}
          </Stack>
          {flashUnavailableReason && (
            <Text color="gray.600" fontSize="sm" mb={3}>
              {flashUnavailableReason}
            </Text>
          )}
          <Box
            bg="linear-gradient(145deg, #101827, #1f2937)"
            borderRadius="8px"
            border="1px solid"
            borderColor="gray.700"
            p={4}
            mb={3}
            boxShadow="inset 0 1px 0 rgba(255,255,255,0.08), 0 12px 28px rgba(15, 23, 42, 0.16)"
          >
            <Box
              display="grid"
              gridTemplateColumns="repeat(5, 1fr)"
              gap="8px"
              w="148px"
              mx="auto"
              aria-label={`${currentDemo.title} mini LED preview`}
            >
              {Array.from({ length: 25 }, (_, index) => {
                const isActive = activeCells.includes(index);
                return (
                  <Box
                    key={index}
                    aspectRatio={1}
                    borderRadius="4px"
                    bg={isActive ? miniPreview.accent : "rgba(255,255,255,0.12)"}
                    boxShadow={
                      isActive ? `0 0 16px ${miniPreview.glow}` : "inset 0 1px 1px rgba(255,255,255,0.05)"
                    }
                    transition="all 180ms ease"
                  />
                );
              })}
            </Box>
          </Box>
          <Text color="gray.600" fontSize="sm" whiteSpace="pre-line">
            {currentDemo.description}
          </Text>
        </Box>
      )}

      {!currentDemo && !restoreDemo && (
        <Box>
          <Divider mb={4} />
          <Text color="gray.600" fontSize="md">
            Select a component to load a matching demo.
          </Text>
        </Box>
      )}

      <Box>
        <Divider mb={4} />
        <Button
          type="button"
          variant="outline"
          colorScheme="blue"
          rightIcon={isWikiOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          justifyContent="space-between"
          w="100%"
          onClick={() => setIsWikiOpen((value) => !value)}
        >
          Wiki
        </Button>
        <Collapse in={isWikiOpen} animateOpacity>
          <Box
            mt={3}
            border="1px solid"
            borderColor="gray.200"
            borderRadius="8px"
            overflow="hidden"
            bg="white"
          >
            <Box
              as="iframe"
              title={`${panel.title} wiki`}
              src={wikiEmbedUrl}
              w="100%"
              h={{ base: "520px", md: "620px" }}
              border={0}
              display="block"
            />
          </Box>
        </Collapse>
        <Button
          as="a"
          href={panel.wikiUrl}
          target="_blank"
          rel="noreferrer"
          variant="ghost"
          colorScheme="blue"
          rightIcon={<ExternalLinkIcon />}
          justifyContent="space-between"
          w="100%"
          mt={2}
        >
          Open wiki
        </Button>
      </Box>
    </Stack>
  );
}
