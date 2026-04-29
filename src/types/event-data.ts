export const EventSourceID = {
    Microphone: 33
};
export type EventSourceID = (typeof EventSourceID)[keyof typeof EventSourceID];

export const MicrophoneSoundEvent = {
    Loud: 1,
    Quiet: 2,
};
export type MicrophoneSoundEvent = (typeof MicrophoneSoundEvent)[keyof typeof MicrophoneSoundEvent];
