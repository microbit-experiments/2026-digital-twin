import { ArrowForwardIcon, InfoIcon } from "@chakra-ui/icons";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Center,
  Container,
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
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import MicrobitSVG from "./assets/microbit-drawing.svg?react";
import ConnectGif from "./assets/connect-microbit.gif";
import { MicrobitDrawing } from "./utils/microbitDrawing";
import { DummyMicrobitConnector } from "./utils/dummy-connector";
import { createUniversalHexFlashDataSource, createWebUSBConnection } from "@microbit/microbit-connection";
import { InfoPanelContent, type InfoPanelMode } from "./components/InfoPanels";
import { SensorChart, type SensorPoint } from "./components/SensorChart";

function App() {
  const desktopSidebarWidth = "400px";
  const navbarHeight = "72px";
  const toast = useToast();
  const microbitDrawing = useMemo(() => new MicrobitDrawing(), []);
  const mbConnector = useMemo(() => new DummyMicrobitConnector(), []);
  const [mode, setMode] = useState<"landing" | "connected">("landing");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMicrobitShaking, setIsMicrobitShaking] = useState(false);
  const [infoPanelMode, setInfoPanelMode] = useState<InfoPanelMode>("default");
  const [accelerometerData, setAccelerometerData] = useState<SensorPoint[]>([]);
  const [magnetometerData, setMagnetometerData] = useState<SensorPoint[]>([]);
  const shakeTimeoutRef = useRef<number | null>(null);
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
    };
  }, []);

  useEffect(() => {
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

  const infoPanelBody = <InfoPanelContent mode={infoPanelMode} />;

  const handleConnect = useCallback(() => {
    if (isConnecting) return;
    setIsConnecting(true);
    const connectPromise = mbConnector.handleConnect();

    toast.promise(connectPromise, {
      loading: { title: "Connecting to the Micro:bit…" },
      success: { title: "Dummy Micro:bit is connected!" },
      error: { title: "Unable to connect to the dummy Micro:bit." },
    });

    connectPromise
      .then(() => setMode("connected"))
      .catch(() => setMode("landing"))
      .finally(() => setIsConnecting(false));
  }, [mbConnector, isConnecting, toast]);

  const handleFlashDemo = () => {
    const flash = async () => {
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
    };

    const flashingPromise = flash();

    toast.promise(flashingPromise, {
      loading: { title: "Flashing..." },
      success: { title: "Demo Program Successfully Flashed!" },
      error: { title: "Failed to Flash Demo Program :(" }
    })
  };

  const isDesktopSidebarVisible = mode === "connected" && Boolean(isLargeScreen);
  const isMobileInfoDrawerOpen = mode === "connected" && !isLargeScreen && infoDisclosure.isOpen;

  return (
    <Container maxW="100%" minH="100vh" px={0} bg="gray.50">
      <Flex
        as="nav"
        px={8}
        h={navbarHeight}
        w="100%"
        maxW="100%"
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
        align="center"
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Heading size="md">Microbit: Digital Twin</Heading>
        <Spacer />
        <Button
          rightIcon={<ArrowForwardIcon />}
          colorScheme="teal"
          variant="ghost"
          onClick={handleFlashDemo}
        >
          Flash Demo
        </Button>
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
          h={`calc(100vh - ${navbarHeight})`}
          px={{ base: 4, md: 8, lg: 10 }}
          pr={{ base: 4, md: 8, lg: `calc(${desktopSidebarWidth} + 40px)` }}
          py={0}
        >
          <Flex direction="column" minH={`calc(100vh - ${navbarHeight})`} gap={4}>
            <Center flex={1} minH={0}>
              <Box
                display="inline-block"
                transformOrigin="center center"
                animation={isMicrobitShaking ? "microbitShake 350ms ease-in-out" : undefined}
                sx={{
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
            <Box
              position="sticky"
              bottom={4}
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="xl"
              px={4}
              py={3}
              boxShadow="md"
            >
              <Stack spacing={5}>
                <SensorChart data={accelerometerData} title="Accelerometer (x, y, z)" showLegend={false} />
                <SensorChart data={magnetometerData} title="Magnetometer (x, y, z)" />
              </Stack>
            </Box>
          </Flex>
        </Container>
      )}

      {isDesktopSidebarVisible && (
        <Box
          position="fixed"
          right={0}
          top={navbarHeight}
          w={desktopSidebarWidth}
          h={`calc(100vh - ${navbarHeight})`}
          bg="white"
          borderLeft="1px solid"
          borderColor="gray.200"
          boxShadow="lg"
          px={0}
          py={8}
          zIndex={9}
        >
          {infoPanelBody}
        </Box>
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
          <DrawerHeader>Sidebar Info</DrawerHeader>
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
