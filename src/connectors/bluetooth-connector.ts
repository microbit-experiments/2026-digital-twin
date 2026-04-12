import { BaseConnector } from "./base-connector"
import { type MicrobitBluetoothConnection, createBluetoothConnection } from "@microbit/microbit-connection/bluetooth";
import { type AccelerometerData, type ButtonActionData, type MagnetometerData, ButtonAction } from "@microbit/microbit-connection";

export class BlueToothConnector extends BaseConnector {
    private conn: MicrobitBluetoothConnection = createBluetoothConnection()

    constructor() {
        super();
        
        this.conn.addEventListener("buttonaaction", this.buttonAListener.bind(this))
        this.conn.addEventListener("buttonbaction", this.buttonBListener.bind(this))
        this.conn.addEventListener("logoaction", this.logoListener.bind(this));

        this.conn.addEventListener("accelerometerdatachanged", this.accelerometerListener.bind(this));
        this.conn.addEventListener("magnetometerdatachanged", this.magnetometerListener.bind(this));
        
        this.ledLoop();
    }

    public async handleConnect(): Promise<void> {
        await this.conn.connect();
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
