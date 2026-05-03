export type InfoPanelMode = "default" | "buttonA" | "buttonB" | "logo" | "microphone" | "shake";

export type InfoPanelData = {
    title: string;
    description: string;
    docsUrl?: string;
    embedUrl?: string;
};
