import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { TwitchStore } from "../../stores/tc_store";
import { ThemeData } from "../../stores/theme_store";
import { AiOutlineClose } from "react-icons/ai";

import "./channel_tabs.scss";
import { action, computed, makeObservable, observable } from "mobx";
import { Channel } from "../../stores/channel";

interface Props {
  tc: TwitchStore;
  theme: ThemeData;
}
interface ExtProps extends Props {
  tabState: TabState;
}
type TabProps = {
  isSel: boolean;
  shadeOne: string;
  shadeTwo: string;
  isError: boolean;
  name: string;
};
const Tab = styled.div<TabProps>`
  flex: 0 0 125px;
  height: 100%;
  background-color: ${(p) => {
    if (!p.isError) {
      return p.isSel ? p.shadeTwo : p.shadeOne;
    }
    return `rgba(176,9,35, ${p.isSel ? ".55" : ".3"})`;
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
class TabState {
  from: Channel | null = null;
  to: Channel | null = null;

  constructor(private tc: TwitchStore) {
    makeObservable(this, {
      from: observable,
      to: observable,
      toFrom: computed,
      isChanging: computed,
      reset: action,
      finalize: action,
    });
  }
  get toFrom() {
    const from = this.from?.key || null,
      to = this.to?.key || null;
    return { from, to };
  }
  get isChanging() {
    return this.from !== null;
  }
  finalize() {
    if (!this.to || !this.from) {
      return;
    }
    const to = this.to.position;
    const from = this.from.position;
    this.from.position = to;
    if (to > from) {
      this.tc.decBeforePosition({ from, to, chan: this.from });
    } else if (to < from) {
      this.tc.incAfterPosition(to, this.from);
    }
    this.reset();
  }
  reset() {
    this.from = null;
    this.to = null;
  }
}
const ChannelTabs = observer(({ tc, theme, tabState }: ExtProps) => {
  const { selected, tabs } = tc;

  useEffect(() => {
    tabState.reset();
  }, [selected]);

  return (
    <div className="main-tab">
      {tabs.length !== 0 &&
        tabs.map((tab) => {
          const c = tc.channelHub.get(tab);
          if (!c) {
            return null;
          }
          const charLimit = 8;
          const name = tab.length > charLimit ? tab.substr(0, 8) + "..." : tab;
          const isSel = selected === c;
          return (
            <Tab
              onDragOver={() => {
                let to: Channel | null = null;
                if (tabState.isChanging) {
                  if (c !== tabState.from) to = c;
                  tabState.to = to;
                }
              }}
              onDragEnd={(_) => {
                if (tabState.isChanging) {
                  console.log("fin");
                  tabState.finalize();
                }
              }}
              draggable={true}
              onDragStart={(_) => (tabState.from = c)}
              name={tab}
              onClick={() => (tc.selected = c)}
              isError={Boolean(c.error)}
              isSel={isSel}
              shadeOne={theme.shadeOne}
              shadeTwo={theme.shadeTwo}
              key={c.id}
            >
              <span>{name}</span>
              <AiOutlineClose
                onClick={(e) => {
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

export default (p: Props) => (
  <ChannelTabs {...p} tabState={new TabState(p.tc)} />
);
