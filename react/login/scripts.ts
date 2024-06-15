import {Dispatch, SetStateAction} from "react";
import {UserData} from "../../main/store";

/*******************************************************************************
 *                                Login Scripts                                *
 ******************************************************************************/
export function handleChangePath(setPath: Dispatch<SetStateAction<string>>) {
    return async () => {
        const button = document.getElementById("pathButton") as HTMLButtonElement;
        button.disabled = true;
        await window.krosnoAPI.setDefaultRecPath();
        setPath(await window.krosnoAPI.getDefaultRecPath());
        button.disabled = false;
    }
}

export function handleLogin(setData: Dispatch<SetStateAction<UserData | undefined>>) {
    return async () => {
        const button = document.getElementById("loginButton") as HTMLButtonElement;
        const mail = (document.getElementById("mail") as HTMLInputElement).value;
        const password = (document.getElementById("password") as HTMLInputElement).value;
        button.disabled = true;
        await window.krosnoAPI.login(mail, password);
        setData(await window.krosnoAPI.getUserData());
        button.disabled = false;
    }
}


export function handleLogout(setData: Dispatch<SetStateAction<UserData | undefined>>) {
    return async () => {
        await window.krosnoAPI.logout();
        setData(await window.krosnoAPI.getUserData());
    }
}
