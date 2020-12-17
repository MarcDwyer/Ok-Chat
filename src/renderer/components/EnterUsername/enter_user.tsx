import React, { useEffect } from 'react';
import { ThemeStore } from '../../stores/theme_store';
import { UserInfoStore } from '../../stores/user_info_store';

import './enter_user.scss';

type Props = {
    theme: ThemeStore;
    userInfo: UserInfoStore;
};

export const EnterUser = (p: Props) => {
    const [username, setUser] = React.useState<string>('');
    console.log(username);
    useEffect(() => {
        return setUser('');
    }, []);
    return (
        <div className="enter-user-container">
            <form onSubmit={() => p.userInfo.setUsername(username)}>
                <span>Enter your username</span>
                <input
                    className="enter-input"
                    value={username}
                    placeholder="username"
                    onChange={e => {
                        console.log(e.target.value);
                        setUser(e.target.value);
                    }}
                />
            </form>
        </div>
    );
};
