import * as React from 'react';
import { TwitchChat } from '../../stores/tc_store';
import { ThemeStore } from '../../stores/theme_store';

import './enter_user.scss';

type Props = {
    theme: ThemeStore;
    tc: TwitchChat;
};

export const EnterUser = (p: Props) => {
    const [username, setUser] = React.useState<string>('');
    console.log(username);
    React.useEffect(() => {
        return setUser('');
    }, []);
    return (
        <div className="enter-user-container">
            <form onSubmit={() => (p.tc.username = username)}>
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
