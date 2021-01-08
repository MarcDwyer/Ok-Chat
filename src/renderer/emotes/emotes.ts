import { TwitchApi } from "../../twitch_api";
import {
  BaseEmote,
  FrankerEmote,
  TwitchEmoteResp,
  TwitchEmotes,
} from "./emote_types";

export type EmoteMap = Map<string, BaseEmote>;
export class EmoteApi {
  static async getTwitchEmotes(api: TwitchApi): Promise<EmoteMap> {
    const endpoint = "https://api.twitch.tv/kraken/chat/emoticon_images";
    try {
      //https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/1.0
      const emotes = await api.fetch<TwitchEmoteResp>(endpoint);
      if (!emotes.emoticon_sets.length) throw "No Twitch emotes were found";
      const m: EmoteMap = new Map();
      console.log(emotes);
      for (const [k, v] of Object.entries(emotes.emoticon_sets[0])) {
        m.set(v.code, {
          url: `https://static-cdn.jtvnw.net/emoticons/v2/${v.id}/default/dark/1.0`,
          word: v.code,
        });
      }
      return m;
    } catch (e) {
      throw new Error(e);
    }
  }
  static async getFrankerEmotes(id: number): Promise<FrankerEmote[]> {
    const endpoint = `https://api.betterttv.net/3/cached/frankerfacez/users/twitch/${id}`;
    try {
      const resp = await this.fetch<FrankerEmote[]>(endpoint);
      if (!resp.length) throw "No emotes found";
      return resp;
    } catch (e) {
      throw new Error(e);
    }
  }
  private static async fetch<T>(url: string) {
    try {
      const f = await fetch(url);
      const emotes = await f.json();
      return emotes as T;
    } catch (e) {
      throw new Error(e);
    }
  }
}
