import React, {Dispatch, SetStateAction} from "react";

/*******************************************************************************
 *                           Camera Settings Scripts                           *
 ******************************************************************************/
export function hideCameraSettings() {
    document.getElementById("webcam-settings")!.style.display = "none";
}

export function showCameraSettings() {
    document.getElementById("webcam-settings")!.style.display = "block";
}

export function toggleLock(isLocked: boolean, setLock: Dispatch<SetStateAction<boolean>>) {
    return async () => {
        if (!isLocked) {
            setLock(true);
            // @ts-ignore: Special property not in the CSSStyleDeclaration interface
            document.body.style.webkitAppRegion = "no-drag";
            hideCameraSettings();
        } else {
            setLock(false);
            // @ts-ignore
            document.body.style.webkitAppRegion = "drag";
            showCameraSettings();
        }
    }
}

export function changeCamera(setCamera: Dispatch<SetStateAction<string>>) {
    return async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const camera = event.target.value;
        setCamera(camera);
    }
}
