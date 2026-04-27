export const EventSourceID = {
    Microphone: 33
};
export type EventSourceID = (typeof EventSourceID)[keyof typeof EventSourceID];

export const MicrophoneState = {
    On: 1,
    Off: 2,
};
export type MicrophoneState = (typeof MicrophoneState)[keyof typeof MicrophoneState];