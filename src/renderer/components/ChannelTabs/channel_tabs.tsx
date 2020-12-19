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
    shadeColor: string;
};
const Tab = styled.div<TabProps>`
    flex: 0 0 125px;
    height: 100%;
    background-color: ${p => (p.isSel ? p.shadeColor : '')};
    display: flex;
    cursor: pointer;

    span {
        margin: auto auto 1.5px 1.5px;
    }
`;
export const ChannelTabs = observer(({ tc, theme }: Props) => {
    const { selected } = tc;
    const genTabs = tc.channelHub.keys();
    return (
        <div className="main-tab">
            {(() => {
                const tabs: JSX.Element[] = [];
                let i = 0;
                for (const key of genTabs) {
                    let isSel = selected === key;

                    const tab: JSX.Element = (
                        <Tab
                            onClick={() => (tc.selected = key)}
                            isSel={isSel}
                            shadeColor={isSel ? theme.shadeTwo : theme.shadeOne}
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
