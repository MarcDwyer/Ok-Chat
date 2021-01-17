import React from "react";
import { observer } from "mobx-react-lite";
import { Results } from "../../stores/search_store";

import "./find_user.scss";
import { ThemeStore } from "../../stores/theme_store";

type FindProps = {
  results: Results;
  ts: ThemeStore;
};

export const FindUser = observer(({ results, ts }: FindProps) => {
  const { users, index } = results;
  console.log(users[index]);
  return (
    <div className="find-user">
      {users.map((found, i) => {
        const isSel = i === index;
        return (
          <div
            key={i}
            className={`found ${isSel ? "found-selected" : ""}`}
            style={isSel ? { backgroundColor: ts.themeData.shadeTwo } : {}}
          >
            {found}
          </div>
        );
      })}
    </div>
  );
});
