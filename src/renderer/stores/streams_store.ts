import { makeAutoObservable } from 'mobx';
import { StreamData, V5StreamersPayload } from '../twitch_types/twitch_api_types';
import { UserInfo } from './user_info_store';

export class StreamStore {
    info: UserInfo | null = null;
    followers: StreamData[] | null = null;
    error: string | null = null;

    private clientId: string = 'asgecphfrtm5zx5gdykx22ogwtpvu5';
    private refresh: number | null = null;

    constructor() {
        makeAutoObservable(this);
    }
    async getFollowers() {
        console.log('getting followers');
        const follows = await this.fetchV5TwitchData<V5StreamersPayload>(
            `https://api.twitch.tv/kraken/streams/followed`
        );
        if (follows && follows.streams) {
            this.followers = follows.streams;
        }
    }
    init(info: UserInfo) {
        this.info = info;
        this.getFollowers().catch(_ => setTimeout(() => this.getFollowers(), 5500));
        this.refresh = setInterval(() => {
            this.getFollowers();
        }, 60000 * 5);
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
