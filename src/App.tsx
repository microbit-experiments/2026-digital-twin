import { ArrowForwardIcon, AtSignIcon, BellIcon, CheckCircleIcon, InfoIcon, InfoOutlineIcon, RepeatIcon, UpDownIcon } from "@chakra-ui/icons";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Center,
  Container,
  Grid,
  GridItem,
  Heading,
  Image,
  Stack,
  Text,
  useToast,
  Box,
  Flex,
  IconButton,
  Spacer,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  useDisclosure,
  useBreakpointValue,
  HStack,
  SimpleGrid,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import "./App.css";
import MicrobitSVG from "./assets/microbit-drawing.svg?react";
import MicrobitLogo from "./assets/microbit-logo.svg";
import ConnectGif from "./assets/connect-microbit.gif";
import { MicrobitDrawing } from "./utils/microbitDrawing";
import { UsbSerialConnector } from "./connectors/usb-serial-connector";
import {
  getInfoPanelTitle,
  InfoPanelContent,
  type DemoProgram,
  type InfoPanelMode,
} from "./components/InfoPanels";
import { SensorChart, type SensorPoint } from "./components/SensorChart";
import type { InputBehaviour, InputBehaviourKind, InputButton } from "./types/microbit-connector";

function getConnectErrorDescription(error: unknown): string {
  const maybeDeviceError = error as { code?: string; message?: string };
  if (maybeDeviceError && typeof maybeDeviceError.message === "string") {
    if (maybeDeviceError.code === "unsupported") {
      return "WebUSB is not supported in this browser. Use Chrome or Edge on localhost/HTTPS.";
    }
    if (maybeDeviceError.code === "no-device-selected") {
      return "You cancelled the USB device picker. Please select your micro:bit to connect.";
    }
    if (maybeDeviceError.code === "device-in-use") {
      return "The micro:bit is currently in use by another app/tab. Close the other connection and retry.";
    }
    if (maybeDeviceError.code === "permission-denied") {
      return "USB permission was denied. Ensure this origin is allowed to access USB.";
    }
    if (maybeDeviceError.code === "connection-error" || maybeDeviceError.code === "device-disconnected") {
      return `${maybeDeviceError.message}. Try unplugging/replugging the micro:bit and retry.`;
    }
    if (maybeDeviceError.code === "firmware-update-required") {
      return "The micro:bit firmware is not compatible. Update micro:bit firmware/DAPLink first.";
    }

    return maybeDeviceError.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error while connecting to the micro:bit.";
}

function formatInputButton(button: InputButton) {
  if (button === "Logo") return "Logo";
  if (button === "AB") return "Buttons A+B";
  if (button === "Microphone") return "Microphone";
  if (button === "Gesture") return "Gesture";
  return `Button ${button}`;
}

function isActiveStart(behaviour: InputBehaviourKind) {
  return behaviour === "down";
}

function isActiveEnd(behaviour: InputBehaviourKind) {
  return behaviour === "up" || behaviour === "notPressed" || behaviour === "quiet";
}

function isMicrophoneInput(input: InputBehaviour) {
  return input.button === "Microphone";
}

function createGestureInput(behaviour: InputBehaviourKind, label: string): InputBehaviour {
  return {
    button: "Gesture",
    behaviour,
    label,
    source: "action",
    timestamp: Date.now(),
  };
}

function getGestureModeFromBehaviour(behaviour: InputBehaviourKind): InfoPanelMode | null {
  switch (behaviour) {
    case "shake":
      return "shake";
    case "tiltLeft":
      return "tiltLeft";
    case "tiltRight":
      return "tiltRight";
    case "tiltUp":
    case "tiltDown":
      return "tiltUpDown";
    case "faceUp":
      return "faceUp";
    case "faceDown":
      return "faceDown";
    case "freefall":
      return "freefall";
    case "acceleration2g":
      return "accel2g";
    case "acceleration3g":
      return "accel3g";
    case "acceleration6g":
      return "accel6g";
    case "acceleration8g":
      return "accel8g";
    default:
      return null;
  }
}

function getDemoProgramsForMode(
  demos: DemoProgram[],
  mode: InfoPanelMode,
): DemoProgram[] {
  const byMode = demos.filter((demo) =>
    demo.supportedModes ? demo.supportedModes.includes(mode) : true,
  );
  if (byMode.length > 0) {
    return byMode;
  }

  return demos.filter((demo) => demo.supportedModes == null || demo.supportedModes.includes("default"));
}

function findMicrobitSvgPart(target: EventTarget | null): InfoPanelMode | null {
  if (!(target instanceof Element)) return null;

  if (target.closest("#ButtonA")) return "buttonA";
  if (target.closest("#ButtonB")) return "buttonB";
  if (target.closest("#Logo, #LogoBackground")) return "logo";
  if (target.closest("#MicrophoneHole, #UnlitMicrophone, #LitMicrophone")) return "microphone";

  return null;
}

function isDisplayableInput(input: InputBehaviour) {
  if (isActiveEnd(input.behaviour)) return false;
  return true;
}

const actionDemoPrograms: DemoProgram[] = [
  {
    id: "default",
    title: "Default all-input demo",
    description:
      "Single program for buttons, logo, gestures, microphone, accelerometer, magnetometer, and temperature.",
    hexPath: "/usb-serial-demo.hex",
    supportedModes: ["default", "buttonA", "buttonB", "buttonAB", "logo", "microphone", "shake", "tiltLeft", "tiltRight", "tiltUpDown", "faceUp", "faceDown", "freefall", "accel2g", "accel3g", "accel6g", "accel8g"],
  },
  {
    id: "button-a",
    title: "Button A action demo",
    description:
      "Press A for a random 0–9 number on the display, while sending button events and sensor streams.",
    hexPath: "/usb-serial-demo-action-button-a.hex",
    supportedModes: ["buttonA"],
  },
  {
    id: "button-b",
    title: "Button B action demo",
    description: "Emit down/up/click events for Button B plus all sensor samples.",
    hexPath: "/usb-serial-demo-action-button-b.hex",
    supportedModes: ["buttonB"],
  },
  {
    id: "button-ab",
    title: "Button A+B action demo",
    description: "Emit down/up/click events for the combined A+B action plus sensors.",
    hexPath: "/usb-serial-demo-action-button-ab.hex",
    supportedModes: ["buttonAB"],
  },
  {
    id: "logo",
    title: "Logo action demo",
    description: "Emit logo pressed/released/click events and keep streaming sensors.",
    hexPath: "/usb-serial-demo-action-logo.hex",
    supportedModes: ["logo"],
  },
  {
    id: "microphone",
    title: "Microphone action demo",
    description: "Emit loud and quiet events from the built-in microphone plus all sensor samples.",
    hexPath: "/usb-serial-demo-action-microphone.hex",
    supportedModes: ["microphone"],
  },
  {
    id: "gesture-shake",
    title: "Shake gesture demo",
    description: "Emit only shake gesture events while also sending sensor values.",
    hexPath: "/usb-serial-demo-action-gesture-shake.hex",
    supportedModes: ["shake"],
  },
  {
    id: "gesture-tilt-left",
    title: "Tilt left gesture demo",
    description: "Emit tilt-left gesture events while streaming accelerometer/magnetometer/temperature.",
    hexPath: "/usb-serial-demo-action-gesture-tilt-left.hex",
    supportedModes: ["tiltLeft"],
  },
  {
    id: "gesture-tilt-right",
    title: "Tilt right gesture demo",
    description: "Emit tilt-right gesture events while streaming accelerometer/magnetometer/temperature.",
    hexPath: "/usb-serial-demo-action-gesture-tilt-right.hex",
    supportedModes: ["tiltRight"],
  },
  {
    id: "gesture-face-up",
    title: "Face up gesture demo",
    description: "Emit face-up gesture events while streaming sensor values.",
    hexPath: "/usb-serial-demo-action-gesture-face-up.hex",
    supportedModes: ["faceUp"],
  },
  {
    id: "gesture-face-down",
    title: "Face down gesture demo",
    description: "Emit face-down gesture events while streaming sensor values.",
    hexPath: "/usb-serial-demo-action-gesture-face-down.hex",
    supportedModes: ["faceDown"],
  },
  {
    id: "gesture-freefall",
    title: "Freefall gesture demo",
    description: "Emit freefall gesture events while streaming sensor values.",
    hexPath: "/usb-serial-demo-action-gesture-freefall.hex",
    supportedModes: ["freefall"],
  },
  {
    id: "gesture-2g",
    title: "2g acceleration demo",
    description: "Emit acceleration2g events for threshold-based 2g-style movement triggers.",
    hexPath: "/usb-serial-demo-action-gesture-2g.hex",
    supportedModes: ["accel2g"],
  },
  {
    id: "gesture-3g",
    title: "3g acceleration demo",
    description: "Emit acceleration3g events and continuous sensors.",
    hexPath: "/usb-serial-demo-action-gesture-3g.hex",
    supportedModes: ["accel3g"],
  },
  {
    id: "gesture-6g",
    title: "6g acceleration demo",
    description: "Emit acceleration6g events and continuous sensors.",
    hexPath: "/usb-serial-demo-action-gesture-6g.hex",
    supportedModes: ["accel6g"],
  },
  {
    id: "gesture-8g",
    title: "8g acceleration demo",
    description: "Emit acceleration8g events and continuous sensors.",
    hexPath: "/usb-serial-demo-action-gesture-8g.hex",
    supportedModes: ["accel8g"],
  },
  {
    id: "gesture-tilt-up-down",
    title: "Tilt up/down gesture demo",
    description: "Emit tilt up and tilt down events using rotation thresholds.",
    hexPath: "/usb-serial-demo-action-gesture-tilt-up-down.hex",
    supportedModes: ["tiltUpDown"],
  },
];

function getDynamicSensorMax(
  data: SensorPoint[],
  fallback: number,
  minimum: number,
  maximum: number,
  margin = 1.2,
): number {
  if (data.length === 0) return fallback;

  let observedMax = 0;
  for (const point of data) {
    const sampleMax = Math.max(Math.abs(point.x), Math.abs(point.y), Math.abs(point.z));
    if (sampleMax > observedMax) observedMax = sampleMax;
  }

  if (!Number.isFinite(observedMax) || observedMax <= 0) {
    return minimum;
  }

  const scaled = Math.ceil(observedMax * margin);
  const clamped = Math.min(Math.max(scaled, minimum), maximum);
  const step = 50;

  return Math.ceil(clamped / step) * step;
}

function App() {
  const desktopSidebarWidth = "420px";
  const navbarHeight = "88px";
  const toast = useToast();
  const microbitDrawing = useMemo(() => new MicrobitDrawing(), []);
  const mbConnector = useMemo(() => new UsbSerialConnector(), []);
  const [mode, setMode] = useState<"landing" | "connected">("landing");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isSendingCommand, setIsSendingCommand] = useState(false);
  const [flashingDemoId, setFlashingDemoId] = useState<string | null>(null);
  const [isMicrobitShaking, setIsMicrobitShaking] = useState(false);
  const [infoPanelMode, setInfoPanelMode] = useState<InfoPanelMode>("default");
  const [latestInputBehaviour, setLatestInputBehaviour] = useState<InputBehaviour | null>(null);
  const [accelerometerData, setAccelerometerData] = useState<SensorPoint[]>([]);
  const [magnetometerData, setMagnetometerData] = useState<SensorPoint[]>([]);
  const shakeTimeoutRef = useRef<number | null>(null);
  const idleTimeoutRef = useRef<number | null>(null);
  const activeInputsRef = useRef(new Set<InputButton>());
  const infoDisclosure = useDisclosure();
  const isLargeScreen = useBreakpointValue({ base: false, lg: true });
  const svgWidth = useBreakpointValue({
    base: "240px",
    sm: "300px",
    md: "380px",
    lg: "460px",
    xl: "540px",
  });

  const triggerMicrobitShake = useCallback(() => {
    if (shakeTimeoutRef.current !== null) {
      window.clearTimeout(shakeTimeoutRef.current);
    }

    setIsMicrobitShaking(false);
    window.requestAnimationFrame(() => {
      setIsMicrobitShaking(true);
      shakeTimeoutRef.current = window.setTimeout(() => {
        setIsMicrobitShaking(false);
        shakeTimeoutRef.current = null;
      }, 350);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (shakeTimeoutRef.current !== null) {
        window.clearTimeout(shakeTimeoutRef.current);
      }
      if (idleTimeoutRef.current !== null) {
        window.clearTimeout(idleTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const showGestureInput = (behaviour: InputBehaviourKind, label: string) => {
      const input = createGestureInput(behaviour, label);
      setLatestInputBehaviour(input);

      if (idleTimeoutRef.current !== null) {
        window.clearTimeout(idleTimeoutRef.current);
      }

      idleTimeoutRef.current = window.setTimeout(() => {
        setLatestInputBehaviour(null);
        idleTimeoutRef.current = null;
      }, 1200);
    };

    mbConnector.setTemperatureUpdate((x) => {
      console.log("Temperature: ", x);
    });

    mbConnector.setOnTiltUp(() => {
      console.log("tiltUp");
      setInfoPanelMode("tiltUpDown");
      showGestureInput("tiltUp", "Tilt up");
    });

    mbConnector.setOnTiltDown(() => {
      console.log("tiltDown");
      setInfoPanelMode("tiltUpDown");
      showGestureInput("tiltDown", "Tilt down");
    });

    mbConnector.setOnTiltLeft(() => {
      console.log("tiltLeft");
      setInfoPanelMode("tiltLeft");
      showGestureInput("tiltLeft", "Tilt left");
    });

    mbConnector.setOnTiltRight(() => {
      console.log("tiltRight");
      setInfoPanelMode("tiltRight");
      showGestureInput("tiltRight", "Tilt right");
    });

    mbConnector.setOnFaceUp(() => {
      console.log("faceUp");
      setInfoPanelMode("faceUp");
      showGestureInput("faceUp", "Face up");
    });

    mbConnector.setOnFaceDown(() => {
      console.log("faceDown");
      setInfoPanelMode("faceDown");
      showGestureInput("faceDown", "Face down");
    });

    mbConnector.setOnFreefall(() => {
      console.log("freefall");
      setInfoPanelMode("freefall");
      showGestureInput("freefall", "Freefall");
    });

    mbConnector.setOnAcceleration3g(() => {
      console.log("acceleration3g");
      setInfoPanelMode("accel3g");
    });

    mbConnector.setOnAcceleration6g(() => {
      console.log("acceleration6g");
      setInfoPanelMode("accel6g");
    });

    mbConnector.setOnAcceleration8g(() => {
      console.log("acceleration8g");
      setInfoPanelMode("accel8g");
    });

    mbConnector.setOnAcceleration2g(() => {
      console.log("acceleration2g");
      setInfoPanelMode("accel2g");
    });

    mbConnector.setOnNoAuthorizedDevice(() => {
      console.log("NoAuthorizedDevice");
    });

    mbConnector.setOnDisconnect(() => {
      console.log("Disconnect");
    });

    mbConnector.setOnConnect(() => {
      console.log("Connect");
    });

    mbConnector.setOnConnecting(() => {
      console.log("Connecting");
    });

    mbConnector.setOnPause(() => {
      console.log("Pause");
    });

    mbConnector.setOnButtonADown(() => {
      microbitDrawing.buttonA = true;
      setInfoPanelMode("buttonA");
    });
    mbConnector.setOnButtonAUp(() => {
      microbitDrawing.buttonA = false;
    });
    mbConnector.setOnButtonBDown(() => {
      microbitDrawing.buttonB = true;
      setInfoPanelMode("buttonB");
    });
    mbConnector.setOnButtonBUp(() => {
      microbitDrawing.buttonB = false;
    });
    mbConnector.setOnInputBehaviour((input) => {
      if (idleTimeoutRef.current !== null) {
        window.clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = null;
      }

      if (isActiveStart(input.behaviour) || input.behaviour === "loud") {
        activeInputsRef.current.add(input.button);
      }

      if (isActiveEnd(input.behaviour)) {
        activeInputsRef.current.delete(input.button);
      }

      const shouldDisplay = isDisplayableInput(input);
      if (shouldDisplay || isMicrophoneInput(input)) {
        setLatestInputBehaviour(input);
      } else if (activeInputsRef.current.size === 0) {
        setLatestInputBehaviour(null);
      }

      if (isMicrophoneInput(input)) {
        idleTimeoutRef.current = window.setTimeout(() => {
          setLatestInputBehaviour(null);
          idleTimeoutRef.current = null;
        }, input.behaviour === "loud" ? 1200 : 500);
      } else if (activeInputsRef.current.size === 0) {
        idleTimeoutRef.current = window.setTimeout(() => {
          setLatestInputBehaviour(null);
          idleTimeoutRef.current = null;
        }, shouldDisplay ? 900 : 0);
      }

      console.log("Input behaviour: ", `${formatInputButton(input.button)} ${input.label}`);

      if (shouldDisplay || isActiveStart(input.behaviour)) {
        if (input.button === "A") setInfoPanelMode("buttonA");
        else if (input.button === "B") setInfoPanelMode("buttonB");
        else if (input.button === "AB") setInfoPanelMode("buttonAB");
        else if (input.button === "Logo") setInfoPanelMode("logo");
        else if (input.button === "Microphone") setInfoPanelMode("microphone");
        else if (input.button === "Gesture") {
          const nextMode = getGestureModeFromBehaviour(input.behaviour);
          if (nextMode) {
            setInfoPanelMode(nextMode);
          }
        }
      }
    });
    mbConnector.setOnLogoDown(() => {
      microbitDrawing.touchLogo = true;
      setInfoPanelMode("logo");
    });
    mbConnector.setOnLogoUp(() => {
      microbitDrawing.touchLogo = false;
    });
    mbConnector.setOnShake(() => {
      setInfoPanelMode("shake");
      triggerMicrobitShake();
    });

    mbConnector.setLedMatrixUpdate((row, col, val) => {
      const index = row * 5 + col;
      if (val) microbitDrawing.setLed(index);
      else microbitDrawing.unsetLed(index);
    });

    mbConnector.setMicLedUpdate((active) => {
      microbitDrawing.microphone = active;
    });

    mbConnector.setTemplateLedUpdate((active) => {
      microbitDrawing.templateLed = active;
    });

    mbConnector.setAccelerometerUpdate((x, y, z) => {
      setAccelerometerData((previous) => {
        const next = [...previous, { time: Date.now(), x, y, z }];
        return next.slice(-150);
      });
    });

    mbConnector.setMagnetometerUpdate((x, y, z) => {
      setMagnetometerData((previous) => {
        const next = [...previous, { time: Date.now(), x, y, z }];
        return next.slice(-150);
      });
    });
  }, [mbConnector, microbitDrawing, triggerMicrobitShake]);

  const openInfoPanel = useCallback((nextMode: InfoPanelMode) => {
    setInfoPanelMode(nextMode);
    if (!isLargeScreen) {
      infoDisclosure.onOpen();
    }
  }, [infoDisclosure, isLargeScreen]);

  const handleMicrobitDrawingClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const nextMode = findMicrobitSvgPart(event.target);
    if (!nextMode) return;

    openInfoPanel(nextMode);
  }, [openInfoPanel]);

  const handleConnect = useCallback(() => {
    if (isConnecting) return;
    setIsConnecting(true);
    const connectPromise = mbConnector.handleConnect();
    const toastId = toast({
      title: "Connecting over USB...",
      status: "loading",
      isClosable: false,
      duration: null,
    });

    connectPromise
      .then(() => {
        toast.update(toastId, {
          title: "Micro:bit USB serial is connected.",
          status: "success",
          duration: 2500,
          isClosable: true,
        });
        setMode("connected");
      })
      .catch((error) => {
        toast.update(toastId, {
          title: "Unable to connect to the micro:bit over USB.",
          description: getConnectErrorDescription(error),
          status: "error",
          duration: 9000,
          isClosable: true,
        });
        setMode("landing");
      })
      .finally(() => setIsConnecting(false));
  }, [mbConnector, isConnecting, toast]);

  const handleFlashDemoHex = useCallback((demo: DemoProgram) => {
    if (isFlashing) return;

    setFlashingDemoId(demo.id);
    setIsFlashing(true);
    const flashingPromise = mbConnector.flashHexFromUrl(demo.hexPath);

    toast.promise(flashingPromise, {
      loading: { title: `Flashing ${demo.title}...` },
      success: { title: `${demo.title} flashed. Listening on USB serial.` },
      error: { title: "Failed to flash demo program." },
    });

    flashingPromise
      .then(() => setMode("connected"))
      .finally(() => {
        setIsFlashing(false);
        setFlashingDemoId(null);
      });
  }, [mbConnector, isFlashing, toast]);

  const demoProgramsForCurrentPanel = useMemo(
    () => getDemoProgramsForMode(actionDemoPrograms, infoPanelMode),
    [infoPanelMode],
  );

  const handleFlashDemo = () => {
    const nextDemo = demoProgramsForCurrentPanel[0] ?? actionDemoPrograms[0];
    handleFlashDemoHex(nextDemo);
  };

  const infoPanelBody = (
    <InfoPanelContent
      mode={infoPanelMode}
      demoPrograms={demoProgramsForCurrentPanel}
      isFlashing={isFlashing}
      flashingDemoId={flashingDemoId}
      onFlashDemo={handleFlashDemoHex}
    />
  );

  const handleSendHello = () => {
    if (isSendingCommand) return;

    setIsSendingCommand(true);
    const commandPromise = mbConnector.sendCommand({ type: "show_text", text: "Hi" });

    toast.promise(commandPromise, {
      loading: { title: "Sending command..." },
      success: { title: "Command sent over USB serial." },
      error: { title: "Unable to send command." },
    });

    commandPromise.finally(() => setIsSendingCommand(false));
  };

  const isDesktopSidebarVisible = mode === "connected" && Boolean(isLargeScreen);
  const isMobileInfoDrawerOpen = mode === "connected" && !isLargeScreen && infoDisclosure.isOpen;
  const currentInputDisplay = latestInputBehaviour
    ? {
      component: formatInputButton(latestInputBehaviour.button),
      event: latestInputBehaviour.label,
      visualType: latestInputBehaviour.button,
      isIdle: false,
    }
    : infoPanelMode === "buttonA"
      ? { component: "Button A", event: "Selected", visualType: "A", isIdle: false }
      : infoPanelMode === "buttonB"
        ? { component: "Button B", event: "Selected", visualType: "B", isIdle: false }
        : infoPanelMode === "buttonAB"
          ? { component: "Buttons A+B", event: "Selected", visualType: "AB", isIdle: false }
          : infoPanelMode === "logo"
            ? { component: "Logo", event: "Selected", visualType: "Logo", isIdle: false }
            : infoPanelMode === "microphone"
              ? { component: "Microphone", event: "Selected", visualType: "Microphone", isIdle: false }
              : infoPanelMode === "shake"
                ? { component: "Gesture", event: "Shake", visualType: "Gesture", isIdle: false }
                : infoPanelMode === "tiltLeft"
                  ? { component: "Gesture", event: "Tilt left", visualType: "Gesture", isIdle: false }
                  : infoPanelMode === "tiltRight"
                    ? { component: "Gesture", event: "Tilt right", visualType: "Gesture", isIdle: false }
                    : infoPanelMode === "tiltUpDown"
                      ? { component: "Gesture", event: "Tilt up / down", visualType: "Gesture", isIdle: false }
                      : infoPanelMode === "faceUp"
                        ? { component: "Gesture", event: "Face up", visualType: "Gesture", isIdle: false }
                        : infoPanelMode === "faceDown"
                          ? { component: "Gesture", event: "Face down", visualType: "Gesture", isIdle: false }
                          : infoPanelMode === "freefall"
                            ? { component: "Gesture", event: "Freefall", visualType: "Gesture", isIdle: false }
                            : infoPanelMode === "accel2g"
                              ? { component: "Gesture", event: "2g acceleration", visualType: "Gesture", isIdle: false }
                              : infoPanelMode === "accel3g"
                                ? { component: "Gesture", event: "3g acceleration", visualType: "Gesture", isIdle: false }
                                : infoPanelMode === "accel6g"
                                  ? { component: "Gesture", event: "6g acceleration", visualType: "Gesture", isIdle: false }
                                  : infoPanelMode === "accel8g"
                                    ? { component: "Gesture", event: "8g acceleration", visualType: "Gesture", isIdle: false }
                                    : { component: "Status", event: "Idle", visualType: null, isIdle: true };

  return (
    <Container maxW="100%" minH="100vh" px={0} bg="#f7f9fc">
      <Flex
        as="nav"
        px={{ base: 4, md: 8 }}
        h={navbarHeight}
        w="100%"
        maxW="100%"
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
        align="center"
        position="sticky"
        top={0}
        zIndex={20}
      >
        <HStack spacing={4}>
          <Box
            as="a"
            href="https://microbit.org"
            target="_blank"
            rel="noreferrer"
            aria-label="micro:bit website"
            display="flex"
            alignItems="center"
            flexShrink={0}
          >
            <Image src={MicrobitLogo} alt="micro:bit" h="44px" w="auto" />
          </Box>
          <Heading size={{ base: "sm", md: "md" }}>Digital Twin</Heading>
          {mode === "connected" && (
            <Badge
              colorScheme="green"
              px={4}
              py={2}
              borderRadius="md"
              border="1px solid"
              borderColor="green.100"
              bg="green.50"
              color="green.700"
              display={{ base: "none", md: "inline-flex" }}
              alignItems="center"
              gap={2}
            >
              <CheckCircleIcon />
              Connected
            </Badge>
          )}
        </HStack>
        <Spacer />
        <Button
          rightIcon={<ArrowForwardIcon />}
          colorScheme="teal"
          variant="solid"
          boxShadow="sm"
          onClick={handleFlashDemo}
          isLoading={isFlashing}
        >
          Flash Demo
        </Button>
        {mode === "connected" && (
          <Button
            colorScheme="blue"
            variant="outline"
            onClick={handleSendHello}
            isLoading={isSendingCommand}
            ml={2}
          >
            Send Hi
          </Button>
        )}
        {mode === "connected" && (
          <IconButton
            aria-label="Toggle info panel"
            icon={<InfoIcon />}
            variant="ghost"
            ml={2}
            display={{ base: "inline-flex", lg: "none" }}
            onClick={infoDisclosure.onOpen}
          />
        )}
      </Flex>

      {mode === "landing" ? (
        <Container
          maxW="1200px"
          h={`calc(100vh - ${navbarHeight})`}
          px={4}
          pb={0}
          pt={10}
          centerContent
        >
          <Center>
            <Card
              maxW="lg"
              w="full"
              boxShadow="2xl"
              borderRadius="2xl"
              bg="white"
              border="1px solid"
              borderColor="gray.200"
            >
              <CardHeader textAlign="center">
                <Heading size="lg">Connect Your Microbit</Heading>
                <Text mt={2} color="gray.600">
                  Bring a Micro:bit to life with a dummy connector that simulates real events before
                  you have the hardware in hand.
                </Text>
              </CardHeader>
              <CardBody>
                <Stack spacing={4}>
                  <Image
                    borderRadius="lg"
                    src={ConnectGif}
                    alt="Animated Micro:bit placeholder"
                    objectFit="cover"
                  />
                </Stack>
              </CardBody>
              <CardFooter justify="center">
                <Button
                  colorScheme="teal"
                  rightIcon={<ArrowForwardIcon />}
                  onClick={() => {
                    setInfoPanelMode("default");
                    handleConnect();
                  }}
                  isLoading={isConnecting}
                >
                  Connect
                </Button>
              </CardFooter>
            </Card>
          </Center>
        </Container>
      ) : (
        <Container
          maxW="100%"
          px={{ base: 4, md: 6, xl: 8 }}
          py={{ base: 4, md: 6 }}
        >
          <Grid
            templateColumns={{ base: "1fr", xl: `minmax(0, 1fr) ${desktopSidebarWidth}` }}
            gap={6}
            alignItems="start"
          >
            <GridItem minW={0}>
              <Stack spacing={6}>
                <Box
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="8px"
                  boxShadow="0 14px 32px rgba(15, 23, 42, 0.08)"
                  px={{ base: 4, md: 6 }}
                  py={{ base: 4, md: 5 }}
                >
                  <Center minH={{ base: "260px", lg: "360px" }}>
                    <Box
                      display="inline-block"
                      transformOrigin="center center"
                      cursor="pointer"
                      onClick={handleMicrobitDrawingClick}
                      animation={isMicrobitShaking ? "microbitShake 350ms ease-in-out" : undefined}
                      sx={{
                        "& svg #ButtonA, & svg #ButtonB, & svg #Logo, & svg #LogoBackground, & svg #MicrophoneHole, & svg #UnlitMicrophone, & svg #LitMicrophone": {
                          cursor: "pointer",
                        },
                        "@keyframes microbitShake": {
                          "0%": { transform: "translateX(0px) rotate(0deg)" },
                          "20%": { transform: "translateX(-8px) rotate(-2deg)" },
                          "40%": { transform: "translateX(8px) rotate(2deg)" },
                          "60%": { transform: "translateX(-6px) rotate(-1.5deg)" },
                          "80%": { transform: "translateX(6px) rotate(1.5deg)" },
                          "100%": { transform: "translateX(0px) rotate(0deg)" },
                        },
                      }}
                    >
                      <MicrobitSVG width={svgWidth ?? "320px"} />
                    </Box>
                  </Center>

                  <HStack
                    spacing={4}
                    bg={currentInputDisplay.isIdle ? "gray.50" : "blue.50"}
                    border="1px solid"
                    borderColor={currentInputDisplay.isIdle ? "gray.200" : "blue.100"}
                    borderRadius="8px"
                    px={{ base: 4, md: 6 }}
                    py={{ base: 4, md: 5 }}
                    mt={4}
                    maxW="640px"
                    mx="auto"
                  >
                    <Center
                      w={{ base: "48px", md: "56px" }}
                      h={{ base: "48px", md: "56px" }}
                      borderRadius="8px"
                      bg={currentInputDisplay.isIdle ? "white" : "blue.100"}
                      color={currentInputDisplay.isIdle ? "gray.500" : "blue.700"}
                      fontSize="md"
                      fontWeight="bold"
                      flexShrink={0}
                    >
                      {currentInputDisplay.visualType === "Microphone" ? (
                        <BellIcon boxSize={6} />
                      ) : currentInputDisplay.visualType === "Gesture" ? (
                        <UpDownIcon boxSize={6} />
                      ) : currentInputDisplay.visualType === "Logo" ? (
                        <AtSignIcon boxSize={6} />
                      ) : currentInputDisplay.visualType === "AB" ? (
                        <RepeatIcon boxSize={6} />
                      ) : !currentInputDisplay.isIdle ? (
                        <CheckCircleIcon boxSize={6} />
                      ) : (
                        <InfoOutlineIcon boxSize={6} />
                      )}
                    </Center>
                    <HStack
                      flex={1}
                      spacing={{ base: 3, md: 5 }}
                      align="stretch"
                      minW={0}
                    >
                      <Box minW={0} flex={1}>
                        <Text color="gray.500" fontSize="sm">
                          Component
                        </Text>
                        <Text color={currentInputDisplay.isIdle ? "gray.700" : "blue.800"} fontWeight="bold" fontSize={{ base: "xl", md: "2xl" }}>
                          {currentInputDisplay.component}
                        </Text>
                      </Box>
                      <Box
                        w="1px"
                        bg={currentInputDisplay.isIdle ? "gray.200" : "blue.200"}
                        alignSelf="stretch"
                        flexShrink={0}
                      />
                      <Box minW={0} flex={1}>
                      <Text color="gray.500" fontSize="sm">
                          Event
                      </Text>
                        <Text color={currentInputDisplay.isIdle ? "gray.700" : "blue.800"} fontWeight="bold" fontSize={{ base: "xl", md: "2xl" }}>
                          {currentInputDisplay.event}
                      </Text>
                    </Box>
                    </HStack>
                  </HStack>
                </Box>

              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                  <Box
                    bg="white"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="8px"
                    px={5}
                    py={5}
                    boxShadow="0 10px 24px rgba(15, 23, 42, 0.06)"
                  >
                    <SensorChart
                      data={accelerometerData}
                      title="Accelerometer"
                      maxVal={2000}
                      showLegend
                    />
                  </Box>
                  <Box
                    bg="white"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="8px"
                    px={5}
                    py={5}
                    boxShadow="0 10px 24px rgba(15, 23, 42, 0.06)"
                  >
                  <SensorChart
                    data={magnetometerData}
                    title="Magnetometer"
                    maxVal={getDynamicSensorMax(magnetometerData, 3000, 200, 5000)}
                  />
                </Box>
                </SimpleGrid>
              </Stack>
            </GridItem>

            {isDesktopSidebarVisible && (
              <GridItem minW={0}>
                <Box
                  position="sticky"
                  top={`calc(${navbarHeight} + 24px)`}
                  maxH={`calc(100dvh - ${navbarHeight} - 48px)`}
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="8px"
                  boxShadow="0 14px 32px rgba(15, 23, 42, 0.08)"
                  overflowY="auto"
                >
                  {infoPanelBody}
                </Box>
              </GridItem>
            )}
          </Grid>
        </Container>
      )}

      <Drawer
        isOpen={isMobileInfoDrawerOpen}
        placement="right"
        onClose={infoDisclosure.onClose}
        closeOnEsc
        closeOnOverlayClick
        trapFocus
        blockScrollOnMount
      >
        <DrawerOverlay display={{ base: "block", lg: "none" }} />
        <DrawerContent w="90vw" maxW="90vw">
          <DrawerHeader>{getInfoPanelTitle(infoPanelMode)}</DrawerHeader>
          <DrawerBody>
            <Flex direction="column" h="100%">
              {infoPanelBody}
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Container>
  );
}

export default App;
