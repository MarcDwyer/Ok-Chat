import React from "react";
import { Channel } from "../../stores/channel";
import styled from "styled-components";

import "./chatbox.scss";
import { observer } from "mobx-react-lite";
import { SearchStore } from "../../stores/search_store";

interface Props {
  ss: SearchStore;
  selected: Channel;
}

type InputProps = {
  isChannel: boolean;
};

const MyChatBox = styled.textarea<InputProps>`
  width: 100%;
  background-color: ${(p) =>
    p.isChannel ? "rgba(255,255,255,.1)" : "rgba(255,255,255,.055)"};
  border: none;
  border-radius: 10px;
  padding: 10px 10px;
  margin: auto;
  outline: none;
  color: #eee;
  font-size: 18px;
  resize: vertical;
`;
enum ArrowKeys {
  ArrowUp,
  ArrowDown,
  Enter,
  Tab,
}
export const ChatBox = observer(({ selected, ss }: Props) => {
  const isChannel = Boolean(selected);
  return (
    <form
      onKeyDown={(e) => {
        if (ss.searchMode && e.key in ArrowKeys) {
          ss.handleKey(e.key);
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        switch (e.key) {
          case "Enter":
            e.preventDefault();
            selected.send(ss.msg);
            ss.reset();
            ss.msg = "";
        }
      }}
    >
      <MyChatBox
        isChannel={isChannel}
        disabled={!isChannel}
        placeholder="Whats your message?"
        value={ss.msg}
        onChange={(e) => {
          const index = e.target.selectionStart - 1;
          const value = e.target.value;
          ss.handleChange({ index, value });
        }}
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        autoFocus={true}
        autoComplete="off"
      />
    </form>
  );
});
