import { makeAutoObservable } from 'mobx';
import { UserInfo } from './user_info_store';
import { Channel } from './channel';
import { ChatUserstate, Client } from 'tmi.js';

import { delay } from '../util';

type ChannelHub = Map<string, Channel>;

export type Message = {
    userData: ChatUserstate;
    message: string;
    directMsg: boolean;
};

export class TwitchStore {
    client: Client | null = null;
    ws: WebSocket | null = null;

    info: UserInfo | null = null;

    error: string | null = null;

    channelHub: ChannelHub = new Map();
    selected: string | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    joinChannel(channel: string) {
        const { channelHub } = this;
        channel = '#' + channel.toLowerCase();
        if (!channelHub.has(channel) && this.client) {
            const chan = new Channel(channel, this.client);
            chan.join();
            this.channelHub.set(channel, chan);
            this.setChannelsLS();
        }
        this.selected = channel;
    }
    partChannel(channel: string) {
        const chan = this.channelHub.get(channel);
        if (chan) {
            chan.part();
            this.channelHub.delete(channel);
            this.setChannelsLS();
        }
    }
    setChannelsLS() {
        const session: string[] = [];

        for (const key of this.channelHub.keys()) {
            session.push(key);
        }

        localStorage.setItem('channels', JSON.stringify(session));
    }
    async joinedSaved() {
        const s = localStorage.getItem('channels');
        if (!s || !this.client) return;
        const channels = JSON.parse(s) as string[];
        for (const channel of channels) {
            try {
                let c = this.channelHub.get(channel);
                if (c && !c.joined) {
                    await c.join();
                    return;
                }
                c = new Channel(channel, this.client);
                await c.join();
                this.channelHub.set(channel, c);
            } catch (_) {
            } finally {
                await delay(450);
            }
        }
    }
    init(info: UserInfo) {
        this.info = info;
        this.connect();
    }
    connect() {
        if (!this.info) throw new Error('Did not receive users info');
        const { token, username } = this.info;
        const client = Client({
            connection: {
                reconnect: true,
                secure: true
            },
            identity: {
                username,
                password: `oauth:${token}`
            }
        });
        client.connect();
        client.on('logon', () => {
            console.log('logged');
            this.client = client;
            this.joinedSaved();
        });
        client.on('message', (channel, tags, message, self) => {
            console.log(channel);
            const c = this.channelHub.get(channel);
            if (c) {
                const m: Message = { userData: tags, message, directMsg: self };
                c.handleMsg(m);
            }
        });
    }
}
