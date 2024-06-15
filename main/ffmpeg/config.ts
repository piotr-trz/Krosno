import {dialog, IpcMainInvokeEvent} from "electron";
import {CONFIG_KEYS, config_store} from "../store";
import {TEMP_PATH} from "./constants";

/**
 * Set default path for recordings that not meant to be sent to the server.
 * @returns Promise that resolves after directory is set.
 */
export async function setDefaultRecPath() {
    const obj = await dialog.showOpenDialog(
        {properties: ['openDirectory']}
    );
    if (!obj.canceled)
        config_store.set(CONFIG_KEYS.RECORDING_PATH, obj.filePaths[0]);
}

/**
 * Get default path for recordings not meant to be sent to the server.
 * @returns Default recording path.
 */
export async function getDefaultRecPath() {
    const path = config_store.get(CONFIG_KEYS.RECORDING_PATH);
    return typeof path === "string" ? path : TEMP_PATH;
}

/**
 * Set FFmpeg hardware recording settings.
 * @param _
 * @param hwEncode - hardware accelerated encoder
 */
export async function setHwEncoder(_: IpcMainInvokeEvent, hwEncode: string) {
    config_store.set(CONFIG_KEYS.HW_ENCODE, hwEncode);
}

/**
 * Get FFmpeg hardware recording settings.
 * @returns Hardware accelerated encoder.
 */
export async function getHwEncoder() {
    return config_store.get(CONFIG_KEYS.HW_ENCODE);
}

/**
 * Set FFmpeg last used audio device (linux).
 * @param _
 * @param audioDevice - audio device
 */
export async function setAudioDevice(audioDevice: string) {
    config_store.set(CONFIG_KEYS.AUDIO_DEVICE, audioDevice);
}

/**
 * Get FFmpeg last used audio device (linux).
 * @param _
 * @returns Audio device.
 */
export async function getAudioDevice() {
    return config_store.get(CONFIG_KEYS.AUDIO_DEVICE);
}

/**
 * Set FFmpeg last used microphone device (linux).
 * @param _
 * @param micDevice - microphone device
 */
export async function setMicDevice(micDevice: string) {
    config_store.set(CONFIG_KEYS.MIC_DEVICE, micDevice);
}

/**
 * Get FFmpeg last used microphone device (linux).
 * @param _
 * @returns Microphone device.
 */
export async function getMicDevice() {
    return config_store.get(CONFIG_KEYS.MIC_DEVICE);
}

/**
 * Get all FFmpeg properties in the config file.
 * @returns Object with all the properties.
 */
export async function getFFmpegConfig() {
    return config_store.getAll();
}
