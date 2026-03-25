import { BaseConnector } from "./base-connector"
import { type ButtonEvent, type MicrobitWebBluetoothConnection } from "@microbit/microbit-connection";

export class BlueToothConnector extends BaseConnector {
    private conn: MicrobitWebBluetoothConnection

    constructor(conn: MicrobitWebBluetoothConnection) {
        super();
        this.conn = conn;
        this.buttonAListener = this.buttonAListener.bind(this);
        this.buttonBListener = this.buttonBListener.bind(this);
    }

    public async handleConnect(): Promise<void> {
        await this.conn.connect();
        this.conn.addEventListener("buttonachanged", this.buttonAListener);
        this.conn.addEventListener("buttonbchanged", this.buttonBListener);
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
}