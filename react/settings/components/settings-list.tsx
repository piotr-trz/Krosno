import React, {useEffect} from "react"
import Select from "../../components/select";
import {ENCODERS} from "../../scripts/constants";

/*******************************************************************************
 *                              Settings List                                  *
 * List of FFmpeg settings that are hardcoded.                                 *
 ******************************************************************************/
export function SettingsList() {
    useEffect(() => {                                                   // Runs after render asynchronously
        window.krosnoAPI.getHwEncoder().then((hwEncode) => {
            (document.getElementById("encoder") as HTMLInputElement).value = hwEncode;
        });
    }, []);
    return (<div> <Select name="encoder" options={ENCODERS}/> </div>);
}
