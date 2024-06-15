import React, {useState, Dispatch, SetStateAction, useEffect} from "react";
import {handleLogout, handleLogin, handleChangePath} from "./scripts";
import {UserData} from "../../main/store";
import Input from "../components/input";

/*******************************************************************************
 *                               Login components                              *
 ******************************************************************************/
const descriptionFontSize = { margin: "5px", fontSize: "12px" };

/**
 * Page rendered when user is signed in.
 * @param data - user data
 * @param setData - set data to UserData or undefined
 */
export function SignedIn(
    {data, setData}: {data: UserData, setData: Dispatch<SetStateAction<UserData | undefined>>}) {
    return (<div className="user-data">
        <a href="#/"> ← </a>
        <p> Logged in as: <b> {String(data.name)} </b> </p>
        <p> <button onClick={handleLogout(setData)}> Log out </button> </p>
    </div>);
}

/**
 * Page rendered when user is not signed in.
 * @param setData - set data to UserData or undefined
 */
export function NotSignedIn({setData}: {setData: Dispatch<SetStateAction<UserData | undefined>>}) {
    return (<div>
        <a href="#/"> ← </a>
        <div className="inputs">
            <Input name="mail" type="text" value=""/>
            <Input name="password" type="password" value=""/>
        </div>
        <p> <button id="loginButton" onClick={handleLogin(setData)}> Log in</button> </p>
    </div>);
}

/**
 * Component rendered when appLink is ready.
 */
export function AppLinked() {
    return (<center style={descriptionFontSize}>
        Next recording will be sent to the server through the app link. </center>
    );
}

/**
 * Component rendered when app is running in offline mode.
 */
export function OfflineMode() {
    const [path, setPath] = useState<string>("undefined")
    useEffect(() => {
        window.krosnoAPI.getDefaultRecPath().then(path => setPath(path));
    }, []);
    return (<div>
        <p style={descriptionFontSize}> The recording will be saved to: {path} </p>
        <p> <button id="pathButton" onClick={handleChangePath(setPath)}> Modify</button> </p>
    </div>);
}
