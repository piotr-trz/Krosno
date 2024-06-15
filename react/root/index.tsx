import React from "react";
import {CameraButton} from "../camera/components/camera-button";
import {LoginRef, MinimizeButton, CloseButton, SettingsRef} from "../components/title-bar";
import {RecordButton} from "./components/record-button";
import {WindowsQuickSettings, LinuxQuickSettings} from "./components/quick-settings"

export default function root() {
    return (<div>
        <div className="title-bar">
            <span className="left"> <SettingsRef /> </span>
            <LoginRef /> <MinimizeButton /> <CloseButton />
        </div>
        <div>
            { window.krosnoAPI.platform() === "win32" ? <WindowsQuickSettings /> : "" }
            { window.krosnoAPI.platform() === "linux" ? <LinuxQuickSettings /> : "" }
        </div>
        <div className="recording-buttons">
            <RecordButton /> <CameraButton />
        </div>
    </div>);
}
