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
`;
export const ChannelTabs = observer((props: Props) => {
    const { channels } = props.tc;
    const { selected } = props.tc;
    return (
        <div className="main-tab">
            {channels.map((c, i) => {
                let isSel = selected === c;

                if (isSel === null && i === 0) {
                    isSel = true;
                }
                return (
                    <Tab
                        onClick={() => (props.tc.selected = c)}
                        isSel={isSel}
                        shadeColor={isSel ? props.theme.shadeTwo : props.theme.shadeOne}
                        key={i}
                    >
                        {c}
                    </Tab>
                );
            })}
        </div>
    );
});
