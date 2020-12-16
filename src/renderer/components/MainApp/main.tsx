import { ipcRenderer } from 'electron';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { TwitchChat } from '../../stores/tc_store';
import { ThemeStore } from '../../stores/theme_store';

import Login from '../Login/login';
import { EnterUser } from '../EnterUsername/enter_user';

import './main.scss';

type TokenPayload = {
    token?: string;
};

type Props = {
    themeStore: ThemeStore;
    tc: TwitchChat;
};
export const Main = observer(({ themeStore, tc }: Props) => {
    const { themeData } = themeStore;
    const { token, username } = tc;
    ipcRenderer.on('get-auth', (msg: any) => {
        console.log(msg);
    });
    ipcRenderer.on('token', (evt, arg: TokenPayload) => {
        if (arg.token) {
            tc.setToken(arg.token);
        }
    });
    React.useEffect(() => {
        console.log({ username, token });
        if (username && token) {
            console.log('intializing...');
            tc.initWs();
        }
    }, [username, token]);
    return (
        <div
            className="container"
            style={{ backgroundColor: themeData.backgroundColor, color: themeData.color }}
        >
            {!token && <Login />}
            {token &&
                !username &&
                (() => {
                    console.log(token);
                    return <EnterUser theme={themeStore} tc={tc} />;
                })()}
        </div>
    );
});
