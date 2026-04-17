import { BaseConnector } from "./base-connector"
import { type MicrobitBluetoothConnection, createBluetoothConnection } from "@microbit/microbit-connection/bluetooth";
import type { AccelerometerData, ButtonActionData, MagnetometerData, GestureData, TemperatureData, ConnectionStatusChange, LedMatrix } from "@microbit/microbit-connection";
import { ButtonAction, GestureEvent, ConnectionStatus } from "@microbit/microbit-connection";

export class BlueToothConnector extends BaseConnector {
    private conn: MicrobitBluetoothConnection = createBluetoothConnection()
    private connected: boolean = false;
    private connWaiters: (() => void)[] = [];

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

        this.ledLoop();
    }

    public async handleConnect(): Promise<void> {
        await this.conn.connect();
    }

    private waitForConnect(): Promise<void> {
        return new Promise<void>(resolve => {
            if (this.connected) { resolve(); }
            else { this.connWaiters.push(resolve) }
        })
    }

    private statusListener(data: ConnectionStatusChange) {
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
                // Resume all loops waiting for a connect
                while (1) {
                    let waiter = this.connWaiters.pop()
                    if (waiter == null) break;
                    waiter()
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

    private buttonAction(action: ButtonAction, upMethod?: () => void, downMethod?: () => void) {
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
        const { x, y, z } = data;
        this.accelerometerUpdate?.(x, y, z);
    }

    private magnetometerListener(data: MagnetometerData): void {
        const { x, y, z } = data;
        this.magnetometerUpdate?.(x, y, z);
    }

    private temperatureListener(data: TemperatureData): void {
        this.temperatureUpdate?.(data.celsius);
    }

    private gestureListener(data: GestureData) {
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
        const pollRate = 1;
        while (1) {
            await this.waitForConnect()
            this.updateLEDs()
            await new Promise(resolve => setTimeout(resolve, pollRate));
        }
    }
}
