export const TwitchEndpoints = {
  follows: "https://api.twitch.tv/kraken/streams/followed",
  stream: "https://api.twitch.tv/kraken/streams/",
};

export class TwitchApi {
  private clientId: string = "asgecphfrtm5zx5gdykx22ogwtpvu5";

  constructor(public token: string, public username: string) {}

  async fetch<T>(url: string): Promise<T | null> {
    const { token, clientId } = this;

    const auth = "OAuth " + token;
    try {
      const fetchThis = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/vnd.twitchtv.v5+json",
          "Client-ID": clientId,
          Authorization: auth,
        },
      });
      const data = await fetchThis.json();
      return data;
    } catch (err) {
      console.log(`Error: ${err}`);
      return null;
    }
  }
}
