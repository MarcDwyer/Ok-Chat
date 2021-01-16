import { action, computed, makeObservable, observable } from "mobx";
import { removeQuery } from "../util";
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

  private initState: this = { ...this };

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
      reset: action,
      completeQuery: action,
    });
  }
  handleChange({ index, value }: HandleCharConfig) {
    const curr = value[index];
    this.msg = value;
    const searchMode = this.searchMode;
    if (
      //@ts-ignore
      (searchMode && value[this.startIndex] !== "@") ||
      (searchMode && !value.length)
    ) {
      this.reset();
      return;
    }
    switch (curr) {
      case " ":
        if (searchMode) {
          this.reset();
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
    const subStr = value.substr(0, index + 1);
    const query: string[] = [];
    for (let x = subStr.length - 1; x !== -1; --x) {
      const c = value[x];
      switch (c) {
        case "@":
          this.startIndex = x;
          this.query = query.join("");
          break;
        case " ":
          return;
        default:
          query.unshift(c);
      }
    }
  }
  handleKey(key: string) {
    const { users, index } = this.results;
    let next = index;
    switch (key) {
      case "Tab":
      case "Enter":
        const channel = users[index];
        this.completeQuery(channel);
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
  completeQuery(channel: string) {
    const { msg, startIndex, query } = this;
    if (startIndex === null) return;
    console.log("running...");
    //@ts-ignore
    const index = startIndex + 1;
    const first = msg.slice(0, index);
    let last = msg.slice(index + 1, msg.length);
    console.log({ first, last });
    last = removeQuery(last, query.length);

    this.msg = first + channel + " " + last;
    this.reset();
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
    this.results.users = founds;
  }
  reset() {
    enum Not {
      msg,
      initState,
    }
    for (const [k, v] of Object.entries(this.initState)) {
      if (k in this && typeof v !== "function" && !(k in Not)) {
        //@ts-ignore
        this[k] = v;
      }
    }
  }
}
