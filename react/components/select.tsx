import React from "react";

export default function Select({name, options}: {name: string, options: string[]}) {
    return (<div>
        <p> { name.charAt(0).toUpperCase() + name.slice(1) } </p>
        <select name={ name } id={ name }>
            { options.map((dev, index) => <option key={index} value={dev}> {dev} </option>) }
        </select>
    </div>);
}
