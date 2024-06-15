import {screen} from "electron"
import {ffmpeg} from "./ffmpeg-process";
import { getAudioDevice, getMicDevice } from "./config";

/**
 * Available audio and video devices.
 */
export type Devices = {
    audio: string[]; // Software audio drivers.
    video: string[]; // Screen labels. (such as Screen 0, Screen 1)
    microphones: string[]; // Microphones
}

/**
 * Scan all available recording devices.
 * @returns FFmpeg devices.
 */
export async function listDevices() {
    const audio = new Array<string>();
    const video = new Array<string>();
    const microphones = new Array<string>();

    if (process.platform === "win32") {
        const args = ['-list_devices', 'true', '-f', 'dshow', '-i', 'dummy', '-hide_banner'];
        const lines = await ffmpeg.fetch(args);

        lines.forEach((line: string) => {   // Microphones
            const matchAudio = line.match(/"([^"]+)" \(audio\)/);
            if (matchAudio && matchAudio[1] != "virtual-audio-capturer")
                microphones.push(matchAudio[1]);
        })
        audio.push("virtual-audio-capturer");
    } else if (process.platform === "linux") {
        let audioDevice = await getAudioDevice();
        let micDevice = await getMicDevice();

        if (typeof audioDevice !== "undefined")
            audio.push(audioDevice);
        if (typeof micDevice !== "undefined")
            microphones.push(micDevice);
    }

    audio.push("None");
    microphones.push("None");
    screen.getAllDisplays().forEach((_, i) => {
        video.push("Screen " + i);
    });

    return {audio, video, microphones};
}
