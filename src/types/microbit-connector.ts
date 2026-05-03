export type InputButton = "A" | "B" | "AB" | "Logo" | "Microphone" | "Gesture";

export type InputBehaviourKind =
    | "down"
    | "up"
    | "click"
    | "longClick"
    | "hold"
    | "doubleClick"
    | "notPressed"
    | "shortPress"
    | "longPress"
    | "on"
    | "off"
    | "tiltUp"
    | "tiltDown"
    | "tiltLeft"
    | "tiltRight"
    | "faceUp"
    | "faceDown"
    | "freefall";

export type InputBehaviour = {
    button: InputButton;
    behaviour: InputBehaviourKind;
    label: string;
    source: "action" | "state";
    timestamp: number;
};

export abstract class MicrobitConnector {
    abstract handleConnect(): Promise<void>;

    abstract getLEDPollPeriod(): number | null;
    abstract getAccelerometerPollPeriod(): number | null;
    abstract getMagnetometerPollPeriod(): number | null;
    abstract getTemperaturePollPeriod(): number | null;

    abstract setOnNoAuthorizedDevice(callback: () => void): void;
    abstract setOnDisconnect(callback: () => void): void;
    abstract setOnConnect(callback: () => void): void;
    abstract setOnConnecting(callback: () => void): void;
    abstract setOnPause(callback: () => void): void;

    abstract setOnButtonADown(callback: () => void): void;
    abstract setOnButtonAUp(callback: () => void): void;

    abstract setOnButtonBDown(callback: () => void): void;
    abstract setOnButtonBUp(callback: () => void): void;

    abstract setOnInputBehaviour(callback: (input: InputBehaviour) => void): void;

    abstract setLedMatrixUpdate(callback: (row: number, col: number, val: boolean) => void): void;

    abstract setAccelerometerUpdate(callback: (x: number, y: number, z: number) => void): void;
    abstract setMagnetometerUpdate(callback: (x: number, y: number, z: number) => void): void;
    abstract setTemperatureUpdate(callback: (x: number) => void): void;

    abstract setMicLedUpdate(callback: (val: boolean) => void): void;

    abstract setTemplateLedUpdate(callback: (val: boolean) => void): void;

    abstract setOnLogoDown(callback: () => void): void;
    abstract setOnLogoUp(callback: () => void): void;

    abstract setOnTiltUp(callback: () => void): void;
    abstract setOnTiltDown(callback: () => void): void;
    abstract setOnTiltLeft(callback: () => void): void;
    abstract setOnTiltRight(callback: () => void): void;
    abstract setOnFaceUp(callback: () => void): void;
    abstract setOnFaceDown(callback: () => void): void;
    abstract setOnFreefall(callback: () => void): void;
    abstract setOnAcceleration3g(callback: () => void): void;
    abstract setOnAcceleration6g(callback: () => void): void;
    abstract setOnAcceleration8g(callback: () => void): void;
    abstract setOnShake(callback: () => void): void;
    abstract setOnAcceleration2g(callback: () => void): void;
}
