import React from "react"
import {handleSubmitSettings} from "../scripts";

/*******************************************************************************
 *                              Settings Submit                                *
 * A button that submits the form.                                             *
 ******************************************************************************/
export function SettingsSubmit() {
    return <div><button id="settings-button" onClick={handleSubmitSettings}> Save settings </button></div>;
}
