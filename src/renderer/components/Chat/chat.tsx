import { observer } from 'mobx-react-lite';
import React from 'react';
import { GeneralColors } from '../../general_colors';
import { Channel } from '../../stores/channel';
import { Message } from '../../stores/tc_store';
import { ChatBox } from '../ChatBox/chatbox';

import './chat.scss';

type Props = {
    selected: Channel | undefined;
};
function getMsgStyle(m: Message) {
    const result = {
        backgroundColor: ''
    };
    if (m.isDirect) {
        result.backgroundColor = GeneralColors.directMsg;
        return result;
    }
    if (m.self) {
        result.backgroundColor = GeneralColors.selfMsg;
    }
    if (m.userData.mod) {
        result.backgroundColor = GeneralColors.modMsg;
    }
    return result;
}
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
                                            style={getMsgStyle(msg)}
                                        >
                                            <span
                                                style={{ color: msg.userData.color }}
                                                className="author"
                                            >
                                                {msg.userData['display-name']}:
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
