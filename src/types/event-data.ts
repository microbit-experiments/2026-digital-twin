export const EventSourceID = {
    Microphone: 33
};
export type EventSourceID = (typeof EventSourceID)[keyof typeof EventSourceID];

export const MicrophoneState = {
    Off: 0,
    On: 1
};
export type MicrophoneState = (typeof MicrophoneState)[keyof typeof MicrophoneState];