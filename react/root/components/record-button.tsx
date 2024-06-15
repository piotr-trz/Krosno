import React, {useEffect, useState} from "react";
import {handleRecord, handleCancelRecord, handleStopRecord} from "../scripts";

/*******************************************************************************
 *                              Record Button                                  *
 * Root page button that initiates and ends the recording process.             *
 ******************************************************************************/
export function RecordButton() {
    const [isRecording, setRecording] = useState<boolean>(false);
    useEffect(() => {
        window.krosnoAPI.isRecording().then(b => setRecording(b));
    }, []);

    const elements: React.JSX.Element[] = [];
    if (isRecording) {
        elements.push(<button id="stop-button" onClick={handleStopRecord(setRecording)}> Stop </button>)
        elements.push(<button id="cancel-button" onClick={handleCancelRecord(setRecording)}> Cancel </button>);
    } else {
        elements.push(<button id="record-button" onClick={handleRecord(setRecording)}> Start recording </button>);
    }

    return (<div> {elements} </div>);
}
