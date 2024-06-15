import React, {useState, useEffect, Dispatch, SetStateAction} from "react";
import {CloseWindowButton} from "../../components/title-bar";
import { hideCameraSettings
       , showCameraSettings
       , toggleLock
       , changeCamera} from "../scripts";

/*******************************************************************************
 *                              Camera Settings                                *
 ******************************************************************************/

/**
 * Settings overlay on the camera.
 * @param setCamera - setter used for switching camera devices
 */
export function CameraSettings({setCamera}: {setCamera: Dispatch<SetStateAction<string>>}) {
    const [isLocked, setLock] = useState<boolean>(true);

    // Apply cameraSettings hiding to both CameraList and switches on the bottom.
    return (<div className="webcam-settings" id="webcam-settings">
        <CameraList isLocked={isLocked} setCamera={setCamera} />
        <CameraToggles isLocked={isLocked} setLock={setLock} />
    </div>);
}

/**
 * Camera toggles on the bottom. (subcomponent)
 * @param isLocked - whether camera is draggable
 * @param setLock - toggle drag
 */
function CameraToggles({isLocked, setLock}: {isLocked: boolean, setLock: Dispatch<SetStateAction<boolean>>}) {
    return (<div className="bottom"
                 onMouseEnter={showCameraSettings}
                 onMouseLeave={isLocked ? hideCameraSettings : undefined}>
        <CloseWindowButton/>
        <button onClick={toggleLock(isLocked, setLock)}> {(isLocked ? "🔒" : "🔓")} </button>
    </div>);
}

/**
 * List of cameras on the top. (subcomponent)
 * @param isLocked - whether camera is draggable
 * @param setCamera - switch cameras
 * @constructor
 */
function CameraList({isLocked, setCamera}: {isLocked: boolean, setCamera: Dispatch<SetStateAction<string>>}) {
    const [devices, setDevices]
        = useState<MediaDeviceInfo[]>([]);
    useEffect(() => {
            navigator.mediaDevices.enumerateDevices().then((mediaDevices: MediaDeviceInfo[]) =>
                setDevices(mediaDevices.filter(({kind}) => kind === "videoinput")))
        }, []
    );

    return (<div className="top"
                 onMouseEnter={showCameraSettings}
                 onMouseLeave={isLocked ? hideCameraSettings : undefined}>
        <select onChange={changeCamera(setCamera)}>
            { devices.map((dev, index) =>
                <option key={index} value={dev.deviceId}> {dev.label} </option>) }
        </select>
    </div>);
}
