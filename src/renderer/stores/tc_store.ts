import { action, computed, makeObservable, observable, reaction } from "mobx";
import { Channel } from "./channel";
import { ChatUserstate, Client } from "tmi.js";
import { nanoid } from "nanoid";
import { TwitchApi } from "../../twitch_api";
import { setLS } from "../util";
import { EmoteApi, EmoteMap } from "../emotes/emotes";

export type ChannelHub = Map<string, Channel>;

export type Message = {
  userData: ChatUserstate;
  message: string;
  self: boolean;
  id: string;
  isDirect?: boolean;
};
type DecBeforeParams = {
  from: number;
  to: number;
  chan: Channel;
};

export class TwitchStore {
  api: TwitchApi | null = null;
  client: Client | null = null;

  channelHub: ChannelHub = new Map();

  selected: Channel | null = null;

  emotes: EmoteMap = new Map();

  private initState: this = { ...this };

  constructor() {
    makeObservable(this, {
      channelHub: observable,
      selected: observable,
      api: observable,
      joinChannel: action,
      partChannel: action,
      decPosition: action,
      decBeforePosition: action,
      incAfterPosition: action,
      joinTabs: action,
      tabs: computed,
      init: action,
      reset: action,
    });

    reaction(
      () => this.api,
      (api) => {
        if (api) {
          EmoteApi.attachBttvGlobalEmotes(this.emotes);
        }
      }
    );
    reaction(
      () => this.tabs,
      (tabs) => setLS("channels", JSON.stringify(tabs))
    );
    reaction(
      () => this.selected,
      (sel, prevSel) => this.handleSelected(sel, prevSel)
    );
  }
  reset() {
    for (const [k, v] of Object.entries(this.initState)) {
      if (typeof v !== "function" && k in this) {
        //@ts-ignore
        this[k] = v;
      }
    }
  }
  handleSelected(curr: Channel | null, prev: Channel | null) {
    const tabs = this.tabs;
    if (!curr && prev && tabs.length) {
      const index = prev.position;
      const sel = tabs[index] || tabs[index + 1] || tabs[index - 1];
      const chan = this.channelHub.get(sel);
      if (chan) {
        this.selected = chan;
      }
    }
  }
  joinChannel(chanName: string) {
    if (!this.client) throw new Error("No client conn has been established");
    chanName = "#" + chanName.toLowerCase();
    let c = this.channelHub.get(chanName);
    if (!c && this.api) {
      const position = this.channelHub.size;
      c = new Channel({
        key: chanName,
        position,
        client: this.client,
        api: this.api,
        emotes: this.emotes,
      });
      this.channelHub.set(chanName, c);
    }
    //@ts-ignore
    if (c && !c.joined) c.join();
    this.selected = c || null;
  }
  partChannel(channel: Channel) {
    if (channel === this.selected) this.selected = null;
    channel.part();
    this.channelHub.delete(channel.key);
    this.decPosition(channel.position);
  }
  decPosition(start: number) {
    for (const chan of this.channelHub.values()) {
      if (chan.position > start) {
        --chan.position;
      }
    }
  }
  decBeforePosition({ from, to, chan }: DecBeforeParams) {
    for (const chan of this.channelHub.values()) {
      const { position } = chan;
      if (position <= to && position > from) {
        --chan.position;
      }
    }
    chan.position = to;
  }
  incAfterPosition(start: number, chan: Channel) {
    for (const chan of this.channelHub.values()) {
      if (chan.position >= start) {
        ++chan.position;
      }
    }
    chan.position = start;
  }
  get tabs() {
    const result: string[] = new Array(this.channelHub.size);
    for (const [k, chan] of this.channelHub.entries()) {
      result[chan.position] = k;
    }
    return result;
  }
  joinTabs() {
    if (!this.client) return;
    const ls = localStorage.getItem("channels");
    if (!ls) return;
    const channels: string[] = JSON.parse(ls);
    let selected: Channel | null = null;
    channels.forEach((channel, i) => {
      if (
        this.channelHub.has(channel) ||
        !this.client ||
        !this.api ||
        channel === "null"
      )
        return;
      const c = new Channel({
        key: channel,
        client: this.client,
        position: i,
        api: this.api,
        emotes: this.emotes,
      });
      c.join();
      this.channelHub.set(channel, c);
      if (i === 0) selected = c;
    });
    this.selected = selected;
  }
  init(client: Client, api: TwitchApi) {
    this.api = api;
    this.client = client
    client.connect().catch((e) => console.error(e));
    client.on("connected", () => {
      this.client = client;
      this.joinTabs();
    });
    client.on("message", (channel, tags, message, self) => {
      const c = this.channelHub.get(channel);
      if (c) {
        const isDirect = message.toLowerCase().includes(api.username);
        const m: Message = {
          userData: tags,
          message,
          self,
          isDirect,
          id: nanoid(5),
        };
        c.handleMsg(m);
      }
    });
  }
}
