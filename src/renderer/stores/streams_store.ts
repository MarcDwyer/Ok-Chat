import { makeAutoObservable } from 'mobx';
import { StreamData, V5StreamersPayload } from '../twitch_types/twitch_api_types';
import { UserInfo } from './user_info_store';

export class StreamStore {
    info: UserInfo | null = null;
    streams: StreamData[] = [];

    private interval: NodeJS.Timeout | null = null;
    private clientId: string = 'asgecphfrtm5zx5gdykx22ogwtpvu5';

    constructor() {
        makeAutoObservable(this);
    }
    async getFollowers(info: UserInfo) {
        this.info = info;
        try {
            const follows = await this.fetchV5TwitchData<V5StreamersPayload>(
                `https://api.twitch.tv/kraken/streams/followed`
            );
            if (follows && follows.streams) {
                this.streams = [...follows.streams, ...this.streams];
            }
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
        } catch (e) {
            if (!this.interval) this.interval = setInterval(() => this.getFollowers(info), 5000);
        }
    }

    private async fetchV5TwitchData<T>(url: string): Promise<T | null> {
        if (!this.info) return null;
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
