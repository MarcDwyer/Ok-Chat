import React from "react";
import { Channel } from "../../stores/channel";
import styled from "styled-components";

import "./chatbox.scss";
import { observer } from "mobx-react-lite";
import { action, computed, makeObservable, observable } from "mobx";

interface InitProps {
  selected: Channel;
}
interface ExtendedProps extends InitProps {
  searchStore: SearchStore;
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
type HandleCharConfig = {
  index: number;
  value: string;
};
class SearchStore {
  msg: string = "";
  index: number | null = null;
  constructor() {
    makeObservable(this, {
      query: computed,
      msg: observable,
      index: observable,
      handleChange: action,
      handleKey: action,
    });
  }
  get query() {
    const { index, msg } = this;
    if (index === null) {
      return "";
    }
    let q: string = "";
    for (let x = index + 1; x < msg.length; ++x) {
      const curr = msg[x];
      if (curr === " ") break;
      q += curr;
    }
    return q;
  }
  handleChange({ index, value }: HandleCharConfig) {
    const curr = value[index];
    this.msg = value;
    if (this.index && value[this.index] !== "@") {
      this.index = null;
      return;
    }
    if (curr === " " && this.index !== null) {
      this.index = null;
      return;
    }
    if (curr === "@") {
      this.index = index;
    }
  }
  handleKey(key: string) {}
}
type FindProps = {
  selected: Channel;
  query: string;
};
const FindUser = observer(({ selected, query }: FindProps) => {
  const msgs = selected.pause ? selected.snapshot : selected.messages;
  const founds = msgs.filter((msg) => {
    const name = msg.userData["display-name"]?.toLowerCase();
    if (name?.startsWith(query.toLowerCase())) {
      return msg;
    }
  });
  console.log(query);
  return (
    <div className="find-user">
      {founds.map((found) => {
        found.userData["display-name"];
        return (
          <div key={found.id} className="found">
            {found.userData["display-name"]}
          </div>
        );
      })}
    </div>
  );
});
const ChatBox = observer(({ selected, searchStore }: ExtendedProps) => {
  const isChannel = Boolean(selected);
  return (
    <form onKeyDown={(e) => searchStore.handleKey(e.key)}>
      {searchStore.index !== null && searchStore.query.length !== 0 && (
        <FindUser selected={selected} query={searchStore.query} />
      )}
      <MyChatBox
        isChannel={isChannel}
        disabled={!isChannel}
        placeholder="Whats your message?"
        value={searchStore.msg}
        onChange={(e) => {
          const index = e.target.selectionStart - 1;
          const value = e.target.value;
          searchStore.handleChange({ index, value });
        }}
        autoFocus={true}
      />
    </form>
  );
});

const searchStore = new SearchStore();

export default (p: InitProps) => (
  <ChatBox selected={p.selected} searchStore={searchStore} />
);
