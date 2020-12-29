import { action, computed, makeObservable, observable } from "mobx";
import { Message } from "./tc_store";

type HandleCharConfig = {
  index: number;
  value: string;
};
export type Results = {
  index: number;
  users: string[];
};
export class SearchStore {
  msg: string = "";
  query: string = "";
  startIndex: number | null = null;

  snapshot: Message[] | null = null;

  results: Results = {
    users: [],
    index: 0,
  };

  constructor() {
    makeObservable(this, {
      query: observable,
      msg: observable,
      startIndex: observable,
      snapshot: observable,
      results: observable,
      handleChange: action,
      handleKey: action,
      searchMode: computed,
      updateResults: action,
    });
  }
  handleChange({ index, value }: HandleCharConfig) {
    const curr = value[index];
    this.msg = value;
    const searchMode = this.searchMode;
    //@ts-ignore
    if (searchMode && value[this.startIndex] !== "@") {
      this.startIndex = null;
      return;
    }
    switch (curr) {
      case " ":
        if (searchMode) {
          this.startIndex = null;
        }
        break;
      case "@":
        if (!searchMode) {
          this.startIndex = index;
        }
        this.query = "";
        break;
      default:
        if (searchMode) {
          this.fetchQuery(value);
          break;
        }
        this.reverseLookup(value, index);
    }
  }
  get searchMode(): boolean {
    return this.startIndex !== null;
  }
  fetchQuery(value: string) {
    let query = "";
    //@ts-ignore
    for (let x = this.startIndex + 1; x < value.length; x++) {
      const c = value[x];
      if (c !== " ") {
        query += c;
        continue;
      }
    }
    this.query = query;
  }
  reverseLookup(value: string, index: number) {
    const subStr = value.substr(0, index);
    let query: string = "";
    for (let x = subStr.length - 1; x !== -1; --x) {
      const c = value[x];
      switch (c) {
        case "@":
          this.startIndex = x;
          this.query = query;
          return;
        case " ":
          return;
        default:
          query += c;
      }
    }
    console.log(query);
  }
  handleKey(key: string) {
    console.log(key);
    const { users, index } = this.results;
    const { msg, startIndex } = this;
    let next = index;
    switch (key) {
      case "Tab":
      case "Enter":
        console.log(startIndex);
        if (!this.searchMode) return;
        const channel = users[index];
        console.log(channel);
        //@ts-ignore
        let i = startIndex + 1;
        this.msg = msg.slice(0, i) + channel + msg.slice(i, msg.length);
        this.startIndex = null;
        break;
      case "ArrowUp":
        ++next;
        break;
      case "ArrowDown":
        --next;
    }
    if (!users[next]) {
      next = 0;
    }
    this.results.index = next;
  }
  updateResults(channel: string) {
    if (!this.snapshot) {
      return;
    }
    const { query } = this;
    const msgs = this.snapshot;
    let q = query.toLowerCase();

    const dups = new Map<string, boolean>();
    let names = msgs.map((msg) => {
      const name = msg.userData["display-name"]?.toLowerCase() || "";
      return name;
    });
    names = [channel, ...names];
    const founds = names.filter((name) => {
      if (!dups.has(name) && name.startsWith(q)) {
        dups.set(name, true);
        return name;
      }
    });
    const { index } = this.results;
    if (!founds[index]) {
      this.results.index = 0;
    }
    console.log(query);
    this.results.users = founds;
  }
}
