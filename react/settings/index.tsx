import React from "react"
import {SettingsList} from "./components/settings-list";
import {SettingsSubmit} from "./components/settings-submit";

export default function Settings() {
    return (<div>
        <a href="#/"> ← </a>
        <div className="settings"> <SettingsList /> </div>
        <center> <SettingsSubmit /> </center>
    </div>);
}
