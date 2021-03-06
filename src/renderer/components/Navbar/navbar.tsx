import { observer } from "mobx-react-lite";
import React from "react";
import { StreamStore } from "../../stores/streams_store";
import { ThemeStore } from "../../stores/theme_store";
import { FaDotCircle } from "react-icons/fa";
import { BiLogOut } from "react-icons/bi";

import { StreamCard } from "./follower_sc";

import "./navbar.scss";
import { UserInfoStore } from "../../stores/user_info_store";
import { TwitchStore } from "../../stores/tc_store";
import { SearchStore } from "../../stores/search_store";
import { FindUser } from "../FindUsers/find_user";

type Props = {
  streamStore: StreamStore;
  themeStore: ThemeStore;
  tc: TwitchStore;
  userInfo: UserInfoStore;
  ss: SearchStore;
};

export const Navbar = observer(
  ({ streamStore, themeStore, tc, userInfo, ss }: Props) => {
    const { themeData } = themeStore;
    const { followers } = streamStore;
    return (
      <div
        className="vertical-list"
        style={{ backgroundColor: themeData.shadeOne }}
      >
        <div className="buttons">
          {streamStore.api && <BiLogOut onClick={() => userInfo.logout()} />}
        </div>
        {ss.searchMode && <FindUser ts={themeStore} results={ss.results} />}
        {!ss.searchMode && followers && (
          <>
            <span className="header">FOLLOWED CHANNELS</span>
            {followers &&
              followers.map((follower, i) => {
                const limit = 15;
                let name = follower.channel.display_name;
                if (name.length > limit) {
                  name = name.substr(0, limit) + "...";
                }
                let game =
                  follower.game.length > limit
                    ? follower.game.substring(0, limit) + "..."
                    : follower.game;
                return (
                  <StreamCard
                    key={i}
                    hoverShade={themeData.shadeTwo}
                    onClick={(_) => {
                      tc.joinChannel(follower.channel.display_name);
                    }}
                  >
                    <img src={follower.channel.logo} alt="streamer" />
                    <div className="details">
                      <span className="name">{name}</span>
                      <span className="playing">{game}</span>
                    </div>
                    <div className="viewer-count">
                      <FaDotCircle />
                      <span className="viewers">{follower.viewers}</span>
                    </div>
                  </StreamCard>
                );
              })}
          </>
        )}
        {!followers && !ss.searchMode && (
          <div className="loading">
            <span>Fetching streams...</span>
          </div>
        )}
      </div>
    );
  }
);
