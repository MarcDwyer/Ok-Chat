import { observer } from "mobx-react-lite";
import React, { useRef, useCallback } from "react";
import { TwitchStore } from "../../stores/tc_store";
import { ChatBox } from "../ChatBox/chatbox";
import styled from "styled-components";

import "./chat.scss";
import { getMsgStyle } from "../../util";
import { SearchStore } from "../../stores/search_store";
import { FindUser } from "./find_user";

type Props = {
  tc: TwitchStore;
  ss: SearchStore;
};

const PauseBtn = styled.button`
  width: 90%;
  margin: auto;
  font-size: 14px;
  height: 20px;
  background-color: transparent;
  background-color: #6441a5;
  border: none;
  outline: none;

  cursor: pointer;
  color: #eee;

  span {
    margin: 5px auto 5px auto;
  }
`;

export const Chat = observer(({ tc, ss }: Props) => {
  const chatDiv = useRef<any>();
  const isCurr = chatDiv && chatDiv.current;
  const { selected } = tc;

  const handlePause = useCallback(() => {
    if (!selected) return;
    const c = chatDiv.current as HTMLDivElement;
    if (c.scrollTop !== 0 && !selected.pause) {
      selected.initPause();
    } else if (c.scrollTop >= -45 && selected.pause) {
      selected.endPause();
      c.scrollTo({ top: 0 });
    }
  }, [selected]);

  return (
    <>
      {!selected && <div>Try joining a channel...</div>}
      {selected &&
        (() => {
          const isError = Boolean(selected.error);
          return (
            <div className="selected">
              <div className="chat" onScroll={handlePause} ref={chatDiv}>
                {isError && (
                  <span className="chan error">{selected.error}</span>
                )}
                {selected.messages.map((msg) => {
                  return (
                    <div
                      key={msg.id}
                      className={`message ${msg.self ? "self" : ""}`}
                      style={getMsgStyle(msg)}
                    >
                      <span
                        style={{ color: msg.userData.color }}
                        className="author"
                      >
                        {msg.userData["display-name"]}:
                      </span>
                      <span className="actual-msg">{msg.message}</span>
                    </div>
                  );
                })}
                {ss.searchMode && (
                  <FindUser query={ss.query} messages={selected.messages} />
                )}
              </div>
              {selected.pause && isCurr && (
                <PauseBtn
                  onClick={() => {
                    const c = chatDiv.current as HTMLDivElement;
                    c.scrollTo({ top: 0 });
                    selected.endPause();
                  }}
                >
                  <span>Click to unpause chat</span>
                </PauseBtn>
              )}
              <ChatBox selected={selected} ss={ss} />
            </div>
          );
        })()}
    </>
  );
});

interface InitProps {
  tc: TwitchStore;
}
export default ({ tc }: InitProps) => <Chat tc={tc} ss={new SearchStore()} />;
