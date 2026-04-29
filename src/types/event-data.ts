export const EventSourceID = {
    MicrophoneLED: 33
};
export type EventSourceID = (typeof EventSourceID)[keyof typeof EventSourceID];

export const MicrophoneLEDState = {
    On: 1,
    Off: 2,
};
export type MicrophoneLEDState = (typeof MicrophoneLEDState)[keyof typeof MicrophoneLEDState];
