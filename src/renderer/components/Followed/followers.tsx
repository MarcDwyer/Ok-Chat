import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import React from 'react';
import { StreamStore } from '../../stores/streams_store';
import { ThemeStore } from '../../stores/theme_store';

import './followers.scss';

type Props = {
    streamStore: StreamStore;
    themeStore: ThemeStore;
};

export const Followers = observer(({ streamStore, themeStore }: Props) => {
    console.log(streamStore.streams);
    const { themeData } = themeStore;

    const StreamCard = styled.div`
        display: flex;
        padding: 5px 5px;
        cursor: pointer;

        &:hover {
            background-color: ${themeData.backgroundColor};
        }

        img {
            margin-right: 10px;
            border-radius: 50%;
            height: 35px;
            width: 35px;
        }

        .details {
            display: flex;
            flex-direction: column;

            .name {
                font-size: 18px;
                font-weight: bold;
                color: #eee;
            }
            .playing {
                font-size: 14px;
            }
        }
    `;
    return (
        <div className="vertical-list" style={{ backgroundColor: themeData.shadeOne }}>
            {streamStore.streams.map((stream, i) => {
                return (
                    <StreamCard key={i}>
                        <img src={stream.channel.logo} alt="streamer" />
                        <div className="details">
                            <span className="name">{stream.channel.display_name}</span>
                            <span className="playing">{stream.game}</span>
                        </div>
                    </StreamCard>
                );
            })}
        </div>
    );
});
