import React, { useState } from 'react';
import { Channel } from '../../stores/channel';
import styled from 'styled-components';

import './chatbox.scss';
import { observer } from 'mobx-react-lite';

type Props = {
    channel: Channel | null | undefined;
};

type InputProps = {
    isChannel: boolean;
};

const MyChatBox = styled.textarea<InputProps>`
    width: 100%;
    background-color: ${p => (p.isChannel ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.055)')};
    border: none;
    height: 100%;
    border-radius: 10px;
    outline: none;
    color: #eee;
    padding: 10px 10px;
    font-size: 18px;
`;
export const ChatBox = observer(({ channel }: Props) => {
    const [msg, setMsg] = useState<string>('');
    const isChannel = Boolean(channel);
    return (
        <div className="chat-box">
            <form
                onSubmit={() => {
                    console.log(channel);
                    if (channel) {
                        channel.send(msg);
                        setMsg('');
                    }
                }}
            >
                <MyChatBox
                    isChannel={isChannel}
                    disabled={!isChannel}
                    placeholder={(() => {
                        if (!isChannel) {
                            return 'Join a channel first';
                        } else {
                            return 'Whats your message?';
                        }
                    })()}
                    value={msg}
                    onChange={e => setMsg(e.target.value)}
                />
            </form>
        </div>
    );
});
