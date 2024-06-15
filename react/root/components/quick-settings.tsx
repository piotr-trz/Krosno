import React, {useEffect, useState} from "react";
import Input from "../../components/input"
import Select from "../../components/select"

/*******************************************************************************
 *                                 Quick Settings                              *
 * Recording settings on the root page for the user to set. Settings vary      *
 * between the platforms as some have more choice, than the other. Since Linux *
 * has so much more options with sounds server, it is better if the user       *
 * specifies the input device themself. For other operating systems there is   *
 * only one driver, so there is not much to choose.                            *
 *******************************************************************************/
export function WindowsQuickSettings() {
    const [micDevices, setMicDevices] = useState<string[]>(["Loading..."]);
    const [audioDevices, setAudioDevices] = useState<string[]>(["Loading..."]);
    const [videoDevices, setVideoDevices] = useState<string[]>(["Loading..."]);

    useEffect(() => {
        window.krosnoAPI.listDevices().then((devices) => {
            setMicDevices(devices.microphones);
            setAudioDevices(devices.audio);
            if (devices.video.length != 0)              // Cannot record without this, leave it stuck
                setVideoDevices(devices.video);
        })
    }, []);

    return (<div className="settings">
        <Select name="video" options={videoDevices}/>
        <Select name="resolution" options={["1920:1080", "1280:720", "720:480"]}/>
        <Select name="audio" options={audioDevices}/>
        <Select name="microphone" options={micDevices}/>
    </div>);
}

export function LinuxQuickSettings() {
    const [micDevices, setMicDevices] =             // Use none for input tag so that it does not show "Loading"
        useState<string[]>(["None"]);
    const [audioDevices, setAudioDevices] = useState<string[]>(["None"]);
    const [videoDevices, setVideoDevices] = useState<string[]>(["Loading..."]);

    useEffect(() => {
        window.krosnoAPI.listDevices().then((devices) => {
            setMicDevices(devices.microphones);
            setAudioDevices(devices.audio);
            if (devices.video.length != 0)
                setVideoDevices(devices.video);
        })
    }, []);

    return (<div className="settings">
        <Select name="video" options={videoDevices}/>
        <Select name="resolution" options={["1920:1080", "1280:720", "720:480"]}/>
        <Input name="audio" value={audioDevices[0] !== "None" ? audioDevices[0] : ""} type="text" />
        <Input name="microphone" value={micDevices[0] !== "None" ? micDevices[0] : ""} type="text" />
    </div>);
}
