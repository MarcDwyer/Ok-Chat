import { ipcRenderer } from 'electron';
import * as React from 'react';
import { IconType } from 'react-icons';

import './login_btn.scss';

type Props = {
    backgroundColor: string;
    Icon: IconType;
};
export default function LoginBtn(p: Props) {
    return (
        <div
            className="login-btn"
            onClick={() => ipcRenderer.send('get-auth')}
            style={{ backgroundColor: p.backgroundColor }}
        >
            <span>Continue with</span>
            <div className="icon">
                <p.Icon />
            </div>
        </div>
    );
}
