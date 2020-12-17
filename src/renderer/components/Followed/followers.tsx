import { observer } from 'mobx-react-lite';
import React from 'react';
import { StreamStore } from '../../stores/streams_store';
import { ThemeStore } from '../../stores/theme_store';
import { FaDotCircle } from 'react-icons/fa';

import { StreamCard } from './follower_sc';

import './followers.scss';

type Props = {
    streamStore: StreamStore;
    themeStore: ThemeStore;
};

export const Followers = observer(({ streamStore, themeStore }: Props) => {
    console.log(streamStore.followers);
    const { themeData } = themeStore;

    return (
        <div className="vertical-list" style={{ backgroundColor: themeData.shadeOne }}>
            <span className="header">FOLLOWED CHANNELS</span>
            {streamStore.followers.map((follower, i) => {
                return (
                    <StreamCard key={i} hoverShade={themeData.shadeTwo}>
                        <img src={follower.channel.logo} alt="streamer" />
                        <div className="details">
                            <span className="name">{follower.channel.display_name}</span>
                            <span className="playing">{follower.game}</span>
                        </div>
                        <div className="viewer-count">
                            <FaDotCircle />
                            <span className="viewers">{follower.viewers}</span>
                        </div>
                    </StreamCard>
                );
            })}
        </div>
    );
});
