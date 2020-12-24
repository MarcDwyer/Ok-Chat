import { action, computed, makeObservable, observable } from "mobx";

type HandleCharConfig = {
  index: number;
  value: string;
};
export class SearchStore {
  msg: string = "";
  query: string = "";
  index: number | null = null;
  constructor() {
    makeObservable(this, {
      query: observable,
      msg: observable,
      index: observable,
      handleChange: action,
      handleKey: action,
      reset: action,
      searchMode: computed,
    });
  }
  handleChange({ index, value }: HandleCharConfig) {
    const curr = value[index];
    this.msg = value;
    const isIndex = this.index !== null;
    //@ts-ignore
    if (isIndex && value[this.index] !== "@") {
      this.index = null;
      return;
    }
    switch (curr) {
      case " ":
        if (isIndex) {
          this.index = null;
        }
        return;
      case "@":
        this.index = index;
        this.query = "";
        return;
      default:
        if (isIndex) {
          this.fetchQuery(value);
          return;
        }
        this.reverseLookup(value, index);
    }
  }
  get searchMode(): boolean {
    return this.index !== null;
  }
  fetchQuery(value: string) {
    if (!this.searchMode) return;
    let query = "";
    //@ts-ignore
    for (let x = this.index + 1; x < value.length; x++) {
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
          this.index = x;
          this.query = query;
          return;
        case " ":
          return;
        default:
          query += c;
      }
    }
  }
  handleKey(key: string) {}
  reset() {
    this.index = null;
    this.msg = "";
  }
}
