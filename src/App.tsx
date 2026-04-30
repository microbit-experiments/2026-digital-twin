import { AtSignIcon, BellIcon, CheckCircleIcon, InfoIcon, InfoOutlineIcon, RepeatIcon, UpDownIcon } from "@chakra-ui/icons";
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
import { SensorChart, TemperatureChart, type SensorPoint, type TemperaturePoint } from "./components/SensorChart";
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
  return behaviour === "down" || behaviour === "on" || behaviour === "loud";
}

function isActiveEnd(behaviour: InputBehaviourKind) {
  return behaviour === "up" || behaviour === "notPressed" || behaviour === "off" || behaviour === "quiet";
}

function isMicrophoneActive(behaviour: InputBehaviourKind) {
  return behaviour === "on" || behaviour === "loud";
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
  if (mode !== "default") {
    const exact = demos.filter((demo) =>
      demo.id !== "default" && demo.supportedModes?.includes(mode),
    );
    if (exact.length > 0) return exact;
  }

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

function createSvgClickInput(mode: InfoPanelMode): InputBehaviour | null {
  const timestamp = Date.now();

  if (mode === "buttonA") {
    return { button: "A", behaviour: "click", label: "Click", source: "action", timestamp };
  }

  if (mode === "buttonB") {
    return { button: "B", behaviour: "click", label: "Click", source: "action", timestamp };
  }

  if (mode === "buttonAB") {
    return { button: "AB", behaviour: "click", label: "Click", source: "action", timestamp };
  }

  if (mode === "logo") {
    return { button: "Logo", behaviour: "click", label: "Click", source: "action", timestamp };
  }

  if (mode === "microphone") {
    return { button: "Microphone", behaviour: "click", label: "Click", source: "action", timestamp };
  }

  return null;
}

function isDisplayableInput(input: InputBehaviour) {
  if (isActiveEnd(input.behaviour)) return false;
  return true;
}

const INPUT_IDLE_DELAY_MS = 2000;

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
    id: "simple-buttons",
    title: "Buttons",
    description: "A moves a cross left.\nB moves it right.\n\nA+B recenters it.",
    hexPath: "/usb-serial-demo-simple-buttons.hex",
    supportedModes: ["default", "buttonA", "buttonB", "buttonAB"],
  },
  {
    id: "simple-tilt-up-down",
    title: "Tilt up/down",
    description: "Tilt forward/backward to move a dot up/down.",
    hexPath: "/usb-serial-demo-simple-tilt-up-down.hex",
    supportedModes: ["default", "tiltUpDown", "faceUp", "faceDown"],
  },
  {
    id: "simple-tilt-left-right",
    title: "Tilt left/right",
    description: "Tilt left/right to move a dot across the display.",
    hexPath: "/usb-serial-demo-simple-tilt-left-right.hex",
    supportedModes: ["default", "tiltLeft", "tiltRight"],
  },
  {
    id: "simple-logo",
    title: "Logo",
    description: "Tap for a random icon. Hold for a random number.",
    hexPath: "/usb-serial-demo-simple-logo.hex",
    supportedModes: ["default", "logo"],
  },
  {
    id: "simple-microphone",
    title: "Microphone",
    description: "Sound level becomes a bar. Loud sound sparkles.",
    hexPath: "/usb-serial-demo-simple-microphone.hex",
    supportedModes: ["default", "microphone"],
  },
  {
    id: "simple-shake-impact",
    title: "Shake / impact",
    description: "Shake, freefall, or strong movement makes a sparkle.",
    hexPath: "/usb-serial-demo-simple-shake-impact.hex",
    supportedModes: ["default", "shake", "freefall", "accel2g", "accel3g", "accel6g", "accel8g"],
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
  const desktopSidebarWidth = "360px";
  const navbarHeight = "72px";
  const toast = useToast();
  const microbitDrawing = useMemo(() => new MicrobitDrawing(), []);
  const mbConnector = useMemo(() => new UsbSerialConnector(), []);
  const [mode, setMode] = useState<"landing" | "connected">("landing");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [flashingDemoId, setFlashingDemoId] = useState<string | null>(null);
  const [isMicrobitShaking, setIsMicrobitShaking] = useState(false);
  const [infoPanelMode, setInfoPanelMode] = useState<InfoPanelMode>("default");
  const [isInfoPanelLocked, setIsInfoPanelLocked] = useState(false);
  const [latestInputBehaviour, setLatestInputBehaviour] = useState<InputBehaviour | null>(null);
  const [accelerometerData, setAccelerometerData] = useState<SensorPoint[]>([]);
  const [magnetometerData, setMagnetometerData] = useState<SensorPoint[]>([]);
  const [temperatureData, setTemperatureData] = useState<TemperaturePoint[]>([]);
  const shakeTimeoutRef = useRef<number | null>(null);
  const idleTimeoutRef = useRef<number | null>(null);
  const visualTimeoutsRef = useRef(new Map<InputButton, number>());
  const activeInputsRef = useRef(new Set<InputButton>());
  const lastPrimaryInputAtRef = useRef(0);
  const infoDisclosure = useDisclosure();
  const isLargeScreen = useBreakpointValue({ base: false, lg: true });
  const svgWidth = useBreakpointValue({
    base: "220px",
    sm: "260px",
    md: "320px",
    lg: "360px",
    xl: "400px",
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

  const setComponentActive = useCallback((button: InputButton, active: boolean) => {
    if (button === "A") {
      microbitDrawing.buttonA = active;
      return;
    }

    if (button === "B") {
      microbitDrawing.buttonB = active;
      return;
    }

    if (button === "AB") {
      microbitDrawing.buttonA = active;
      microbitDrawing.buttonB = active;
      return;
    }

    if (button === "Logo") {
      microbitDrawing.touchLogo = active;
      return;
    }

    if (button === "Microphone") {
      microbitDrawing.microphone = active;
    }
  }, [microbitDrawing]);

  const pulseComponent = useCallback((button: InputButton, duration = 650) => {
    if (button === "Gesture") {
      triggerMicrobitShake();
      return;
    }

    const existingTimeout = visualTimeoutsRef.current.get(button);
    if (existingTimeout !== undefined) {
      window.clearTimeout(existingTimeout);
    }

    setComponentActive(button, true);
    const timeout = window.setTimeout(() => {
      setComponentActive(button, false);
      visualTimeoutsRef.current.delete(button);
    }, duration);
    visualTimeoutsRef.current.set(button, timeout);
  }, [setComponentActive, triggerMicrobitShake]);

  const applyComponentVisual = useCallback((input: InputBehaviour) => {
    const behaviour = input.behaviour as string;

    if (behaviour === "down" || behaviour === "on" || behaviour === "loud") {
      const existingTimeout = visualTimeoutsRef.current.get(input.button);
      if (existingTimeout !== undefined) {
        window.clearTimeout(existingTimeout);
        visualTimeoutsRef.current.delete(input.button);
      }
      setComponentActive(input.button, true);
      if (input.button === "Microphone") {
        pulseComponent(input.button, 1200);
      }
      return;
    }

    if (behaviour === "up" || behaviour === "off" || behaviour === "quiet" || behaviour === "notPressed") {
      const existingTimeout = visualTimeoutsRef.current.get(input.button);
      if (existingTimeout !== undefined) {
        window.clearTimeout(existingTimeout);
        visualTimeoutsRef.current.delete(input.button);
      }
      setComponentActive(input.button, false);
      return;
    }

    pulseComponent(input.button);
  }, [pulseComponent, setComponentActive]);

  useEffect(() => {
    return () => {
      if (shakeTimeoutRef.current !== null) {
        window.clearTimeout(shakeTimeoutRef.current);
      }
      if (idleTimeoutRef.current !== null) {
        window.clearTimeout(idleTimeoutRef.current);
      }
      for (const timeout of visualTimeoutsRef.current.values()) {
        window.clearTimeout(timeout);
      }
      visualTimeoutsRef.current.clear();
    };
  }, []);

  const setInfoPanelModeWithLock = useCallback((nextMode: InfoPanelMode, force = false) => {
    if (!force && isInfoPanelLocked) {
      return;
    }

    setInfoPanelMode(nextMode);
  }, [isInfoPanelLocked]);

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
      }, INPUT_IDLE_DELAY_MS);
    };

    mbConnector.setTemperatureUpdate((value) => {
      setTemperatureData((previous) => {
        const next = [...previous, { time: Date.now(), value }];
        return next.slice(-150);
      });
    });

    mbConnector.setOnTiltUp(() => {
      console.log("tiltUp");
      setInfoPanelModeWithLock("tiltUpDown");
      showGestureInput("tiltUp", "Tilt up");
    });

    mbConnector.setOnTiltDown(() => {
      console.log("tiltDown");
      setInfoPanelModeWithLock("tiltUpDown");
      showGestureInput("tiltDown", "Tilt down");
    });

    mbConnector.setOnTiltLeft(() => {
      console.log("tiltLeft");
      setInfoPanelModeWithLock("tiltLeft");
      showGestureInput("tiltLeft", "Tilt left");
    });

    mbConnector.setOnTiltRight(() => {
      console.log("tiltRight");
      setInfoPanelModeWithLock("tiltRight");
      showGestureInput("tiltRight", "Tilt right");
    });

    mbConnector.setOnFaceUp(() => {
      console.log("faceUp");
      setInfoPanelModeWithLock("faceUp");
      showGestureInput("faceUp", "Face up");
    });

    mbConnector.setOnFaceDown(() => {
      console.log("faceDown");
      setInfoPanelModeWithLock("faceDown");
      showGestureInput("faceDown", "Face down");
    });

    mbConnector.setOnFreefall(() => {
      console.log("freefall");
      setInfoPanelModeWithLock("freefall");
      showGestureInput("freefall", "Freefall");
    });

    mbConnector.setOnAcceleration3g(() => {
      console.log("acceleration3g");
      setInfoPanelModeWithLock("accel3g");
    });

    mbConnector.setOnAcceleration6g(() => {
      console.log("acceleration6g");
      setInfoPanelModeWithLock("accel6g");
    });

    mbConnector.setOnAcceleration8g(() => {
      console.log("acceleration8g");
      setInfoPanelModeWithLock("accel8g");
    });

    mbConnector.setOnAcceleration2g(() => {
      console.log("acceleration2g");
      setInfoPanelModeWithLock("accel2g");
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
      setInfoPanelModeWithLock("buttonA");
    });
    mbConnector.setOnButtonAUp(() => {
      microbitDrawing.buttonA = false;
    });
    mbConnector.setOnButtonBDown(() => {
      microbitDrawing.buttonB = true;
      setInfoPanelModeWithLock("buttonB");
    });
    mbConnector.setOnButtonBUp(() => {
      microbitDrawing.buttonB = false;
    });
    mbConnector.setOnInputBehaviour((input) => {
      applyComponentVisual(input);

      if (isActiveStart(input.behaviour)) {
        activeInputsRef.current.add(input.button);
      }

      if (isActiveEnd(input.behaviour)) {
        activeInputsRef.current.delete(input.button);
      }

      const shouldDisplay = isDisplayableInput(input);
      const isMicrophone = isMicrophoneInput(input);
      const hasActivePrimaryInput = [...activeInputsRef.current].some((button) => button !== "Microphone");
      const microphoneCanTakeFocus = Date.now() - lastPrimaryInputAtRef.current > INPUT_IDLE_DELAY_MS && !hasActivePrimaryInput;

      if (!isMicrophone && (shouldDisplay || isActiveStart(input.behaviour))) {
        lastPrimaryInputAtRef.current = Date.now();
      }

      if (isMicrophone && !microphoneCanTakeFocus) {
        return;
      }

      if (idleTimeoutRef.current !== null) {
        window.clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = null;
      }

      if (shouldDisplay || isMicrophone) {
        setLatestInputBehaviour(input);
      }

      if (isMicrophone) {
        idleTimeoutRef.current = window.setTimeout(() => {
          setLatestInputBehaviour(null);
          idleTimeoutRef.current = null;
        }, isMicrophoneActive(input.behaviour) ? 1200 : 500);
      } else if (activeInputsRef.current.size === 0) {
        idleTimeoutRef.current = window.setTimeout(() => {
          setLatestInputBehaviour(null);
          idleTimeoutRef.current = null;
        }, INPUT_IDLE_DELAY_MS);
      }

      console.log("Input behaviour: ", `${formatInputButton(input.button)} ${input.label}`);

      if (shouldDisplay || isActiveStart(input.behaviour)) {
        if (input.button === "A") setInfoPanelModeWithLock("buttonA");
        else if (input.button === "B") setInfoPanelModeWithLock("buttonB");
        else if (input.button === "AB") setInfoPanelModeWithLock("buttonAB");
        else if (input.button === "Logo") setInfoPanelModeWithLock("logo");
        else if (input.button === "Microphone" && microphoneCanTakeFocus) setInfoPanelModeWithLock("microphone");
        else if (input.button === "Gesture") {
          const nextMode = getGestureModeFromBehaviour(input.behaviour);
          if (nextMode) {
            setInfoPanelModeWithLock(nextMode);
          }
        }
      }
    });
    mbConnector.setOnLogoDown(() => {
      microbitDrawing.touchLogo = true;
      setInfoPanelModeWithLock("logo");
    });
    mbConnector.setOnLogoUp(() => {
      microbitDrawing.touchLogo = false;
    });
    mbConnector.setOnShake(() => {
      setInfoPanelModeWithLock("shake");
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
  }, [applyComponentVisual, mbConnector, microbitDrawing, setInfoPanelModeWithLock, triggerMicrobitShake]);

  const openInfoPanel = useCallback((nextMode: InfoPanelMode) => {
    setInfoPanelModeWithLock(nextMode);
    if (!isLargeScreen) {
      infoDisclosure.onOpen();
    }
  }, [infoDisclosure, isLargeScreen, setInfoPanelModeWithLock]);

  const handleMicrobitDrawingClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const nextMode = findMicrobitSvgPart(event.target);
    if (!nextMode) return;

    openInfoPanel(nextMode);
    const input = createSvgClickInput(nextMode);
    if (!input) return;

    applyComponentVisual(input);
    setLatestInputBehaviour(input);
    lastPrimaryInputAtRef.current = Date.now();

    if (idleTimeoutRef.current !== null) {
      window.clearTimeout(idleTimeoutRef.current);
    }

    idleTimeoutRef.current = window.setTimeout(() => {
      setLatestInputBehaviour(null);
      idleTimeoutRef.current = null;
    }, INPUT_IDLE_DELAY_MS);
  }, [applyComponentVisual, openInfoPanel]);

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
  const defaultDemoProgram = actionDemoPrograms.find((demo) => demo.id === "default");
  const currentDemoForPanel = useMemo(() => {
    if (infoPanelMode === "default") {
      return defaultDemoProgram;
    }

    return demoProgramsForCurrentPanel.find((demo) => demo.id !== "default") ?? defaultDemoProgram;
  }, [demoProgramsForCurrentPanel, defaultDemoProgram, infoPanelMode]);
  const restoreDemoForPanel = currentDemoForPanel?.id === defaultDemoProgram?.id ? undefined : defaultDemoProgram;

  const infoPanelBody = (
    <InfoPanelContent
      mode={infoPanelMode}
      currentDemo={currentDemoForPanel}
      restoreDemo={restoreDemoForPanel}
      isFlashing={isFlashing}
      flashingDemoId={flashingDemoId}
      onFlashDemo={handleFlashDemoHex}
      isPanelLocked={isInfoPanelLocked}
      onTogglePanelLock={() => setIsInfoPanelLocked((value) => !value)}
    />
  );

  const isDesktopSidebarVisible = mode === "connected" && Boolean(isLargeScreen);
  const isMobileInfoDrawerOpen = mode === "connected" && !isLargeScreen && infoDisclosure.isOpen;
  const currentInputDisplay = latestInputBehaviour
    ? {
      component: formatInputButton(latestInputBehaviour.button),
      event: latestInputBehaviour.label,
      visualType: latestInputBehaviour.button,
      isIdle: false,
    }
    : { component: "Status", event: "Idle", visualType: null, isIdle: true };

  return (
    <Container maxW="100%" minH="100vh" px={0} bg="#f7f9fc">
      <Flex
        as="nav"
        px={{ base: 4, md: 6 }}
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
            <Image src={MicrobitLogo} alt="micro:bit" h="36px" w="auto" />
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
                  onClick={() => {
                    setInfoPanelModeWithLock("default", true);
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
          py={{ base: 3, md: 4 }}
        >
          <Grid
            templateColumns={{ base: "1fr", xl: `minmax(0, 1fr) ${desktopSidebarWidth}` }}
            gap={4}
            alignItems="start"
          >
            <GridItem minW={0}>
              <Stack spacing={4}>
                <Box
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="8px"
                  boxShadow="0 14px 32px rgba(15, 23, 42, 0.08)"
                  px={{ base: 4, md: 5 }}
                  py={{ base: 3, md: 4 }}
                >
                  <Center minH={{ base: "220px", lg: "280px" }}>
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
                      <MicrobitSVG width={svgWidth ?? "300px"} />
                    </Box>
                  </Center>

                  <HStack
                    spacing={4}
                    bg={currentInputDisplay.isIdle ? "gray.50" : "blue.50"}
                    border="1px solid"
                    borderColor={currentInputDisplay.isIdle ? "gray.200" : "blue.100"}
                    borderRadius="8px"
                    px={{ base: 4, md: 5 }}
                    py={{ base: 3, md: 4 }}
                    mt={3}
                    maxW="640px"
                    mx="auto"
                  >
                    <Center
                      w={{ base: "44px", md: "48px" }}
                      h={{ base: "44px", md: "48px" }}
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
                      ) : currentInputDisplay.visualType === "A" || currentInputDisplay.visualType === "B" ? (
                        currentInputDisplay.visualType
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
                        <Text color={currentInputDisplay.isIdle ? "gray.700" : "blue.800"} fontWeight="bold" fontSize={{ base: "lg", md: "xl" }}>
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
                        <Text color={currentInputDisplay.isIdle ? "gray.700" : "blue.800"} fontWeight="bold" fontSize={{ base: "lg", md: "xl" }}>
                          {currentInputDisplay.event}
                      </Text>
                    </Box>
                    </HStack>
                  </HStack>
                </Box>

                <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
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
                  <Box
                    bg="white"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="8px"
                    px={5}
                    py={5}
                    boxShadow="0 10px 24px rgba(15, 23, 42, 0.06)"
                  >
                    <TemperatureChart data={temperatureData} title="Temperature" />
                  </Box>
                </SimpleGrid>
              </Stack>
            </GridItem>

            {isDesktopSidebarVisible && (
              <GridItem minW={0}>
                <Box
                  position="sticky"
                  top={`calc(${navbarHeight} + 16px)`}
                  maxH={`calc(100dvh - ${navbarHeight} - 32px)`}
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
