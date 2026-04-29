import { BaseConnector } from "./base-connector"
import { type MicrobitBluetoothConnection, createBluetoothConnection } from "@microbit/microbit-connection/bluetooth";
import type { AccelerometerData, ButtonActionData, MagnetometerData, GestureData, TemperatureData, ConnectionStatusChange, LedMatrix, MicrobitEventData } from "@microbit/microbit-connection";
import { ButtonAction, GestureEvent, ConnectionStatus } from "@microbit/microbit-connection";
import { EventSourceID, MicrophoneState } from "../types/event-data";

export class BlueToothConnector extends BaseConnector {
    private conn: MicrobitBluetoothConnection = createBluetoothConnection()
    private connected: boolean = false;
    private connWaiters: (() => void)[] = [];

    private LEDPollPeriod: number = 20;
    private accelerometerPollPeriod: number | null = null;
    private magnetometerPollPeriod: number | null = null;
    private temperaturePollPeriod: number | null = null;

    constructor() {
        super();

        this.conn.addEventListener("status", this.statusListener.bind(this));

        this.conn.addEventListener("buttonaaction", this.buttonAListener.bind(this));
        this.conn.addEventListener("buttonbaction", this.buttonBListener.bind(this));
        this.conn.addEventListener("logoaction", this.logoListener.bind(this));

        this.conn.addEventListener("accelerometerdatachanged", this.accelerometerListener.bind(this));
        this.conn.addEventListener("magnetometerdatachanged", this.magnetometerListener.bind(this));
        this.conn.addEventListener("temperaturechanged", this.temperatureListener.bind(this));

        this.conn.addEventListener("gesturechanged", this.gestureListener.bind(this));
        this.conn.addEventListener("microbitevent", this.eventListener.bind(this))

        this.ledLoop();
    }

    public getLEDPollPeriod(): number { return this.LEDPollPeriod }
    public getAccelerometerPollPeriod(): number | null { return this.accelerometerPollPeriod }
    public getMagnetometerPollPeriod(): number | null { return this.magnetometerPollPeriod }
    public getTemperaturePollPeriod(): number | null { return this.temperaturePollPeriod }

    public async handleConnect(): Promise<void> {
        await this.conn.connect();
        await this.waitForConnect();
    }

    public async startUp(): Promise<void> {
        this.log("Starting Connector")

        // Get periods for pollers
        this.accelerometerPollPeriod = await this.conn.getAccelerometerPeriod()
        this.magnetometerPollPeriod = await this.conn.getMagnetometerPeriod()
        this.temperaturePollPeriod = await this.conn.getTemperaturePeriod()

        this.log([
            `Poll Periods (ms):`,
            `\tLED: ${this.LEDPollPeriod}`,
            `\tAccelerometer: ${this.accelerometerPollPeriod}`,
            `\tMagnetometer: ${this.magnetometerPollPeriod}`,
            `\tTemperature: ${this.temperaturePollPeriod}`
        ].join("\n"))

        // Subscribe to events
        await this.conn.subscribeToEvent(EventSourceID.Microphone, MicrophoneState.On)
        await this.conn.subscribeToEvent(EventSourceID.Microphone, MicrophoneState.Off)

        // Resume all loops waiting for a connect
        this.connected = true;
        while (1) {
            let waiter = this.connWaiters.pop()
            if (waiter == null) break;
            waiter()
        }

        this.log("Startup Complete")
    }

    private waitForConnect(): Promise<void> {
        return new Promise<void>(resolve => {
            if (this.connected) { resolve(); }
            else { this.connWaiters.push(resolve) }
        })
    }

    private async statusListener(data: ConnectionStatusChange) {
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
                await this.startUp();
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

    private buttonAction(action: ButtonAction, upMethod?: () => void, downMethod?: () => void) {
        if (!this.connected) { return; }
        switch (action) {
            case ButtonAction.Up:
                upMethod?.();
                break;
            case ButtonAction.Down:
                downMethod?.();
                break;
        }
    }

    private buttonAListener(data: ButtonActionData): void {
        this.buttonAction(data.action, this.buttonAUp, this.buttonADown);
    }

    private buttonBListener(data: ButtonActionData): void {
        this.buttonAction(data.action, this.buttonBUp, this.buttonBDown);
    }

    private logoListener(data: ButtonActionData): void {
        this.buttonAction(data.action, this.onLogoUp, this.onLogoDown);
    }

    private accelerometerListener(data: AccelerometerData): void {
        if (!this.connected) { return; }
        const { x, y, z } = data;
        this.accelerometerUpdate?.(x, y, z);
    }

    private magnetometerListener(data: MagnetometerData): void {
        if (!this.connected) { return; }
        const { x, y, z } = data;
        this.magnetometerUpdate?.(x, y, z);
    }

    private temperatureListener(data: TemperatureData): void {
        if (!this.connected) { return; }
        this.temperatureUpdate?.(data.celsius);
    }

    private gestureListener(data: GestureData) {
        if (!this.connected) { return; }
        switch (data.gesture) {
            case GestureEvent.TiltUp:
                this.onTiltUp?.();
                break;
            case GestureEvent.TiltDown:
                this.onTiltDown?.();
                break;
            case GestureEvent.TiltLeft:
                this.onTiltLeft?.();
                break;
            case GestureEvent.TiltRight:
                this.onTiltRight?.();
                break;
            case GestureEvent.FaceUp:
                this.onFaceUp?.();
                break;
            case GestureEvent.FaceDown:
                this.onFaceDown?.();
                break;
            case GestureEvent.Freefall:
                this.onFreefall?.();
                break;
            case GestureEvent.Acceleration3g:
                this.onAcceleration3g?.();
                break;
            case GestureEvent.Acceleration6g:
                this.onAcceleration6g?.();
                break;
            case GestureEvent.Acceleration8g:
                this.onAcceleration8g?.();
                break;
            case GestureEvent.Shake:
                this.onShake?.();
                break;
            case GestureEvent.Acceleration2g:
                this.onAcceleration2g?.();
                break;
        }
    }

    private microphoneEvent(data: MicrophoneState) {
        switch (data) {
            case MicrophoneState.Off:
                this.micLedUpdate?.(false);
                break;
            case MicrophoneState.On:
                this.micLedUpdate?.(true);
                break;
        }
    }

    private eventListener(data: MicrobitEventData) {
        if (!this.connected) { return; }
        switch (data.source) {
            case EventSourceID.Microphone:
                this.microphoneEvent(data.value as MicrophoneState);
                break;
            default:
                this.log(`Unrecognised Source: ${data.source}`)
        }
    }

    private async updateLEDs() {
        let matrix: LedMatrix;
        try { matrix = await this.conn.getLedMatrix() } catch (e) {
            this.log(e);
            return;
        }
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                this.ledMatrixUpdate?.(i, j, matrix[i][j])
            }
        }
    }

    private async ledLoop() {
        while (1) {
            await this.waitForConnect()
            this.updateLEDs()
            await new Promise(resolve => setTimeout(resolve, this.LEDPollPeriod));
        }
    }
}
