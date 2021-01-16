import { action, makeObservable, observable } from "mobx";
import { TwitchApi, TwitchEndpoints } from "../../twitch_api";
import {
  StreamData,
  V5StreamersPayload,
} from "../twitch_types/twitch_api_types";

export class StreamStore {
  followers: StreamData[] | null = null;
  error: string | null = null;

  private refresh: NodeJS.Timeout | null = null;
  api: TwitchApi | null = null;

  constructor() {
    makeObservable(this, {
      followers: observable,
      error: observable,
      api: observable,
      getFollowers: action,
      init: action,
    });
  }
  async getFollowers() {
    try {
      const follows = await this.api?.fetch<V5StreamersPayload>(
        TwitchEndpoints.follows
      );
      if (follows && follows.streams) {
        this.followers = follows.streams;
      }
    } catch (e) {
      throw e;
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
  reset() {
    if (this.refresh) clearInterval(this.refresh);
    for (const [k, v] of Object.entries(this)) {
      if (typeof v !== "function") {
        //@ts-ignore
        this[k] = null;
      }
    }
  }
}
