export type FrankerEmote = {
  code: string;
  id: number;
  imageType: string;
  images: {
    "1x": string;
    "2x": string;
    "4x": string;
  };
  user: {
    displayName: string;
    id: number;
    name: string;
  };
};
export type TwitchEmotes = {
  _links: {
    self: string;
  };
  emoticons: Emoticon[];
};
export type Emoticon = {
  id: number;
  regex: string;
  images: {
    emoticon_set: number;
    height: number;
    width: number;
    url: string;
  };
};

export type TwitchEmoteResp = {
  emoticon_sets: {
    [id: string]: {
      code: string;
      id: number;
    }[];
  };
};

export type BaseEmote = {
  url: string;
  word: string;
};
