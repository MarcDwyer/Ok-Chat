import { observer } from 'mobx-react-lite';
import React from 'react';
import { Channel } from '../../stores/channel';
import { ChatBox } from '../ChatBox/chatbox';

import './chat.scss';

type Props = {
    selected: Channel | undefined;
};
export const Chat = observer(({ selected }: Props) => {
    return (
        <>
            {!selected && <div>Try joining a channel...</div>}
            {selected &&
                (() => {
                    const isError = Boolean(selected.error);
                    return (
                        <div className="selected">
                            <div className="chat">
                                {isError && <span className="chan error">{selected.error}</span>}
                                {selected.messages.map((msg, i) => {
                                    return (
                                        <div
                                            className={`message ${msg.self ? 'self' : ''}`}
                                            key={i}
                                        >
                                            <span
                                                style={{ color: msg.userData.color }}
                                                className="author"
                                            >
                                                {msg.userData.username}:
                                            </span>
                                            <span className="actual-msg">{msg.message}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <ChatBox selected={selected} />
                        </div>
                    );
                })()}
        </>
    );
});
