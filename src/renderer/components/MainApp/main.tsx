import { ipcRenderer } from 'electron';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { TwitchStore } from '../../stores/tc_store';
import { ThemeStore } from '../../stores/theme_store';

import Login from '../Login/login';
import { EnterUser } from '../EnterUsername/enter_user';

import './main.scss';
import { UserInfoStore } from '../../stores/user_info_store';

type TokenPayload = {
    token?: string;
};

type Props = {
    themeStore: ThemeStore;
    tc: TwitchStore;
    userInfo: UserInfoStore;
};
export const Main = observer(({ themeStore, tc, userInfo }: Props) => {
    const { themeData } = themeStore;
    const { token, username } = userInfo;
    ipcRenderer.on('get-auth', (msg: any) => {
        console.log(msg);
    });
    ipcRenderer.on('token', (evt, arg: TokenPayload) => {
        if (arg.token) {
            userInfo.setToken(arg.token);
        }
    });
    useEffect(() => {
        if (username && token) {
            tc.initWs({ username, token });
        }
    }, [username, token]);
    return (
        <div
            className="container"
            style={{ backgroundColor: themeData.backgroundColor, color: themeData.color }}
        >
            {!token && <Login />}
            {token && !username && <EnterUser theme={themeStore} userInfo={userInfo} />}
        </div>
    );
});
