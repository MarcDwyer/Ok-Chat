import React from "react";
import { observer } from "mobx-react-lite";
import { Results } from "../../stores/search_store";

type FindProps = {
  results: Results;
};

export const FindUser = observer(({ results }: FindProps) => {
  const { users, index } = results;
  return (
    <div className="find-user">
      {users.map((found, i) => {
        return (
          <div
            key={i}
            className={`found ${i === index ? "found-selected" : ""}`}
          >
            {found}
          </div>
        );
      })}
    </div>
  );
});
