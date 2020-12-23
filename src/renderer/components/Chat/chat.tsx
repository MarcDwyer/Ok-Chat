import { observer } from 'mobx-react-lite';
import React, { useRef, useCallback } from 'react';
import { GeneralColors } from '../../general_colors';
import { Message, TwitchStore } from '../../stores/tc_store';
import { ChatBox } from '../ChatBox/chatbox';
import styled from 'styled-components';

import './chat.scss';

type Props = {
    tc: TwitchStore;
};

const PauseBtn = styled.button`
    width: 90%;
    margin: auto;
    font-size: 14px;
    height: 20px;
    background-color: #6441a5;
    border: none;
    outline: none;
    cursor: pointer;
    color: #eee;
`;
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
type Users = Record<string, boolean>;

export const Chat = observer(({ tc }: Props) => {
    const chatDiv = useRef<any>();
    const isCurr = chatDiv && chatDiv.current;
    const { selected } = tc;

    const handlePause = useCallback(() => {
        if (!selected) return;
        const c = chatDiv.current as HTMLDivElement;
        console.log(c.scrollTop);
        if (c.scrollTop !== 0 && !selected.pause) {
            selected.initPause();
        } else if (c.scrollTop >= -25 && selected.pause) {
            selected.endPause();
            c.scrollTo({ top: 0 });
        }
    }, [tc.selected]);

    return (
        <>
            {!selected && <div>Try joining a channel...</div>}
            {selected &&
                (() => {
                    const isError = Boolean(selected.error);
                    const msgs = selected.pause ? selected.snapshot : selected.messages;
                    return (
                        <div className="selected">
                            <div className="chat" onScroll={handlePause} ref={chatDiv}>
                                {isError && <span className="chan error">{selected.error}</span>}
                                {msgs.map(msg => {
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`message ${msg.self ? 'self' : ''}`}
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
                            {selected.pause && isCurr && (
                                <PauseBtn
                                    onClick={() => {
                                        const c = chatDiv.current as HTMLDivElement;
                                        c.scrollTo({ top: 0 });
                                        selected.endPause();
                                    }}
                                >
                                    Click to resume chat
                                </PauseBtn>
                            )}
                            <ChatBox selected={selected} />
                        </div>
                    );
                })()}
        </>
    );
});
