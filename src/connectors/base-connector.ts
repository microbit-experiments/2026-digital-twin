import { MicrobitConnector } from "../types/microbit-connector"

export abstract class BaseConnector extends MicrobitConnector {
    protected buttonADown?: () => void;
    protected buttonAUp?: () => void;
    
    protected buttonBDown?: () => void;
    protected buttonBUp?: () => void;

    protected ledMatrixUpdate?: (row: number, col: number, val: boolean) => void;
    
    protected accelerometerUpdate?: (x: number, y: number, z: number) => void;

    protected magnetometerUpdate?: (x: number, y: number, z: number) => void;

    protected micLedUpdate?: (val: boolean) => void;

    protected onLogoDown?: () => void;
    protected onLogoUp?: () => void;
    
    protected templateLedUpdate?: (val: boolean) => void;

    protected onShake?: () => void;

    protected log(text: string) {
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

    public setOnShake(callback: () => void): void {
        this.onShake = callback;
        this.log("onShake handler registered")
    }

    public setMicLedUpdate(callback: (val: boolean) => void): void {
        this.micLedUpdate = callback;
        this.log("micLedUpdate handler registered");
    }
}