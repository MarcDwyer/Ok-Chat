import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import { TwitchStore } from '../../stores/tc_store';
import { ThemeData } from '../../stores/theme_store';
import { AiOutlineClose } from 'react-icons/ai';

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
        margin: auto;
    }
    svg {
        margin: auto;
    }
`;
export const ChannelTabs = observer(({ tc, theme }: Props) => {
    const { selected, tabs } = tc;
    return (
        <div className="main-tab">
            {tabs.length !== 0 &&
                tabs.map((tab, i) => {
                    const c = tc.channelHub.get(tab);
                    if (!c) {
                        return null;
                    }
                    const isSel = selected === c;
                    return (
                        <Tab
                            onClick={() => (tc.selected = c)}
                            isError={Boolean(c.error)}
                            isSel={isSel}
                            shadeOne={theme.shadeOne}
                            shadeTwo={theme.shadeTwo}
                            key={i}
                        >
                            <span>{tab}</span>
                            <AiOutlineClose
                                onClick={e => {
                                    e.stopPropagation();
                                    tc.partChannel(c);
                                }}
                            />
                        </Tab>
                    );
                })}
        </div>
    );
});
