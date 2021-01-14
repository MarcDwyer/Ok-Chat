import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { TwitchStore } from "../../stores/tc_store";
import { ThemeData } from "../../stores/theme_store";

import "./join.scss";

type Props = {
  tc: TwitchStore;
  theme: ThemeData;
};

export const JoinChannel = observer(({ tc, theme }: Props) => {
  const [channel, setChannel] = useState<string>("");
  return (
    <div
      className="join-tab"
      style={{
        backgroundColor: theme.shadeOne,
      }}
    >
      <FaPlus />
    </div>
  );
});
