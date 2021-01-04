import { action, computed, makeObservable, observable } from "mobx";
import { UserInfo } from "./user_info_store";
import { Channel } from "./channel";
import { ChatUserstate, Client } from "tmi.js";
import { nanoid } from "nanoid";

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
  client: Client | null = null;

  channelHub: ChannelHub = new Map();

  selected: Channel | null = null;

  constructor() {
    makeObservable(this, {
      channelHub: observable,
      selected: observable,
      joinChannel: action,
      partChannel: action,
      decBeforePosition: action,
      incAfterPosition: action,
      setNewSelected: action,
      joinTabs: action,
      tabs: computed,
      connect: action,
    });
  }
  joinChannel(chanName: string) {
    if (!this.client) throw new Error("No client conn has been established");
    chanName = "#" + chanName.toLowerCase();
    let c = this.channelHub.get(chanName);
    if (!c) {
      const position = this.channelHub.size;
      c = new Channel({ key: chanName, position, client: this.client });
      this.channelHub.set(chanName, c);
      this.setTabsLS();
    }
    if (!c.joined) c.join();
    this.selected = c;
  }
  partChannel(channel: Channel) {
    const isSel = this.selected === channel;
    channel.part();
    this.channelHub.delete(channel.key);
    this.decPosition(channel.position);
    if (isSel) {
      this.setNewSelected(channel.position);
    }
    this.setTabsLS();
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
    this.setTabsLS();
  }
  incAfterPosition(start: number, chan: Channel) {
    for (const chan of this.channelHub.values()) {
      if (chan.position >= start) {
        ++chan.position;
      }
    }
    chan.position = start;
    this.setTabsLS();
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
  setTabsLS() {
    localStorage.setItem("channels", JSON.stringify(this.tabs));
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
      if (this.channelHub.has(channel) || !this.client) return;
      const c = new Channel({ key: channel, client: this.client, position: i });
      c.join();
      this.channelHub.set(channel, c);
      if (i === 0) selected = c;
    });
    this.selected = selected;
  }

  connect({ username, token }: UserInfo) {
    const client = Client({
      connection: {
        reconnect: true,
        secure: true,
      },
      identity: {
        username,
        password: `oauth:${token}`,
      },
    });
    client.connect();
    client.on("connected", () => {
      this.client = client;
      this.joinTabs();
    });
    client.on("message", (channel, tags, message, self) => {
      const c = this.channelHub.get(channel);
      if (c) {
        const isDirect = message.toLowerCase().includes(username);
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
