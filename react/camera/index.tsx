import React, {useState} from "react";
import Webcam from "react-webcam"
import {CameraSettings} from "./components/camera-settings"
import {hideCameraSettings, showCameraSettings} from "./scripts";

/**
 * Camera page available directly from root.
 */
export default function Camera() {
    document.body.style.margin = "0";
    document.body.style.background = "initial";     // transparent
    document.body.style.overflowX = "hidden";       // no scrollbars
    document.body.style.overflowY = "hidden";
    // @ts-ignore: Special property not in the CSSStyleDeclaration interface
    document.body.style.webkitAppRegion = "no-drag";

    const [camera, setCamera] = useState<string>("");
    return (<center>
        <Webcam
            className="webcam"
            onMouseEnter={showCameraSettings}
            onMouseLeave={hideCameraSettings}
            videoConstraints={{deviceId: camera}}
        />
        <CameraSettings setCamera={setCamera}/>
    </center>);
}
