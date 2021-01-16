import { observer } from "mobx-react-lite";
import React, { useRef, useCallback, useEffect } from "react";
import { ChatBox } from "../ChatBox/chatbox";
import styled from "styled-components";

import "./chat.scss";
import { getMsgStyle } from "../../util";
import { SearchStore } from "../../stores/search_store";
import { FindUser } from "./find_user";
import { Channel } from "../../stores/channel";

type Props = {
  ss: SearchStore;
  selected: Channel;
};

const PauseBtn = styled.button``;

export const Chat = observer(({ selected, ss }: Props) => {
  const chatDiv = useRef<any>();
  const isCurr = chatDiv && chatDiv.current;

  const handlePause = useCallback(() => {
    if (!selected) return;
    const c = chatDiv.current as HTMLDivElement;
    if (c.scrollTop !== 0 && !selected.pause) {
      selected.initPause();
    } else if (c.scrollTop >= 0 && selected.pause) {
      console.log("ending...");
      selected.endPause();
      c.scrollTo({ top: 0 });
    }
  }, [selected]);

  useEffect(() => {
    if (ss.searchMode) {
      ss.snapshot = [...selected.messages];
    }
  }, [ss.searchMode]);
  useEffect(() => {
    if (ss.searchMode && ss.snapshot) {
      ss.updateResults(selected.channelName);
    }
  }, [selected.channelName, ss.query, ss.searchMode, ss.snapshot]);

  const parseMsg = (msg: string) => {
    return (
      <div className="actual-msg">
        {(() => {
          if (!selected.emotes.size) return msg;
          const words = msg.split(" ");
          const result: JSX.Element[] = [];
          words.forEach((word, i) => {
            //@ts-ignore
            const emote = selected.emotes.get(word);
            if (emote) {
              result.push(<img key={i} src={emote.url} />);
            } else {
              result.push(
                <span key={i} className="word">
                  {word}{" "}
                </span>
              );
            }
          });
          return result;
        })()}
      </div>
    );
  };
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
                      {parseMsg(msg.message)}
                    </div>
                  );
                })}
                {ss.searchMode && <FindUser results={ss.results} />}
                {selected.pause && isCurr && (
                  <PauseBtn
                    className="pause-btn"
                    onClick={() => {
                      const c = chatDiv.current as HTMLDivElement;
                      c.scrollTo({ top: 0 });
                      selected.endPause();
                    }}
                  >
                    <span>Click to unpause chat</span>
                  </PauseBtn>
                )}
              </div>
              <ChatBox selected={selected} ss={ss} />
            </div>
          );
        })()}
    </>
  );
});

interface InitProps {
  selected: Channel;
}
export default ({ selected }: InitProps) => (
  <Chat selected={selected} ss={new SearchStore()} />
);
