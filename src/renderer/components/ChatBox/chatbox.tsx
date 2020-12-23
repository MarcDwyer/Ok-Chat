import React, { useState, useEffect, useRef } from 'react';
import { Channel } from '../../stores/channel';
import styled from 'styled-components';

import './chatbox.scss';
import { observer } from 'mobx-react-lite';
import { Message } from '../../stores/tc_store';

type Props = {
    selected: Channel;
};

type InputProps = {
    isChannel: boolean;
};

const MyChatBox = styled.textarea<InputProps>`
    width: 95%;
    background-color: ${p => (p.isChannel ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.055)')};
    border: none;
    border-radius: 10px;
    padding: 10px 10px;
    margin: auto;
    outline: none;
    color: #eee;
    font-size: 18px;
`;
type FindProps = {
    messages: Message[];
    search: string;
};
const FindUser = observer(({ messages, search }: FindProps) => {
    return <span>the</span>;
});
export const ChatBox = observer(({ selected }: Props) => {
    const [msg, setMsg] = useState<string>('');
    const [find, setFind] = useState<boolean>();

    const isChannel = Boolean(selected);

    useEffect(() => {
        setMsg('');
    }, [selected]);
    return (
        <form
            onKeyDown={e => {
                switch (e.key) {
                    case '@':
                        if (!find) {
                            setFind(true);
                        }
                        break;
                    case 'Enter':
                        if (!msg.length) return;
                        selected.send(msg);
                        setMsg('');
                        e.preventDefault();
                        break;
                }
            }}
        >
            <MyChatBox
                isChannel={isChannel}
                disabled={!isChannel}
                placeholder="Whats your message?"
                value={msg}
                onChange={e => {
                    // get index of character
                    console.log(e.target.selectionStart);
                    setMsg(e.target.value);
                }}
                autoFocus={true}
            />
        </form>
    );
});
