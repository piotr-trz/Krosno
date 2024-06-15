import React from "react"

export function MinimizeButton() {
    return (<button onClick={ window.krosnoAPI.minimizeWindow }> &nbsp;_&nbsp; </button>);
}

export function CloseButton() {
    return (<button onClick={ window.krosnoAPI.closeApp }> &nbsp;X&nbsp; </button>);
}

export function CloseWindowButton() {
    return (<button onClick={window.krosnoAPI.closeWindow}> X</button>);
}

export function LoginRef() {
    return (<a href="#/login"> 👤 </a>);
}

export function SettingsRef() {
    return (<a href="#/settings"> &nbsp;⚙  </a>);
}
