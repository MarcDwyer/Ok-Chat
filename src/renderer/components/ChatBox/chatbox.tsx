import React, { useState } from 'react';
import { Channel } from '../../stores/channel';
import styled from 'styled-components';

import './chatbox.scss';
import { observer } from 'mobx-react-lite';

type Props = {
    channel: Channel;
};

type InputProps = {
    isChannel: boolean;
};

const MyChatBox = styled.input<InputProps>`
    width: 100%;
    background-color: ${p => (p.isChannel ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.055)')};
    border: none;
    border-radius: 10px;
    height: 100%;
    width: 100%;
    padding: 10px 10px;
    margin: auto;
    outline: none;
    color: #eee;
    font-size: 18px;
`;
export const ChatBox = observer(({ channel }: Props) => {
    const [msg, setMsg] = useState<string>('');
    const isChannel = Boolean(channel);
    return (
        <div className="chat-box">
            <form
                onSubmit={e => {
                    e.preventDefault();
                    console.log(channel);
                    if (channel) {
                        // const msg: Message = {
                        //     author:
                        // }
                        channel.send(msg);
                        setMsg('');
                    }
                }}
            >
                <MyChatBox
                    isChannel={isChannel}
                    disabled={!isChannel}
                    placeholder="Whats your message?"
                    value={msg}
                    onChange={e => setMsg(e.target.value)}
                />
            </form>
        </div>
    );
});
