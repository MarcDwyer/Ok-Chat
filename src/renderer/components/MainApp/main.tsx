import { ipcRenderer } from 'electron';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { TokenStore } from '../../stores/token_store';

import Login from '../Login/login';

type TokenPayload = {
    token?: string;
};

type Props = {
    tokenStore: TokenStore;
};
export const Main = observer(({ tokenStore }: Props) => {
    const { token } = tokenStore;
    ipcRenderer.on('get-auth', (msg: any) => {
        console.log(msg);
    });
    ipcRenderer.on('token', (evt, arg: TokenPayload) => {
        if (arg.token) {
            tokenStore.setToken(arg.token);
        }
    });
    return (
        <div className="container">
            {!token && <Login />}
            {token &&
                (() => {
                    console.log(token);
                    return <span>sweet</span>;
                })()}
        </div>
    );
});
