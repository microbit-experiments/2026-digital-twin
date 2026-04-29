import { ConnectionStatus, type ConnectionStatusChange } from "@microbit/microbit-connection";
import {
    type MicrobitUSBConnection,
    createUSBConnection,
    DeviceSelectionMode,
} from "@microbit/microbit-connection/usb";
import { createUniversalHexFlashDataSource } from "@microbit/microbit-connection/universal-hex";
import { BaseConnector } from "./base-connector";
import type { MicrobitSerialEvent, WebsiteSerialCommand } from "../types/serial-protocol";
import type { InputBehaviourKind, InputButton } from "../types/microbit-connector";

const DEFAULT_DEMO_HEX_PATH = "/usb-serial-demo.hex";

function buttonLabel(button: InputButton, event: InputBehaviourKind): string {
    if (event === "down") return "Pressed";
    if (event === "up") return "Released";
    if (event === "click") return "Click";
    if (event === "longClick") return "Long click";
    if (event === "doubleClick") return "Double click";
    if (event === "hold") return "Hold";
    if (event === "notPressed") return "Not pressed";
    if (event === "shortPress") return "Short press";
    if (event === "longPress") return "Long press";
    return `${button} ${event}`;
}

function gestureLabel(event: InputBehaviourKind): string {
    switch (event) {
        case "tiltUp":
            return "Tilt up";
        case "tiltDown":
            return "Tilt down";
        case "tiltLeft":
            return "Tilt left";
        case "tiltRight":
            return "Tilt right";
        case "faceUp":
            return "Face up";
        case "faceDown":
            return "Face down";
        case "freefall":
            return "Freefall";
        case "shake":
            return "Shake";
        case "acceleration2g":
            return "2g acceleration";
        case "acceleration3g":
            return "3g acceleration";
        case "acceleration6g":
            return "6g acceleration";
        case "acceleration8g":
            return "8g acceleration";
        default:
            return event;
    }
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function numberFrom(value: unknown): number | null {
    return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export class UsbSerialConnector extends BaseConnector {
    private conn: MicrobitUSBConnection = createUSBConnection({
        deviceSelectionMode: DeviceSelectionMode.UseAnyAllowed,
    });
    private connected = false;
    private lineBuffer = "";
    private connWaiters: (() => void)[] = [];
    private initialized = false;
    private initializing: Promise<void> | null = null;

    constructor() {
        super();

        this.conn.addEventListener("status", this.statusListener.bind(this));
        this.conn.addEventListener("serialdata", ({ data }) => this.handleSerialData(data));
        this.conn.addEventListener("serialreset", () => {
            this.lineBuffer = "";
        });
        this.conn.addEventListener("backgrounderror", ({ error }) => {
            this.log(`USB background error (${error.code}): ${error.message}`);
        });
        this.initializing = this.conn.initialize();
    }

    private async ensureInitialized(): Promise<void> {
        if (this.initialized) return;
        if (this.initializing === null) {
            this.initializing = this.conn.initialize();
        }

        try {
            await this.initializing;
            this.initialized = true;
        } finally {
            if (!this.initialized) {
                this.initializing = null;
            }
        }
    }

    private async ensureAvailableForConnection(): Promise<void> {
        if (typeof window !== "undefined" && !window.isSecureContext) {
            throw new Error("WebUSB requires HTTPS or localhost.");
        }

        const availability = await this.conn.checkAvailability();
        if (availability === "unsupported") {
            throw new Error("WebUSB is not supported in this browser.");
        }
        if (availability === "disabled") {
            throw new Error("WebUSB is currently disabled in this browser context.");
        }
        if (availability === "permission-denied") {
            throw new Error("WebUSB permission was denied for this site.");
        }
        if (availability === "location-disabled") {
            throw new Error("Location services are disabled.");
        }
    }

    public getLEDPollPeriod(): number | null { return null; }
    public getAccelerometerPollPeriod(): number | null { return null; }
    public getMagnetometerPollPeriod(): number | null { return null; }
    public getTemperaturePollPeriod(): number | null { return null; }

    public async handleConnect(): Promise<void> {
        await this.ensureInitialized();
        await this.ensureAvailableForConnection();
        await this.conn.connect();
        await this.waitForConnect();
    }

    public async flashDemoProgram(): Promise<void> {
        await this.flashHexFromUrl(DEFAULT_DEMO_HEX_PATH);
    }

    public async flashHexFromUrl(path: string): Promise<void> {
        await this.ensureInitialized();
        if (!this.connected) {
            await this.handleConnect();
        }

        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Unable to fetch hex from ${path}`);
        }

        const universalHexString = await response.text();
        await this.conn.flash(createUniversalHexFlashDataSource(universalHexString), {
            partial: true,
        });
    }

    public async sendCommand(command: WebsiteSerialCommand): Promise<void> {
        if (!this.connected) {
            await this.handleConnect();
        }

        await this.conn.serialWrite(`${JSON.stringify(command)}\n`);
    }

    private waitForConnect(): Promise<void> {
        return new Promise<void>(resolve => {
            if (this.connected) {
                resolve();
                return;
            }
            this.connWaiters.push(resolve);
        });
    }

    private statusListener(data: ConnectionStatusChange): void {
        switch (data.status) {
            case ConnectionStatus.NoAuthorizedDevice:
                this.connected = false;
                this.onNoAuthorizedDevice?.();
                break;
            case ConnectionStatus.Disconnected:
                this.connected = false;
                this.onDisconnect?.();
                break;
            case ConnectionStatus.Connected:
                this.connected = true;
                for (;;) {
                    const waiter = this.connWaiters.pop();
                    if (waiter == null) break;
                    waiter();
                }
                this.onConnect?.();
                break;
            case ConnectionStatus.Connecting:
                this.connected = false;
                this.onConnecting?.();
                break;
            case ConnectionStatus.Paused:
                this.connected = false;
                this.onPause?.();
                break;
        }
    }

    private handleSerialData(data: string): void {
        this.lineBuffer += data;

        for (;;) {
            const newlineMatch = /\r?\n/.exec(this.lineBuffer);
            if (newlineMatch == null) return;

            const line = this.lineBuffer.slice(0, newlineMatch.index).trim();
            this.lineBuffer = this.lineBuffer.slice(newlineMatch.index + newlineMatch[0].length);

            if (line.length > 0) {
                this.handleSerialLine(line);
            }
        }
    }

    private handleSerialLine(line: string): void {
        let parsed: unknown;
        try {
            parsed = JSON.parse(line);
        } catch {
            this.log(`Ignoring non-JSON serial line: ${line}`);
            return;
        }

        if (!isObject(parsed) || typeof parsed.type !== "string") {
            this.log(`Ignoring unsupported serial payload: ${line}`);
            return;
        }

        this.routeEvent(parsed as MicrobitSerialEvent);
    }

    private routeEvent(event: MicrobitSerialEvent): void {
        switch (event.type) {
            case "button":
                this.routeButtonEvent(event.button, event.event, event.label);
                break;
            case "gesture":
                this.routeGestureEvent(event.event, event.label);
                break;
            case "accelerometer":
                this.routeVectorEvent(event, this.accelerometerUpdate);
                break;
            case "magnetometer":
                this.routeVectorEvent(event, this.magnetometerUpdate);
                break;
            case "temperature":
                if (typeof event.celsius === "number") {
                    this.temperatureUpdate?.(event.celsius);
                }
                break;
            case "microphone":
                this.routeMicrophoneEvent(event.event);
                break;
            case "led":
                this.routeLedEvent(event.matrix);
                break;
            default:
                this.log(`Unknown serial event type: ${(event as { type: string }).type}`);
        }
    }

    private routeButtonEvent(button: InputButton, event: InputBehaviourKind, label?: string): void {
        if (button === "A" && event === "down") this.buttonADown?.();
        if (button === "A" && event === "up") this.buttonAUp?.();
        if (button === "B" && event === "down") this.buttonBDown?.();
        if (button === "B" && event === "up") this.buttonBUp?.();
        if (button === "Logo" && event === "down") this.onLogoDown?.();
        if (button === "Logo" && event === "up") this.onLogoUp?.();

        this.inputBehaviourUpdate?.({
            button,
            behaviour: event,
            label: label ?? buttonLabel(button, event),
            source: event === "notPressed" || event === "shortPress" || event === "longPress" ? "state" : "action",
            timestamp: Date.now(),
        });
    }

    private routeGestureEvent(event: InputBehaviourKind, label?: string): void {
        switch (event) {
            case "tiltUp":
                this.onTiltUp?.();
                break;
            case "tiltDown":
                this.onTiltDown?.();
                break;
            case "tiltLeft":
                this.onTiltLeft?.();
                break;
            case "tiltRight":
                this.onTiltRight?.();
                break;
            case "faceUp":
                this.onFaceUp?.();
                break;
            case "faceDown":
                this.onFaceDown?.();
                break;
            case "freefall":
                this.onFreefall?.();
                break;
            case "shake":
                this.onShake?.();
                break;
            case "acceleration2g":
                this.onAcceleration2g?.();
                break;
            case "acceleration3g":
                this.onAcceleration3g?.();
                break;
            case "acceleration6g":
                this.onAcceleration6g?.();
                break;
            case "acceleration8g":
                this.onAcceleration8g?.();
                break;
        }

        this.inputBehaviourUpdate?.({
            button: "Gesture",
            behaviour: event,
            label: label ?? gestureLabel(event),
            source: "action",
            timestamp: Date.now(),
        });
    }

    private routeVectorEvent(
        event: { x: unknown; y: unknown; z: unknown },
        callback?: (x: number, y: number, z: number) => void,
    ): void {
        const x = numberFrom(event.x);
        const y = numberFrom(event.y);
        const z = numberFrom(event.z);
        if (x === null || y === null || z === null) return;

        callback?.(x, y, z);
    }

    private routeMicrophoneEvent(event: "loud" | "quiet"): void {
        this.micLedUpdate?.(event === "loud");
        this.inputBehaviourUpdate?.({
            button: "Microphone",
            behaviour: event,
            label: event === "loud" ? "Loud" : "Quiet",
            source: "action",
            timestamp: Date.now(),
        });
    }

    private routeLedEvent(matrix: unknown): void {
        if (!Array.isArray(matrix)) return;

        for (let row = 0; row < 5; row += 1) {
            const rowData = matrix[row];
            if (!Array.isArray(rowData)) continue;

            for (let col = 0; col < 5; col += 1) {
                this.ledMatrixUpdate?.(row, col, Boolean(rowData[col]));
            }
        }
    }
}
