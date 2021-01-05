import { action, computed, makeObservable, observable, reaction } from "mobx";
import { Channel } from "./channel";
import { ChatUserstate, Client } from "tmi.js";
import { nanoid } from "nanoid";
import { TwitchApi } from "../../twitch_api";
import { setLS } from "../util";

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
  private api: TwitchApi | null = null;
  client: Client | null = null;

  channelHub: ChannelHub = new Map();

  selected: Channel | null = null;

  constructor() {
    makeObservable(this, {
      channelHub: observable,
      selected: observable,
      joinChannel: action,
      partChannel: action,
      decPosition: action,
      decBeforePosition: action,
      incAfterPosition: action,
      setNewSelected: action,
      joinTabs: action,
      tabs: computed,
      connect: action,
    });

    reaction(
      () => this.tabs,
      (tabs) => setLS("channels", JSON.stringify(tabs))
    );
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
      });
      this.channelHub.set(chanName, c);
    }
    //@ts-ignore
    if (c && !c.joined) c.join();
    this.selected = c || null;
  }
  partChannel(channel: Channel) {
    const isSel = this.selected === channel;
    channel.part();
    this.channelHub.delete(channel.key);
    this.decPosition(channel.position);
    if (isSel) {
      this.setNewSelected(channel.position);
    }
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
  setNewSelected(index: number) {
    const tabs = this.tabs;
    if (tabs.length === 0) {
      this.selected = null;
      return;
    }
    const sel = tabs[index] || tabs[index + 1] || tabs[index - 1];
    if (sel) {
      const channel = this.channelHub.get(sel);
      if (channel) this.selected = channel;
    }
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
      if (this.channelHub.has(channel) || !this.client || !this.api) return;
      const c = new Channel({
        key: channel,
        client: this.client,
        position: i,
        api: this.api,
      });
      c.join();
      this.channelHub.set(channel, c);
      if (i === 0) selected = c;
    });
    this.selected = selected;
  }

  connect(api: TwitchApi) {
    this.api = api;
    const client = Client({
      connection: {
        reconnect: true,
        secure: true,
      },
      identity: {
        username: api.username,
        password: `oauth:${api.token}`,
      },
    });
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
