import type { InfoPanelData, InfoPanelMode } from "../types/info-panel";

const infoPanels: Record<InfoPanelMode, InfoPanelData> = {
    default: {
        title: "Digital Twin",
        description:
            "Perform an action on your physical Micro:bit or select an Input component on the digital twin to see the relevant MakeCode reference.",
        docsUrl: "https://makecode.microbit.org/reference/input",
    },
    buttonA: {
        title: "Button A Pressed",
        description:
            "Button A was pressed on the connected micro:bit. See the reference below for the documentation of a Button Press.",
        docsUrl: "https://makecode.microbit.org/reference/input/on-button-pressed",
        embedUrl: "https://makecode.microbit.org/---docs#doc:/reference/input/on-button-pressed:blocks:live-en",
    },
    buttonB: {
        title: "Button B Pressed",
        description:
            "Button B was pressed on the connected micro:bit. See the reference below for the documentation of a Button Press.",
        docsUrl: "https://makecode.microbit.org/reference/input/on-button-pressed",
        embedUrl: "https://makecode.microbit.org/---docs#doc:/reference/input/on-button-pressed:blocks:live-en",
    },
    logo: {
        title: "Logo Pressed",
        description:
            "The micro:bit logo touch input was pressed. See the reference below for the documentation of Logo Press.",
        docsUrl: "https://makecode.microbit.org/reference/input/on-logo-event",
        embedUrl: "https://makecode.microbit.org/---docs#doc:/reference/input/on-logo-event:blocks:live-en",
    },
    microphone: {
        title: "Microphone Sound",
        description:
            "The micro:bit microphone detected a loud or quiet sound event. See the reference below for the documentation of the Microphone.",
        docsUrl: "https://makecode.microbit.org/reference/input/on-sound",
        embedUrl: "https://makecode.microbit.org/---docs#doc:/reference/input/on-sound:blocks:live-en",
    },
    shake: {
        title: "Shake Gesture",
        description:
            "The accelerometer detected a shake gesture. See the reference below for the documentation of multiple gestures.",
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
