import React from "react";
import { observer } from "mobx-react-lite";
import { Message } from "../../stores/tc_store";
import { getMsgStyle } from "../../util";
import { EmoteMap } from "../../emotes/emotes";

type Props = {
  messages: Message[];
  emotes: EmoteMap;
};
export const ChatMessages = observer(({ messages, emotes }: Props) => {
  const parseMsg = (msg: string) => {
    return (
      <div className="actual-msg">
        {(() => {
          if (!emotes.size) return msg;
          const words = msg.split(" ");
          const result: JSX.Element[] = [];
          words.forEach((word, i) => {
            //@ts-ignore
            const emote = emotes.get(word);
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
      {messages.map((msg) => {
        return (
          <div
            key={msg.id}
            className={`message ${msg.self ? "self" : ""}`}
            style={getMsgStyle(msg)}
          >
            <span style={{ color: msg.userData.color }} className="author">
              {msg.userData["display-name"]}:
            </span>
            {parseMsg(msg.message)}
          </div>
        );
      })}
    </>
  );
});
