import { observer } from 'mobx-react-lite';
import React from 'react';
import { StreamStore } from '../../stores/streams_store';
import { ThemeStore } from '../../stores/theme_store';
import { FaDotCircle } from 'react-icons/fa';

import { StreamCard } from './follower_sc';

import './followers.scss';
import { TwitchStore } from '../../stores/tc_store';

type Props = {
    streamStore: StreamStore;
    themeStore: ThemeStore;
    tc: TwitchStore;
};

export const Followers = observer(({ streamStore, themeStore, tc }: Props) => {
    const { themeData } = themeStore;
    const { followers } = streamStore;
    return (
        <div className="vertical-list" style={{ backgroundColor: themeData.shadeOne }}>
            <span className="header">FOLLOWED CHANNELS</span>
            {followers &&
                followers.map((follower, i) => {
                    const limit = 15;
                    let name = follower.channel.display_name;
                    if (name.length > limit) {
                        name = name.substr(0, limit) + '...';
                    }
                    return (
                        <StreamCard
                            key={i}
                            hoverShade={themeData.shadeTwo}
                            onClick={_ => {
                                const lc = name.toLowerCase();
                                tc.channels.push(lc);
                                tc.selected = lc;
                                //tc.joinChannel(follower.channel.display_name)
                            }}
                        >
                            <img src={follower.channel.logo} alt="streamer" />
                            <div className="details">
                                <span className="name">{name}</span>
                                <span className="playing">{follower.game}</span>
                            </div>
                            <div className="viewer-count">
                                <FaDotCircle />
                                <span className="viewers">{follower.viewers}</span>
                            </div>
                        </StreamCard>
                    );
                })}
            {!followers && (
                <div className="loading">
                    <span>Fetching streams...</span>
                </div>
            )}
        </div>
    );
});
