import { action, computed, makeObservable, observable } from "mobx";
import { nanoid } from "nanoid";
import { Client } from "tmi.js";
import { Message } from "./tc_store";

type ChannelData = {
  position: number;
  client: Client;
  key: string;
};
export class Channel {
  id: string = nanoid(10);
  limit = 10;
  pause: boolean = false;
  snapshotMsg: Message[] = [];

  key: string;
  position: number;

  liveMsg: Message[] = [];
  joined: boolean = false;
  error: string | null = null;

  private client: Client;

  constructor({ client, position, key }: ChannelData) {
    this.client = client;
    this.position = position;
    this.key = key;
    makeObservable(this, {
      pause: observable,
      messages: computed,
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
      console.log("limit hit");
      msgs.length = limit - 25;
    }
    this.liveMsg = [m, ...msgs];
  }
  initPause() {
    console.log("init pause");
    this.pause = true;
    this.snapshotMsg = [...this.liveMsg];
  }
  endPause() {
    console.log("ending p");
    this.snapshotMsg = [];
    this.pause = false;
  }
  get messages(): Message[] {
    return this.pause ? this.snapshotMsg : this.liveMsg;
  }
}
