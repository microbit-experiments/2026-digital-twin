import type { InputBehaviourKind, InputButton } from "./microbit-connector";

export type LedMatrixPayload = number[][] | boolean[][];

export type MicrobitSerialEvent =
    | {
        type: "button";
        button: InputButton;
        event: InputBehaviourKind;
        label?: string;
    }
    | {
        type: "gesture";
        event: InputBehaviourKind;
        label?: string;
    }
    | {
        type: "accelerometer";
        x: number;
        y: number;
        z: number;
    }
    | {
        type: "magnetometer";
        x: number;
        y: number;
        z: number;
    }
    | {
        type: "temperature";
        celsius: number;
    }
    | {
        type: "microphone";
        event: "loud" | "quiet";
    }
    | {
        type: "led";
        matrix: LedMatrixPayload;
    };

export type WebsiteSerialCommand =
    | {
        type: "show_text";
        text: string;
    }
    | {
        type: "set_led";
        x: number;
        y: number;
        on: boolean;
    }
    | {
        type: "clear_display";
    }
    | {
        type: "ping";
    };
