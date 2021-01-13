import { makeAutoObservable } from "mobx";
import { TwitchApi, TwitchEndpoints } from "../../twitch_api";
import {
  StreamData,
  V5StreamersPayload,
} from "../twitch_types/twitch_api_types";

export class StreamStore {
  followers: StreamData[] | null = null;
  error: string | null = null;

  private refresh: NodeJS.Timeout | null = null;
  private api: TwitchApi | null = null;

  constructor() {
    makeAutoObservable(this);
  }
  async getFollowers() {
    const follows = await this.api?.fetch<V5StreamersPayload>(
      TwitchEndpoints.follows
    );
    if (follows && follows.streams) {
      this.followers = follows.streams;
    }
  }
  init(api: TwitchApi) {
    this.api = api;
    this.getFollowers().catch((_) =>
      setTimeout(() => this.getFollowers(), 5500)
    );
    this.refresh = setInterval(() => {
      this.getFollowers();
    }, 60000 * 5);
  }
}
