import { ipcRenderer } from "electron";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { TwitchStore } from "../../stores/tc_store";
import { ThemeStore } from "../../stores/theme_store";
import { UserInfoStore } from "../../stores/user_info_store";

import Login from "../Login/login";
import { EnterUser } from "../EnterUsername/enter_user";
import { Navbar } from "../Navbar/navbar";
import ChannelTabs from "../ChannelTabs/channel_tabs";
import { Chat } from "../Chat/chat";
import { ChatBox } from "../ChatBox/chatbox";

import "./main.scss";
import { StreamStore } from "../../stores/streams_store";
import { TwitchApi } from "../../../twitch_api";
import { SearchStore } from "../../stores/search_store";
import { Client } from "tmi.js";

type TokenPayload = {
  token?: string;
};

type Props = {
  themeStore: ThemeStore;
  tc: TwitchStore;
  userInfo: UserInfoStore;
  streamStore: StreamStore;
  searchStore: SearchStore;
};
export const Main = observer(
  ({ themeStore, tc, userInfo, streamStore, searchStore }: Props) => {
    const { themeData } = themeStore;
    const { token, username } = userInfo;

    useEffect(() => {
      if (username && token) {
        const api = new TwitchApi(token, username);
        const client = Client({
          connection: {
            reconnect: true,
            secure: true,
          },
          identity: {
            username: api.username,
            password: `oauth:${api.token}`,
          },
        });
        streamStore.init(api);
        client.connect().then(_ => {
          tc.init(client, api);
        }).catch(e => userInfo.logout())
      } else if (!username && !token) {
        streamStore.reset();
        tc.reset();
      }
    }, [username, token]);

    useEffect(() => {
      ipcRenderer.on("get-auth", (msg: any) => {
        console.log(msg);
      });
      ipcRenderer.on("token", (evt, arg: TokenPayload) => {
        if (arg.token) {
          userInfo.setToken(arg.token);
        }
      });
      return function() {
        console.log("closing...");
        tc.client?.disconnect();
      };
    }, []);
    useEffect(() => {
      if (tc.selected && !tc.channelHub.has(tc.selected.key)) {
        tc.selected = null;
      }
    }, [tc.channelHub, tc.selected]);
    console.log(token);
    return (
      <div
        className="container"
        style={{
          backgroundColor: themeData.backgroundColor,
          color: themeData.color,
        }}
      >
        {!token && <Login />}
        {token && !username && (
          <EnterUser theme={themeStore} userInfo={userInfo} />
        )}
        {token && username && (
          <div className="main-app">
            <Navbar
              userInfo={userInfo}
              streamStore={streamStore}
              themeStore={themeStore}
              tc={tc}
              ss={searchStore}
            />
            {tc.selected && (
              <div className="inner-app">
                <ChannelTabs tc={tc} theme={themeData} />
                <Chat selected={tc.selected} />
                <ChatBox selected={tc.selected} ss={searchStore} />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);
