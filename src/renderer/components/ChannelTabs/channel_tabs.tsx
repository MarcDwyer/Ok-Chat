import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import { TwitchStore } from '../../stores/tc_store';
import { ThemeData } from '../../stores/theme_store';

import './channel_tabs.scss';

type Props = {
    tc: TwitchStore;
    theme: ThemeData;
};
type TabProps = {
    isSel: boolean;
    shadeOne: string;
    shadeTwo: string;
    isError: boolean;
};
const Tab = styled.div<TabProps>`
    flex: 0 0 125px;
    height: 100%;
    background-color: ${p => {
        if (!p.isError) {
            return p.isSel ? p.shadeTwo : p.shadeOne;
        }
        return `rgba(176,9,35, ${p.isSel ? '.55' : '.3'})`;
    }};
    display: flex;
    cursor: pointer;
    border-left: 0.5px solid black;
    border-right: 0.5px solid black;

    span {
        margin: auto auto 1.5px 1.5px;
    }
`;
export const ChannelTabs = observer(({ tc, theme }: Props) => {
    const { selected } = tc;
    const genTabs = tc.channelHub.entries();
    return (
        <div className="main-tab">
            {(() => {
                const tabs: JSX.Element[] = [];
                let i = 0;
                for (const [key, chan] of genTabs) {
                    let isSel = selected === key;

                    const tab: JSX.Element = (
                        <Tab
                            onClick={() => (tc.selected = key)}
                            isError={Boolean(chan.error)}
                            isSel={isSel}
                            shadeOne={theme.shadeOne}
                            shadeTwo={theme.shadeTwo}
                            key={i}
                        >
                            <span>{key}</span>
                        </Tab>
                    );
                    tabs.push(tab);
                    ++i;
                }
                return tabs;
            })()}
        </div>
    );
});
