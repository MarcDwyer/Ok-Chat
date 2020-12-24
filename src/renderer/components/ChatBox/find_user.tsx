import React from "react";
import { observer } from "mobx-react-lite";
import { Message } from "../../stores/tc_store";

type FindProps = {
  query: string;
  messages: Message[];
};
export const FindUser = observer(({ messages, query }: FindProps) => {
  const dups = new Map<string, boolean>();

  const founds = messages.filter((msg) => {
    const name = msg.userData["display-name"]?.toLowerCase();
    if (name?.startsWith(query.toLowerCase()) && !dups.has(name)) {
      dups.set(name, true);
      return msg;
    }
  });

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
