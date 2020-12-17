import { V5StreamersPayload } from '../twitch_types/twitch_api_types';
import { UserInfo } from './user_info_store';

export class StreamStore {
    info: UserInfo | null = null;
    private clientId: string = 'asgecphfrtm5zx5gdykx22ogwtpvu5';

    async getFollowers(): Promise<V5StreamersPayload> {
        const follows: V5StreamersPayload = await this.fetchV5TwitchData(
            `https://api.twitch.tv/kraken/streams/followed`
        );
        return follows;
    }

    async fetchV5TwitchData(url: string): Promise<any> {
        if (!this.info) return;
        const { token } = this.info;
        let auth = 'OAuth ' + token;
        try {
            const fetchThis = await fetch(url, {
                method: 'GET',
                headers: {
                    Accept: 'application/vnd.twitchtv.v5+json',
                    'Client-ID': this.clientId,
                    Authorization: auth
                }
            });
            const data = await fetchThis.json();
            return data;
        } catch (err) {
            console.log(`Error: ${err}`);
            return null;
        }
    }
}
