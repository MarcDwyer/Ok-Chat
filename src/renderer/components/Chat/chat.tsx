import { observer } from 'mobx-react-lite';
import React from 'react';
import { TwitchStore } from '../../stores/tc_store';
import { ChatBox } from '../ChatBox/chatbox';

import './chat.scss';

type Props = {
    tc: TwitchStore;
};
export const Chat = observer(({ tc }: Props) => {
    const { selected } = tc;

    const channel = selected ? tc.channelHub.get(selected) : null;
    return (
        <>
            {!selected && <div>Try joining a channel...</div>}
            {selected &&
                channel &&
                (() => {
                    const isError = Boolean(channel.error);
                    return (
                        <div className="selected">
                            <div className="chat">
                                {isError && <span className="chan error">{channel.error}</span>}
                                {channel.messages.map((msg, i) => {
                                    return (
                                        <div
                                            className={`message ${
                                                msg.directMsg ? 'directmsg' : ''
                                            }`}
                                            key={i}
                                        >
                                            <span
                                                style={{ color: msg.userData.color }}
                                                className="author"
                                            >
                                                {msg.userData.username}
                                            </span>
                                            <span className="actual-msg">{msg.message}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <ChatBox channel={channel} />
                        </div>
                    );
                })()}
        </>
    );
});
