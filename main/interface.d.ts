import {LoginResult} from "./http_client/http_client";
import {Devices} from "ffmpeg/list-devices"
import {UserData} from "./store";

export interface IKrosnoAPI {
    platform: () => string
    startRecording: (video: string, desktop: string, mic: string, resolution: string) => Promise<void>
    stopRecording: () => Promise<void>
    isRecording: () => Promise<boolean>
    cancelRecording: () => Promise<void>
    getDefaultRecPath: () => Promise<string>
    setDefaultRecPath: () => Promise<void>
    getHwEncoder: () => Promise<string>
    setHwEncoder: (hwEncode: string) => Promise<void>
    listDevices: () => Promise<Devices>
    startCamera: () => Promise<void>
    closeApp: () => void
    minimizeWindow: () => void
    closeWindow: () => void
    login: (mail: string, password: string) => Promise<LoginResult>
    logout: () => Promise<void>
    getUserData: () => Promise<UserData | undefined>
    appLinkHasPresignedUrl: () => Promise<boolean>
}

declare global {
    @SuppressWarnings("unused")
    interface Window {
        krosnoAPI: IKrosnoAPI
    };
}
