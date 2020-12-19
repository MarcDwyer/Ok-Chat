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
    console.log({ selected, channel });
    return (
        <div className="main-chat">
            {!selected && <div>Try joining a channel...</div>}
            {selected &&
                channel &&
                (() => {
                    console.log(channel);
                    return (
                        <div className="selected">
                            <div className="chat">
                                {channel.messages.map(msg => {
                                    return (
                                        <div
                                            className={`message ${
                                                msg.directMsg ? 'directmsg' : ''
                                            }`}
                                        >
                                            <span className="author">{msg.author}</span>
                                            <span className="actual-msg">{msg.message}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })()}
            <ChatBox channel={channel} />
        </div>
    );
});
