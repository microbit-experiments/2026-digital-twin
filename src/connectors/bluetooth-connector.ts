import { BaseConnector } from "./base-connector"
import { type MicrobitBluetoothConnection, createBluetoothConnection } from "@microbit/microbit-connection/bluetooth";
import { type AccelerometerData, type ButtonData, type MagnetometerData } from "@microbit/microbit-connection";

export class BlueToothConnector extends BaseConnector {
    private conn: MicrobitBluetoothConnection = createBluetoothConnection()

    constructor() {
        super();
        this.buttonAListener = this.buttonAListener.bind(this);
        this.buttonBListener = this.buttonBListener.bind(this);
        this.accelerometerListener = this.accelerometerListener.bind(this);
        this.magnetometerListener = this.magnetometerListener.bind(this);
        this.conn.addEventListener("buttonachanged", this.buttonAListener);
        this.conn.addEventListener("buttonbchanged", this.buttonBListener);
        this.conn.addEventListener("accelerometerdatachanged", this.accelerometerListener);
        this.conn.addEventListener("magnetometerdatachanged", this.magnetometerListener);
        this.ledLoop();
    }

    public async handleConnect(): Promise<void> {
        await this.conn.connect();
    }

    private buttonAListener(data: ButtonData): void {
        switch (data.state) {
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

    private buttonBListener(data: ButtonData): void {
        switch (data.state) {
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

    private accelerometerListener(data: AccelerometerData): void {
        if (this.accelerometerUpdate) {
            const { x, y, z } = data;
            this.log(`Invoking accelerometerUpdate ${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}`);
            this.accelerometerUpdate(x, y, z);
        }
    }

    private magnetometerListener(data: MagnetometerData): void {
        if (this.magnetometerUpdate) {
            const { x, y, z } = data;
            this.log(`Invoking magnetometerUpdate ${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}`);
            this.magnetometerUpdate(x, y, z);
        }
    }

    private async ledLoop() {
        const pollRate = 1;
        const currentMatrix: boolean[][] = [];
        for (var i = 0; i < 5; i++) {
            currentMatrix.push(new Array(5));
        }

        while (1) {
            // Poll at given rate
            await new Promise(resolve => setTimeout(resolve, pollRate));

            // Get LED Matrix data
            let matrix;
            try {
                matrix = await this.conn.getLedMatrix()
            } catch (e) {
                this.log(e);
                continue;
            }

            // Check for changes in the matrix
            for (let i = 0; i < 5; i++) {
                for (let j = 0; j < 5; j++) {
                    if (matrix[i][j] != currentMatrix[i][j]) {
                        // Call for each change in the matrix
                        try { this.ledMatrixUpdate?.(i, j, matrix[i][j]); }
                        catch (e) { 
                            console.log(e)
                            continue
                        }  // If there is an error, continue the loop
                        currentMatrix[i][j] = matrix[i][j];
                    }
                }
            }
        }
    }
}
