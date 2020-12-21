import { makeAutoObservable } from 'mobx';
import { UserInfo } from './user_info_store';
import { Channel } from './channel';
import { ChatUserstate, Client } from 'tmi.js';
import { delay } from '../util';

type ChannelHub = Map<string, Channel>;

export type Message = {
    userData: ChatUserstate;
    message: string;
    self: boolean;
    isDirect?: boolean;
};

type Join = () => Promise<void>;

export class TwitchStore {
    client: Client | null = null;
    ws: WebSocket | null = null;
    error: string | null = null;

    channelHub: ChannelHub = new Map();
    selected: Channel | null = null;

    constructor() {
        makeAutoObservable(this);
    }
    joinChannel(chanName: string) {
        if (!this.client) throw new Error('No client conn has been established');
        chanName = '#' + chanName.toLowerCase();
        let c = this.channelHub.get(chanName);
        if (!c) {
            const position = this.channelHub.size;
            c = new Channel({ key: chanName, position, client: this.client });
            this.channelHub.set(chanName, c);
            this.setTabsLS();
        }
        if (!c.joined) c.join();
        this.selected = c;
    }
    partChannel(channel: Channel) {
        if (this.selected === channel) {
            this.setNewSelected(channel.position);
        }
        channel.part();
        this.channelHub.delete(channel.key);
        this.decPosition(channel.position);
        this.setTabsLS();
    }
    decPosition(start: number) {
        let notIt = 0;
        for (const chan of this.channelHub.values()) {
            if (notIt === start) {
                --chan.position;
            } else {
                ++notIt;
            }
        }
    }
    setNewSelected(index: number) {
        const tabs = this.tabs;
        const sel = tabs[index - 1] || tabs[index + 1];
        if (sel) {
            const channel = this.channelHub.get(sel);
            if (channel) this.selected = channel;
        }
    }
    setTabsLS() {
        localStorage.setItem('channels', JSON.stringify(this.tabs));
    }
    get tabs() {
        const result: string[] = [];
        result.length = this.channelHub.size;
        for (const [k, chan] of this.channelHub.entries()) {
            result[chan.position] = k;
        }
        return result;
    }
    async joinTabs() {
        if (!this.client) return;
        const ls = localStorage.getItem('channels');
        if (!ls) return;
        const channels: string[] = JSON.parse(ls);
        let selected: Channel | null = null;
        await delay(1);
        channels.forEach((channel, i) => {
            if (this.channelHub.has(channel) || !this.client) return;
            const c = new Channel({ key: channel, client: this.client, position: i });
            c.join();
            this.channelHub.set(channel, c);
            if (i === 0) selected = c;
        });
        this.selected = selected;
    }

    connect({ username, token }: UserInfo) {
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
            this.joinTabs();
        });
        client.on('message', (channel, tags, message, self) => {
            const c = this.channelHub.get(channel);
            if (c) {
                const isDirect = message.toLowerCase().includes(username);
                const m: Message = { userData: tags, message, self, isDirect };
                c.handleMsg(m);
            }
        });
    }
}
