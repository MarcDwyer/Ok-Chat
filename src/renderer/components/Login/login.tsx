import * as React from 'react';
import { FaTwitch } from 'react-icons/fa';

import LoginBtn from '../LoginBtn/login_btn';

import './login.scss';

export default function Login() {
    return (
        <div className="login-container">
            <LoginBtn backgroundColor="#6441a5" Icon={FaTwitch} />
        </div>
    );
}
