export abstract class MicrobitConnector {
    abstract handleConnect(): Promise<void>;

    abstract setOnButtonADown(callback: () => void): void;
    abstract setOnButtonAUp(callback: () => void): void;

    abstract setOnButtonBDown(callback: () => void): void;
    abstract setOnButtonBUp(callback: () => void): void;

    abstract setLedPolling(freq: number): void;
    abstract setLedMatrixUpdate(callback: (row: number, col: number, val: boolean) => void): void;

    abstract setAccelerometerPolling(freq: number): void;
    abstract setAccelerometerUpdate(callback: (x: number, y: number, z: number) => void): void;

    abstract setMagnetometerPolling(freq: number): void;
    abstract setMagnetometerUpdate(callback: (x: number, y: number, z: number) => void): void;

    abstract setMicLedPolling(freq: number): void;
    abstract setMicLedUpdate(callback: (val: boolean) => void): void;

    abstract setTemplateLedPolling(freq: number): void;
    abstract setTemplateLedUpdate(callback: (val: boolean) => void): void;

    abstract setOnLogoDown(callback: () => void): void;
    abstract setOnLogoUp(callback: () => void): void;

    abstract setOnShake(callback: () => void): void;
}
