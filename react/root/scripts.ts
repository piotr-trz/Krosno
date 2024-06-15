import {Dispatch, SetStateAction} from "react";

/*******************************************************************************
 *                             Recording Handlers                              *
 * Handlers for each recording button on root.                                 *
 ******************************************************************************/
export function handleRecord(setRecording: Dispatch<SetStateAction<boolean>>) {
    return async () => {
        const button = document.getElementById("record-button") as HTMLButtonElement;
        button.disabled = true;

        const video = (document.getElementById("video") as HTMLInputElement).value;
        const desktop = (document.getElementById("audio") as HTMLInputElement).value;
        const mic = (document.getElementById("microphone") as HTMLInputElement).value;
        const resolution = (document.getElementById("resolution") as HTMLInputElement).value;
        await window.krosnoAPI.startRecording(video, desktop, mic, resolution);

        button.disabled = false;
        // Call isRecording again, we don't know for sure if recording started successfully.
        setRecording(await window.krosnoAPI.isRecording());
    };
}

export function handleCancelRecord(setRecording: Dispatch<SetStateAction<boolean>>) {
    return async () => {
        const button1 = document.getElementById("stop-button") as HTMLButtonElement;
        const button2 = document.getElementById("cancel-button") as HTMLButtonElement;
        button1.disabled = true;
        button2.disabled = true;
        await window.krosnoAPI.cancelRecording();
        button1.disabled = false;
        button2.disabled = false;
        setRecording(await window.krosnoAPI.isRecording());
    };
}

export function handleStopRecord(setRecording: Dispatch<SetStateAction<boolean>>) {
    return async () => {
        const button1 = document.getElementById("stop-button") as HTMLButtonElement;
        const button2 = document.getElementById("cancel-button") as HTMLButtonElement;
        button1.disabled = false;
        button2.disabled = false;
        await window.krosnoAPI.stopRecording();
        button1.disabled = false;
        button2.disabled = false;
        setRecording(await window.krosnoAPI.isRecording());
    };
}
