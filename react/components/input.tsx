import React from "react";

export default function Input({name, type, value}: {name: string, type: string, value: string}) {
    return (<div>
        <p> <label form={name}> { name.charAt(0).toUpperCase() + name.slice(1) + ':' } </label> </p>
        <input type={type} name={name} id={name} defaultValue={value} />
    </div>);
}
