import React, {useEffect, useState} from "react";
import {UserData} from "../../main/store";
import {AppLinked, SignedIn, NotSignedIn, OfflineMode} from "./components";

/*******************************************************************************
 *                           Camera Settings Scripts                           *
 ******************************************************************************/

/**
 * Login page available directly from root.
 */
export default function Login() {
    const [data, setData] = useState<UserData>();
    const [appLinked, setAppLink] = useState<boolean>();
    useEffect(() => {
        window.krosnoAPI.getUserData().then(data => setData(data));
        window.krosnoAPI.appLinkHasPresignedUrl().then(b => setAppLink(b))
    }, []);

    const elements: React.JSX.Element[] = [];
    if (data !== undefined)
        elements.push(<SignedIn data={data} setData={setData}/>);
    else
        elements.push(<NotSignedIn setData={setData}/>);

    // appLinked need not be a state, everytime an appLink is loaded, the app is refreshed.
    if (appLinked)
        elements.push(<AppLinked />)
    else if (data === undefined)
        elements.push(<OfflineMode />)

    return (<div> {elements} </div>);
}
