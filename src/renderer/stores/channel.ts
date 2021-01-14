import {
  action,
  autorun,
  computed,
  makeObservable,
  observable,
  reaction,
} from "mobx";
import { nanoid } from "nanoid";
import { Client } from "tmi.js";
import { TwitchApi, TwitchEndpoints } from "../../twitch_api";
import { EmoteApi, EmoteMap } from "../emotes/emotes";
import { SearchChannel, ChannelData } from "../twitch_types/twitch_api_types";
import { Message } from "./tc_store";

type ChannelConfig = {
  position: number;
  client: Client;
  key: string;
  api: TwitchApi;
  emotes: EmoteMap;
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

  data: ChannelData | null = null;

  emotes: EmoteMap;

  private client: Client;

  constructor({ client, position, key, api, emotes }: ChannelConfig) {
    this.client = client;
    this.position = position;
    this.key = key;

    this.emotes = new Map(emotes);

    makeObservable(this, {
      pause: observable,
      messages: computed,
      channelName: computed,
      data: observable,
      error: observable,
      snapshotMsg: observable,
      liveMsg: observable,
      joined: observable,
      position: observable,
      handleMsg: action,
      initPause: action,
      endPause: action,
    });

    autorun(() => {
      const endpoint = TwitchEndpoints.search + this.channelName + "&limit=1";
      api.fetch<SearchChannel>(endpoint).then((data) => {
        if (data.channels.length) {
          const cData = data.channels[0];
          this.data = cData;
        }
      });
    });
    reaction(
      () => this.data,
      async (data) => {
        if (data) {
          EmoteApi.attachFrankEmotes(data._id, this.emotes);
        }
      }
    );
  }
  async join() {
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
    this.client.say(this.key, msg).catch((e) => console.error(e));
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
