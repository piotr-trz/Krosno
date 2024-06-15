import React from "react";

/*******************************************************************************
 *                              Camera Button                                  *
 ******************************************************************************/
export function CameraButton() {
    return (<div> <button onClick={ window.krosnoAPI.startCamera }> Pop-up Camera </button> </div>);
}
