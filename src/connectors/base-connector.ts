import { MicrobitConnector } from "../types/microbit-connector"

export abstract class BaseConnector extends MicrobitConnector {
    protected buttonADown?: () => void;
    protected buttonAUp?: () => void;

    protected buttonBDown?: () => void;
    protected buttonBUp?: () => void;

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

    protected log(text: any) {
        console.log(`[${this.constructor.name}] ${text}`)
    }

    public setOnButtonADown(callback: () => void): void {
        this.buttonADown = callback;
        this.log("buttonADown handler registered")
    }

    public setOnButtonAUp(callback: () => void): void {
        this.buttonAUp = callback;
        this.log("buttonAUp handler registered")
    }

    public setOnButtonBDown(callback: () => void): void {
        this.buttonBDown = callback;
        this.log("buttonBDown handler registered")
    }

    public setOnButtonBUp(callback: () => void): void {
        this.buttonBUp = callback;
        this.log("buttonBUp handler registered")
    }

    public setLedMatrixUpdate(callback: (row: number, col: number, val: boolean) => void): void {
        this.ledMatrixUpdate = callback;
        this.log("ledMatrixUpdate handler registered")
    }

    public setAccelerometerUpdate(callback: (x: number, y: number, z: number) => void): void {
        this.accelerometerUpdate = callback;
        this.log("accelerometerUpdate handler registered")
    }

    public setMagnetometerUpdate(callback: (x: number, y: number, z: number) => void): void {
        this.magnetometerUpdate = callback;
        this.log("magnetometerUpdate handler registered")
    }

    public setTemperatureUpdate(callback: (x: number) => void): void {
        this.temperatureUpdate = callback;
        this.log("temperatureUpdate handler registered")
    }

    public setMicLedUpdate(callback: (val: boolean) => void): void {
        this.micLedUpdate = callback;
        this.log("micLedUpdate handler registered");
    }

    public setTemplateLedUpdate(callback: (val: boolean) => void): void {
        this.templateLedUpdate = callback;
        this.log("templateLedUpdate handler registered");
    }

    public setOnLogoDown(callback: () => void): void {
        this.onLogoDown = callback;
        this.log("onLogoDown handler registered")
    }

    public setOnLogoUp(callback: () => void): void {
        this.onLogoUp = callback;
        this.log("onLogoUp handler registered")
    }

    public setOnTiltUp(callback: () => void): void {
        this.onTiltUp = callback;
        this.log("onTiltUp handler registered")
    }

    public setOnTiltDown(callback: () => void): void {
        this.onTiltDown = callback;
        this.log("onTiltDown handler registered")
    }

    public setOnTiltLeft(callback: () => void): void {
        this.onTiltLeft = callback;
        this.log("onTiltLeft handler registered")
    }

    public setOnTiltRight(callback: () => void): void {
        this.onTiltRight = callback;
        this.log("onTiltRight handler registered")
    }

    public setOnFaceUp(callback: () => void): void {
        this.onFaceUp = callback;
        this.log("onFaceUp handler registered")
    }

    public setOnFaceDown(callback: () => void): void {
        this.onFaceDown = callback;
        this.log("onFaceDown handler registered")
    }

    public setOnFreefall(callback: () => void): void {
        this.onFreefall = callback;
        this.log("onFreefall handler registered")
    }

    public setOnAcceleration3g(callback: () => void): void {
        this.onAcceleration3g = callback;
        this.log("onAcceleration3g handler registered")
    }

    public setOnAcceleration6g(callback: () => void): void {
        this.onAcceleration6g = callback;
        this.log("onAcceleration6g handler registered")
    }

    public setOnAcceleration8g(callback: () => void): void {
        this.onAcceleration8g = callback;
        this.log("onAcceleration8g handler registered")
    }

    public setOnShake(callback: () => void): void {
        this.onShake = callback;
        this.log("onShake handler registered")
    }

    public setOnAcceleration2g(callback: () => void): void {
        this.onAcceleration2g = callback;
        this.log("onAcceleration2g handler registered")
    }
}