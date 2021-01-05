import { action, computed, makeObservable, observable } from "mobx";
import { nanoid } from "nanoid";
import { Client } from "tmi.js";
import { TwitchApi } from "../../twitch_api";
import { Message } from "./tc_store";

type ChannelData = {
  position: number;
  client: Client;
  key: string;
  api: TwitchApi;
};
export class Channel {
  id: string = nanoid(5);
  pause: boolean = false;
  snapshotMsg: Message[] = [];

  key: string;
  position: number;

  liveMsg: Message[] = [];
  joined: boolean = false;
  error: string | null = null;

  private client: Client;
  private api: TwitchApi;

  constructor({ client, position, key, api }: ChannelData) {
    this.client = client;
    this.position = position;
    this.key = key;
    this.api = api;
    makeObservable(this, {
      pause: observable,
      messages: computed,
      channelName: computed,
      error: observable,
      snapshotMsg: observable,
      liveMsg: observable,
      joined: observable,
      position: observable,
      handleMsg: action,
      initPause: action,
      endPause: action,
    });
  }
  async join() {
    console.log(`Joining ${this.key}`);
    try {
      await this.client.join(this.key);
      this.error = null;
      this.joined = true;
    } catch (e) {
      this.error = e;
      this.joined = false;
    }
  }
  part() {
    this.client.part(this.key).then(() => (this.joined = false));
  }

  send(msg: string) {
    this.client.say(this.key, msg);
  }
  handleMsg(m: Message) {
    const limit = 250;
    let msgs = [...this.messages];
    if (msgs.length > limit) {
      msgs.length = limit - 25;
    }
    this.liveMsg = [m, ...msgs];
  }
  initPause() {
    this.pause = true;
    this.snapshotMsg = [...this.liveMsg];
  }
  endPause() {
    this.snapshotMsg = [];
    this.pause = false;
  }
  get messages(): Message[] {
    return this.pause ? this.snapshotMsg : this.liveMsg;
  }
  get channelName() {
    return this.key.substr(1, this.key.length - 1);
  }
}
