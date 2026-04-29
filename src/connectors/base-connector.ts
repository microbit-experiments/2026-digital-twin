import { MicrobitConnector, type InputBehaviour } from "../types/microbit-connector"

export abstract class BaseConnector extends MicrobitConnector {
    protected onNoAuthorizedDevice?: () => void;
    protected onDisconnect?: () => void;
    protected onConnect?: () => void;
    protected onConnecting?: () => void;
    protected onPause?: () => void;

    protected buttonADown?: () => void;
    protected buttonAUp?: () => void;

    protected buttonBDown?: () => void;
    protected buttonBUp?: () => void;

    protected inputBehaviourUpdate?: (input: InputBehaviour) => void;

    protected ledMatrixUpdate?: (row: number, col: number, val: boolean) => void;

    protected accelerometerUpdate?: (x: number, y: number, z: number) => void;
    protected magnetometerUpdate?: (x: number, y: number, z: number) => void;
    protected temperatureUpdate?: (x: number) => void;

    protected micLedUpdate?: (val: boolean) => void;

    protected onLogoDown?: () => void;
    protected onLogoUp?: () => void;

    protected templateLedUpdate?: (val: boolean) => void;

    protected onTiltUp?: () => void;
    protected onTiltDown?: () => void;
    protected onTiltLeft?: () => void;
    protected onTiltRight?: () => void;
    protected onFaceUp?: () => void;
    protected onFaceDown?: () => void;
    protected onFreefall?: () => void;
    protected onAcceleration3g?: () => void;
    protected onAcceleration6g?: () => void;
    protected onAcceleration8g?: () => void;
    protected onShake?: () => void;
    protected onAcceleration2g?: () => void;

    protected log(text: unknown) {
        console.log(`[${this.constructor.name}] ${text}`)
    }

    public setOnNoAuthorizedDevice(callback: () => void): void {
        this.onNoAuthorizedDevice = callback;
    }

    public setOnDisconnect(callback: () => void): void {
        this.onDisconnect = callback;
    }

    public setOnConnect(callback: () => void): void {
        this.onConnect = callback;
    }

    public setOnConnecting(callback: () => void): void {
        this.onConnecting = callback;
    }

    public setOnPause(callback: () => void): void {
        this.onPause = callback;
    }


    public setOnButtonADown(callback: () => void): void {
        this.buttonADown = callback;
    }

    public setOnButtonAUp(callback: () => void): void {
        this.buttonAUp = callback;
    }

    public setOnButtonBDown(callback: () => void): void {
        this.buttonBDown = callback;
    }

    public setOnButtonBUp(callback: () => void): void {
        this.buttonBUp = callback;
    }

    public setOnInputBehaviour(callback: (input: InputBehaviour) => void): void {
        this.inputBehaviourUpdate = callback;
    }

    public setLedMatrixUpdate(callback: (row: number, col: number, val: boolean) => void): void {
        this.ledMatrixUpdate = callback;
    }

    public setAccelerometerUpdate(callback: (x: number, y: number, z: number) => void): void {
        this.accelerometerUpdate = callback;
    }

    public setMagnetometerUpdate(callback: (x: number, y: number, z: number) => void): void {
        this.magnetometerUpdate = callback;
    }

    public setTemperatureUpdate(callback: (x: number) => void): void {
        this.temperatureUpdate = callback;
    }

    public setMicLedUpdate(callback: (val: boolean) => void): void {
        this.micLedUpdate = callback;
    }

    public setTemplateLedUpdate(callback: (val: boolean) => void): void {
        this.templateLedUpdate = callback;
    }

    public setOnLogoDown(callback: () => void): void {
        this.onLogoDown = callback;
    }

    public setOnLogoUp(callback: () => void): void {
        this.onLogoUp = callback;
    }

    public setOnTiltUp(callback: () => void): void {
        this.onTiltUp = callback;
    }

    public setOnTiltDown(callback: () => void): void {
        this.onTiltDown = callback;
    }

    public setOnTiltLeft(callback: () => void): void {
        this.onTiltLeft = callback;
    }

    public setOnTiltRight(callback: () => void): void {
        this.onTiltRight = callback;
    }

    public setOnFaceUp(callback: () => void): void {
        this.onFaceUp = callback;
    }

    public setOnFaceDown(callback: () => void): void {
        this.onFaceDown = callback;
    }

    public setOnFreefall(callback: () => void): void {
        this.onFreefall = callback;
    }

    public setOnAcceleration3g(callback: () => void): void {
        this.onAcceleration3g = callback;
    }

    public setOnAcceleration6g(callback: () => void): void {
        this.onAcceleration6g = callback;
    }

    public setOnAcceleration8g(callback: () => void): void {
        this.onAcceleration8g = callback;
    }

    public setOnShake(callback: () => void): void {
        this.onShake = callback;
    }

    public setOnAcceleration2g(callback: () => void): void {
        this.onAcceleration2g = callback;
    }
}
