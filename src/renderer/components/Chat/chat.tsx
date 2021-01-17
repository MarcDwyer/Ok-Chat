import { observer } from "mobx-react-lite";
import React, { useRef, useCallback, useEffect, useState } from "react";

import "./chat.scss";
import { FindUser } from "../FindUsers/find_user";
import { Channel } from "../../stores/channel";
import { ChatMessages } from "../ChatMessages/chat_messages";

type Props = {
  selected: Channel;
};
type BindElement = {
  bottom: number;
  left: number;
  position: string;
}

type UseBind = [binds: BindElement, ref: DOMRect];
const useBind = (ref: React.MutableRefObject<HTMLDivElement> | undefined): UseBind | null => {
  const [bindEle, setBindEle] = useState<UseBind | null>(null);
  useEffect(() => {
    if (ref?.current) {
      const bound = ref.current.getBoundingClientRect();

      setBindEle([{
      bottom: bound.top,
      left: bound.left,
      position: "fixed",
    }, bound])
    }
  }, [ref, ref?.current])

  return bindEle
}
export const Chat = observer(({ selected }: Props) => {
  const chatDiv = useRef<any>();

  const bindings = useBind(chatDiv);

  const handlePause = useCallback(() => {
    if (!selected) return;
    const c = chatDiv.current as HTMLDivElement;
    if (c.scrollTop !== 0 && !selected.pause) {
      console.log("init pause");
      selected.initPause();
    } else if (c.scrollTop >= 0 && selected.pause) {
      console.log("ending...");
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
                <ChatMessages messages={selected.messages} emotes={selected.emotes} />
              </div>
              {selected.pause && bindings && (() => {
                const [binds, rest] = bindings; 
                  return (
                    (
                      <button
                        //@ts-ignore
                        style={{ ...binds, bottom: binds.bottom + 20,  width: rest.width }}
                        className="pause-btn"
                        onClick={() => {
                          const c = chatDiv.current as HTMLDivElement;
                          c.scrollTo({ top: 0 });
                          selected.endPause();
                        }}
                      >
                        <span>Click to unpause chat</span>
                      </button>
                    )
                  )
              })()}
            </div>
          );
        })()}
    </>
  );
});
