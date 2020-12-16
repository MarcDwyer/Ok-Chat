import * as React from 'react';
import { ipcRenderer } from 'electron';

export default function Login() {
    return (
        <div className="login-container">
            <button onClick={() => ipcRenderer.send('get-auth')}>Authorize</button>
        </div>
    );
}
