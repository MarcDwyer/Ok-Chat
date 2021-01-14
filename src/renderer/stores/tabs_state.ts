import { Channel } from "./channel";
import { TwitchStore } from "./tc_store";
import { action, computed, makeObservable, observable } from "mobx";

export class TabState {
  from: Channel | null = null;
  to: Channel | null = null;

  constructor(private tc: TwitchStore) {
    makeObservable(this, {
      from: observable,
      to: observable,
      toFrom: computed,
      isChanging: computed,
      reset: action,
      finalize: action,
    });
  }
  get toFrom() {
    const from = this.from?.key || null,
      to = this.to?.key || null;
    return { from, to };
  }
  get isChanging() {
    return this.from !== null;
  }
  finalize() {
    if (!this.to || !this.from) {
      return;
    }
    const to = this.to.position;
    const from = this.from.position;
    this.from.position = to;
    if (to > from) {
      this.tc.decBeforePosition({ from, to, chan: this.from });
    } else if (to < from) {
      this.tc.incAfterPosition(to, this.from);
    }
    this.reset();
  }
  reset() {
    this.from = null;
    this.to = null;
  }
}
