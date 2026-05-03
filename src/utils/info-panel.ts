import type { InfoPanelData, InfoPanelMode } from "../types/info-panel";

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
};

export function getInfoPanelData(mode: InfoPanelMode) {
    return infoPanels[mode];
}

export function getInfoPanelTitle(mode: InfoPanelMode) {
    return infoPanels[mode].title;
}
