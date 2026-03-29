import { BaseConnector } from "./base-connector"
import { type AccelerometerDataEvent, type ButtonEvent, type MicrobitWebBluetoothConnection, createWebBluetoothConnection } from "@microbit/microbit-connection";

export class BlueToothConnector extends BaseConnector {
    private conn: MicrobitWebBluetoothConnection = createWebBluetoothConnection()

    constructor() {
        super();
        this.buttonAListener = this.buttonAListener.bind(this);
        this.buttonBListener = this.buttonBListener.bind(this);
        this.accelerometerListener = this.accelerometerListener.bind(this);
        this.magnetometerListener = this.magnetometerListener.bind(this);
    }

    public async handleConnect(): Promise<void> {
        await this.conn.connect();
        this.conn.addEventListener("buttonachanged", this.buttonAListener);
        this.conn.addEventListener("buttonbchanged", this.buttonBListener);
        this.conn.addEventListener("accelerometerdatachanged", this.accelerometerListener);
        this.conn.addEventListener("magnetometerdatachanged", this.magnetometerListener);
    }

    private buttonAListener(event: ButtonEvent): void {
        switch (event.state) {
            case 0:  // NotPressed
                if (this.buttonAUp) {
                    this.log("Invoking buttonAUp")
                    this.buttonAUp();
                }
                break;
            case 1:  // ShortPress
                if (this.buttonADown) {
                    this.log("Invoking buttonADown")
                    this.buttonADown();
                }
                break;
            // LongPress (2) not included since there is no handler for it
        }
    }

    private buttonBListener(event: ButtonEvent): void {
        switch (event.state) {
            case 0:  // NotPressed
                if (this.buttonBUp) {
                    this.log("Invoking buttonBUp")
                    this.buttonBUp();
                }
                break;
            case 1:  // ShortPress
                if (this.buttonBDown) {
                    this.log("Invoking buttonBDown")
                    this.buttonBDown();
                }
                break;
            // LongPress (2) not included since there is no handler for it
        }
    }

    private accelerometerListener(event: AccelerometerDataEvent): void {
        if (this.accelerometerUpdate) {
            const {x, y, z} = event.data;
            this.log(`Invoking accelerometerUpdate ${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}`);
            this.accelerometerUpdate(x, y, z);
        }
    }

    private magnetometerListener(event: AccelerometerDataEvent): void {
        if (this.magnetometerUpdate) {
            const {x, y, z} = event.data;
            this.log(`Invoking magnetometerUpdate ${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}`);
            this.magnetometerUpdate(x, y, z);
        }
    }
}