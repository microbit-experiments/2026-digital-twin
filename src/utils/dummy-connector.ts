import { MicrobitConnector } from "../types/microbit-connector";

const EVENT_INTERVAL_MS = 2000;
const SENSOR_INTERVAL_MS = 200;

type HandlerEntry = {
    name: string;
    invoke: () => void;
};

type SensorVector = {
    x: number;
    y: number;
    z: number;
};

export class DummyMicrobitConnector extends MicrobitConnector {
    private eventIntervalId: number | null = null;
    private accelerometerIntervalId: number | null = null;
    private magnetometerIntervalId: number | null = null;
    private isConnected = false;
    private accelerometerVector = this.randomVector();
    private magnetometerVector = this.randomVector();

    private buttonADown?: () => void;
    private buttonAUp?: () => void;
    private buttonBDown?: () => void;
    private buttonBUp?: () => void;
    private onLogoDown?: () => void;
    private onLogoUp?: () => void;
    private onShake?: () => void;

    private ledMatrixUpdate?: (row: number, col: number, val: boolean) => void;
    private ledPollingFrequency?: number;

    private accelerometerUpdate?: (x: number, y: number, z: number) => void;
    private accelerometerPollingFrequency?: number;

    private magnetometerUpdate?: (x: number, y: number, z: number) => void;
    private magnetometerPollingFrequency?: number;

    private micLedUpdate?: (val: boolean) => void;
    private micLedPollingFrequency?: number;

    private templateLedUpdate?: (val: boolean) => void;
    private templateLedPollingFrequency?: number;

    public async handleConnect(): Promise<void> {
        console.log("[DummyConnector] handleConnect called");
        await this.delay(300);
        const failed = Math.random() < 0.1;
        if (failed) {
            const error = new Error("Simulated connection failure");
            console.log("[DummyConnector] Connection failed", error.message);
            throw error;
        }

        console.log("[DummyConnector] Connection accepted");
        this.isConnected = true;
        this.startEventLoop();
        this.startSensorLoops();
    }

    public setOnButtonADown(callback: () => void): void {
        this.buttonADown = callback;
        console.log("[DummyConnector] onButtonADown registered");
    }

    public setOnButtonAUp(callback: () => void): void {
        this.buttonAUp = callback;
        console.log("[DummyConnector] onButtonAUp registered");
    }

    public setOnButtonBDown(callback: () => void): void {
        this.buttonBDown = callback;
        console.log("[DummyConnector] onButtonBDown registered");
    }

    public setOnButtonBUp(callback: () => void): void {
        this.buttonBUp = callback;
        console.log("[DummyConnector] onButtonBUp registered");
    }

    public setOnShake(callback: () => void): void {
        this.onShake = callback;
        console.log("[DummyConnector] onShake handler registered");
    }

    public setOnLogoDown(callback: () => void): void {
        this.onLogoDown = callback;
        console.log("[DummyConnector] onLogoDown handler registered");
    }

    public setOnLogoUp(callback: () => void): void {
        this.onLogoUp = callback;
        console.log("[DummyConnector] onLogoUp handler registered");
    }

    public setLedPolling(freq: number): void {
        this.ledPollingFrequency = freq;
        console.log(`[DummyConnector] ledPollingFrequency set to ${freq}`);
    }

    public setLedMatrixUpdate(callback: (row: number, col: number, val: boolean) => void): void {
        this.ledMatrixUpdate = callback;
        console.log("[DummyConnector] ledMatrixUpdate handler registered");
    }

    public setAccelerometerPolling(freq: number): void {
        this.accelerometerPollingFrequency = freq;
        console.log(`[DummyConnector] accelerometerPollingFrequency set to ${freq}`);
    }

    public setAccelerometerUpdate(callback: (x: number, y: number, z: number) => void): void {
        this.accelerometerUpdate = callback;
        console.log("[DummyConnector] accelerometerUpdate handler registered");
        this.maybeStartAccelerometerLoop();
    }

    public setMagnetometerPolling(freq: number): void {
        this.magnetometerPollingFrequency = freq;
        console.log(`[DummyConnector] magnetometerPollingFrequency set to ${freq}`);
    }

    public setMagnetometerUpdate(callback: (x: number, y: number, z: number) => void): void {
        this.magnetometerUpdate = callback;
        console.log("[DummyConnector] magnetometerUpdate handler registered");
        this.maybeStartMagnetometerLoop();
    }

    public setMicLedPolling(freq: number): void {
        this.micLedPollingFrequency = freq;
        console.log(`[DummyConnector] micLedPollingFrequency set to ${freq}`);
    }

    public setMicLedUpdate(callback: (val: boolean) => void): void {
        this.micLedUpdate = callback;
        console.log("[DummyConnector] micLedUpdate handler registered");
    }

    public setTemplateLedPolling(freq: number): void {
        this.templateLedPollingFrequency = freq;
        console.log(`[DummyConnector] templateLedPollingFrequency set to ${freq}`);
    }

    public setTemplateLedUpdate(callback: (val: boolean) => void): void {
        this.templateLedUpdate = callback;
        console.log("[DummyConnector] templateLedUpdate handler registered");
    }

    private startEventLoop(): void {
        if (this.eventIntervalId !== null) {
            console.log("[DummyConnector] Event loop already running");
            return;
        }

        console.log("[DummyConnector] Starting random event loop");
        this.eventIntervalId = window.setInterval(() => {
            this.triggerRandomHandler();
        }, EVENT_INTERVAL_MS);
    }

    private startSensorLoops(): void {
        this.maybeStartAccelerometerLoop();
        this.maybeStartMagnetometerLoop();
    }

    private maybeStartAccelerometerLoop(): void {
        if (!this.isConnected || !this.accelerometerUpdate || this.accelerometerIntervalId !== null) {
            return;
        }

        console.log("[DummyConnector] Starting accelerometer loop (5 Hz)");
        this.accelerometerIntervalId = window.setInterval(() => {
            this.accelerometerVector = this.nextVector(this.accelerometerVector);
            const { x, y, z } = this.accelerometerVector;
            console.log(`[DummyConnector] Emitting accelerometerUpdate ${x.toFixed(2)},${y.toFixed(2)},${z.toFixed(2)}`);
            this.accelerometerUpdate?.(x, y, z);
        }, SENSOR_INTERVAL_MS);
    }

    private maybeStartMagnetometerLoop(): void {
        if (!this.isConnected || !this.magnetometerUpdate || this.magnetometerIntervalId !== null) {
            return;
        }

        console.log("[DummyConnector] Starting magnetometer loop (5 Hz)");
        this.magnetometerIntervalId = window.setInterval(() => {
            this.magnetometerVector = this.nextVector(this.magnetometerVector);
            const { x, y, z } = this.magnetometerVector;
            console.log(`[DummyConnector] Emitting magnetometerUpdate ${x.toFixed(2)},${y.toFixed(2)},${z.toFixed(2)}`);
            this.magnetometerUpdate?.(x, y, z);
        }, SENSOR_INTERVAL_MS);
    }

    private triggerRandomHandler(): void {
        const handlers = this.collectHandlers();
        if (handlers.length === 0) {
            console.log("[DummyConnector] No handlers registered yet");
            return;
        }

        const selection = handlers[Math.floor(Math.random() * handlers.length)];
        console.log(`[DummyConnector] Triggering handler: ${selection.name}`);
        selection.invoke();
    }

    private collectHandlers(): HandlerEntry[] {
        const result: HandlerEntry[] = [];

        if (this.buttonADown) {
            result.push({
                name: "buttonADown",
                invoke: () => {
                    console.log("[DummyConnector] Invoking buttonADown");
                    this.buttonADown?.();
                },
            });
        }

        if (this.buttonAUp) {
            result.push({
                name: "buttonAUp",
                invoke: () => {
                    console.log("[DummyConnector] Invoking buttonAUp");
                    this.buttonAUp?.();
                },
            });
        }

        if (this.buttonBDown) {
            result.push({
                name: "buttonBDown",
                invoke: () => {
                    console.log("[DummyConnector] Invoking buttonBDown");
                    this.buttonBDown?.();
                },
            });
        }

        if (this.buttonBUp) {
            result.push({
                name: "buttonBUp",
                invoke: () => {
                    console.log("[DummyConnector] Invoking buttonBUp");
                    this.buttonBUp?.();
                },
            });
        }

        if (this.onShake) {
            result.push({
                name: "onShake",
                invoke: () => {
                    console.log("[DummyConnector] Invoking onShake");
                    this.onShake?.();
                },
            });
        }

        if (this.onLogoDown) {
            result.push({
                name: "onLogoDown",
                invoke: () => {
                    console.log("[DummyConnector] Invoking onLogoDown");
                    this.onLogoDown?.();
                },
            });
        }

        if (this.onLogoUp) {
            result.push({
                name: "onLogoUp",
                invoke: () => {
                    console.log("[DummyConnector] Invoking onLogoUp");
                    this.onLogoUp?.();
                },
            });
        }

        if (this.ledMatrixUpdate) {
            result.push({
                name: "ledMatrixUpdate",
                invoke: () => {
                    const row = this.randomIndex();
                    const col = this.randomIndex();
                    const val = this.randomBoolean();
                    console.log(`[DummyConnector] Sending ledMatrixUpdate ${row},${col},${val}`);
                    this.ledMatrixUpdate?.(row, col, val);
                },
            });
        }

        if (this.micLedUpdate) {
            result.push({
                name: "micLedUpdate",
                invoke: () => {
                    const val = this.randomBoolean();
                    console.log(`[DummyConnector] Sending micLedUpdate ${val}`);
                    this.micLedUpdate?.(val);
                },
            });
        }

        if (this.templateLedUpdate) {
            result.push({
                name: "templateLedUpdate",
                invoke: () => {
                    const val = this.randomBoolean();
                    console.log(`[DummyConnector] Sending templateLedUpdate ${val}`);
                    this.templateLedUpdate?.(val);
                },
            });
        }

        return result;
    }

    private randomIndex(): number {
        return Math.floor(Math.random() * 5);
    }

    private randomBoolean(): boolean {
        return Math.random() < 0.5;
    }

    private randomVector(): SensorVector {
        return {
            x: Math.random() * 2 - 1,
            y: Math.random() * 2 - 1,
            z: Math.random() * 2 - 1,
        };
    }

    private nextVector(previous: SensorVector): SensorVector {
        const delta = () => (Math.random() * 0.2 - 0.1);
        const clamp = (value: number) => Math.max(-1, Math.min(1, value));
        return {
            x: clamp(previous.x + delta()),
            y: clamp(previous.y + delta()),
            z: clamp(previous.z + delta()),
        };
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
