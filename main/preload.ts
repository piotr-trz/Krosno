import {contextBridge, ipcRenderer} from 'electron'

contextBridge.exposeInMainWorld('krosnoAPI', {
    platform: () => process.platform,
    startRecording: (
        video: string,
        desktop: boolean,
        mic: string,
        resolution: string,
    ) => ipcRenderer.invoke("ipc_handlers:startRecordingHandler", video, desktop, mic, resolution),
    stopRecording: () => ipcRenderer.invoke("ipc_handlers:stopRecordingHandler"),
    cancelRecording: () => ipcRenderer.invoke("ipc_handlers:cancelRecordingHandler"),
    getDefaultRecPath: () => ipcRenderer.invoke("ffmpeg:getDefaultRecPath"),
    setDefaultRecPath: () => ipcRenderer.invoke("ffmpeg:setDefaultRecPath"),
    getHwEncoder: () => ipcRenderer.invoke("ffmpeg:getHwEncoder"),
    setHwEncoder: (hwEncode: string) => ipcRenderer.invoke("ffmpeg:setHwEncoder", hwEncode),
    isRecording: () => ipcRenderer.invoke("ffmpeg:isRecording"),
    listDevices: () => ipcRenderer.invoke("ffmpeg:listDevices"),
    startCamera: () => ipcRenderer.send("electron:startCamera"),
    closeApp: () => ipcRenderer.send("electron:closeApp"),
    minimizeWindow: () => ipcRenderer.send("electron:minimizeWindow"),
    closeWindow: () => ipcRenderer.send("electron:closeWindow"),
    login: (mail: string, password: string)  => ipcRenderer.invoke("ipc_handlers:loginUserHandler", mail, password),
    logout: ()  => ipcRenderer.invoke("ipc_handlers:logoutUserHandler"),
    getUserData: () => ipcRenderer.invoke("utilities:getUserData"),
    appLinkHasPresignedUrl: () => ipcRenderer.invoke("app_link:appLinkHasPresignedUrl"),
});
