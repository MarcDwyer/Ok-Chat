import React from 'react';
import { observer } from 'mobx-react-lite';
import { TwitchStore } from '../../stores/tc_store';

type Props = {
    tc: TwitchStore;
};
export const ChannelTabs = observer((props: Props) => {
    const { channels } = props.tc;

    return (
        <div className="main-tab">
            {channels.map((c, i) => {
                return (
                    <div key={i} className="tab">
                        {c}
                    </div>
                );
            })}
        </div>
    );
});
