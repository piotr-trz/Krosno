import React from 'react';
import ReactDOM from 'react-dom/client';
import {HashRouter, Routes, Route} from 'react-router-dom'
import Root from './root'
import Settings from "./settings";
import Camera from './camera'
import Login from './login'
import './assets/index.css';
import './assets/containers.css'

function App() {
    return (<HashRouter> <Routes>
        <Route path="/" Component={Root} />
        <Route path="/camera" Component={Camera} />
        <Route path="/login" Component={Login} />
        <Route path="/settings" Component={Settings} />
    </Routes> </HashRouter>);
}

const container = document.getElementById('root')!;
const root = ReactDOM.createRoot(container);
root.render(App());
