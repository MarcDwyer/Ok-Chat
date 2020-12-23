import React, { useState, useEffect } from 'react';
import { Channel } from '../../stores/channel';
import styled from 'styled-components';

import './chatbox.scss';
import { observer } from 'mobx-react-lite';

type Props = {
    selected: Channel;
};

type InputProps = {
    isChannel: boolean;
};

const MyChatBox = styled.input<InputProps>`
    width: 90%;
    background-color: ${p => (p.isChannel ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.055)')};
    border: none;
    border-radius: 10px;
    padding: 15px 15px;
    margin: auto;
    outline: none;
    color: #eee;
    font-size: 18px;
`;
export const ChatBox = observer(({ selected }: Props) => {
    const [msg, setMsg] = useState<string>('');
    const [ph, setPh] = useState<string>('Whats your message?');

    const isChannel = Boolean(selected);

    useEffect(() => {
        setMsg('');
    }, [selected]);
    return (
        <form
            className="chat-box"
            onSubmit={e => {
                e.preventDefault();
                if (!msg.length) {
                    return;
                }
                selected.send(msg);
                setMsg('');
            }}
        >
            <MyChatBox
                isChannel={isChannel}
                disabled={!isChannel}
                placeholder={ph}
                value={msg}
                onChange={e => setMsg(e.target.value)}
                autoFocus={true}
            />
        </form>
    );
});
