import React from "react";
import { Channel } from "../../stores/channel";
import styled from "styled-components";

import "./chatbox.scss";
import { observer } from "mobx-react-lite";
import { SearchStore } from "../../stores/search_store";

import { FindUser } from "./find_user";

interface InitProps {
  selected: Channel;
}
interface ExtendedProps extends InitProps {
  ss: SearchStore;
}
type InputProps = {
  isChannel: boolean;
};

const MyChatBox = styled.textarea<InputProps>`
  width: 95%;
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

const ChatBox = observer(({ selected, ss }: ExtendedProps) => {
  const isChannel = Boolean(selected);
  return (
    <form
      onKeyDown={(e) => {
        if (ss.searchMode) {
          ss.handleKey(e.key);
          return;
        }
        switch (e.key) {
          case "Enter":
            selected.send(ss.msg);
            ss.reset();
            e.preventDefault();
        }
      }}
    >
      {ss.searchMode && ss.query.length !== 0 && (
        <FindUser messages={selected.messages} query={ss.query} />
      )}
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
        autoFocus={true}
      />
    </form>
  );
});

const srchStore = new SearchStore();

export default (p: InitProps) => (
  <ChatBox selected={p.selected} ss={srchStore} />
);
