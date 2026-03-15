import { type LedMatrix, type MicrobitWebBluetoothConnection } from "@microbit/microbit-connection";


export class LEDPoller {
    private conn: MicrobitWebBluetoothConnection;
    private currentMatrix: LedMatrix | null = null;
    private listeners: ((mat: LedMatrix) => any)[] = [];
    private pollRate: number;
    private closed: boolean = false;

    constructor(conn: MicrobitWebBluetoothConnection, pollRate: number) {
        this.conn = conn
        this.pollRate = pollRate;
    }

    private async loop() {
        while (!this.closed) {
            // Poll at given rate
            await new Promise(resolve => setTimeout(resolve, this.pollRate));
            let matrix = await this.conn.getLedMatrix()
            if (matrix == null) {
                continue;
            }

            // Check for changes in the matrix
            let change;
            if (this.currentMatrix) {
                change = false;
                for (let i = 0; i < 5 && !change; i++) {
                    for (let j = 0; j < 5 && !change; j++) {
                        change = matrix[i][j] != this.currentMatrix[i][j];
                    }
                }
            } else {
                change = true;
            }

            if (change) {
                this.currentMatrix = matrix;
                this.listeners.map(i => i(matrix));
            }
        }
    }

    start() {
        this.loop();
    }
    stop() {
        this.closed = true;
    }
    addListener(listener: (mat: LedMatrix) => any) {
        /**
         * Calls listener when the LED matrix is changed.
         */
        this.listeners.push(listener);
    }
}