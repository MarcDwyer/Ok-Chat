import { TwitchApi } from "../../twitch_api";
import {
  BaseEmote,
  FrankerEmote,
  GlobalBttvEmotes,
  TwitchEmoteResp,
} from "./emote_types";

export type EmoteMap = Map<string, BaseEmote>;

export class EmoteApi {
  static async getTwitchEmotes(api: TwitchApi): Promise<EmoteMap> {
    const endpoint = "https://api.twitch.tv/kraken/chat/emoticon_images";
    try {
      //https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/1.0
      //cached/emotes/global
      const emotes = await api.fetch<TwitchEmoteResp>(endpoint);
      if (!emotes.emoticon_sets.length) throw "No Twitch emotes were found";
      const m: EmoteMap = new Map();
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
  static async attachFrankEmotes(id: number, emotes: EmoteMap): Promise<void> {
    const endpoint = `https://api.betterttv.net/3/cached/frankerfacez/users/twitch/${id}`;
    try {
      const fEmotes = await this.fetch<FrankerEmote[]>(endpoint);
      if (!fEmotes.length) throw `No emotes found for ${id}`;
      for (const emote of fEmotes) {
        const be: BaseEmote = {
          url: emote.images["1x"],
          word: emote.code,
        };
        emotes.set(emote.code, be);
      }
    } catch (e) {
      console.log(e);
    }
  }
  static async attachBttvGlobalEmotes(m: EmoteMap) {
    // https://cdn.betterttv.net/emote/56f5be00d48006ba34f530a4/1x
    const endpoint = "https://api.betterttv.net/3/cached/emotes/global";
    const gEmotes = await this.fetch<GlobalBttvEmotes[]>(endpoint);
    if (!gEmotes.length || "error" in gEmotes) {
      throw new Error("No BTTV global emotes found");
    }
    for (const emote of gEmotes) {
      const baseEmote: BaseEmote = {
        url: `https://cdn.betterttv.net/emote/${emote.id}/1x`,
        word: emote.code,
      };
      m.set(emote.code, baseEmote);
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
