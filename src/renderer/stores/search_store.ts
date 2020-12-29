import { action, computed, makeObservable, observable } from "mobx";
import { ThemeProvider } from "styled-components";
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
        if (!this.searchMode) {
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
  }
  handleKey(key: string) {
    switch (key) {
      case "ArrowUp":
        // ++this.selected;
        break;
      case "ArrowDown":
      // --this.selected;
    }
  }
  updateResults() {
    if (!this.snapshot) {
      console.log("no snapshot");
      return;
    }
    console.log("updating...");
    const { query } = this;
    const msgs = this.snapshot;
    let q = query.toLowerCase();
    let index = this.results.index;

    const dups = new Map<string, boolean>();
    const founds = msgs
      .filter((msg) => {
        const dn = msg.userData["display-name"]?.toLowerCase() as string;
        if (!dups.has(dn) && dn.startsWith(q)) {
          dups.set(dn, true);
          return msg;
        }
      })
      .map((user) => user.userData["display-name"] as string);
    console.log(founds);
    const sel = founds[index];
    if (!sel) {
      index = 0;
    }
    this.results.index = index;
    this.results.users = founds;
  }
}
