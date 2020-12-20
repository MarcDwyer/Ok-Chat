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

export class TwitchStore {
    client: Client | null = null;
    ws: WebSocket | null = null;
    error: string | null = null;

    tabs: string[] = [];
    channelHub: ChannelHub = new Map();
    selected: Channel | undefined = undefined;

    constructor() {
        const ls = localStorage.getItem('tabs');
        if (ls) {
            this.tabs = JSON.parse(ls);
        }
        makeAutoObservable(this);
    }
    //Click same stream twice to test
    joinChannel(chanName: string) {
        if (!this.client) throw new Error('No client conn has been established');
        chanName = '#' + chanName.toLowerCase();
        let c = this.channelHub.get(chanName);
        if (!c) {
            const position = this.tabs.push(chanName) - 1;
            c = new Channel({ key: chanName, position, client: this.client });
            this.channelHub.set(chanName, c);
            this.setTabsLS();
        }
        if (!c.joined) c.join();
        this.selected = c;
    }
    partChannel(channel: string, index: number) {
        const chan = this.channelHub.get(channel);
        if (chan) {
            if (this.selected && this.selected.key === channel) {
                this.setNewSelected(index);
            }
            chan.part();
            this.channelHub.delete(channel);
        }
        this.tabs.splice(index, 1);
        this.setTabsLS();
    }
    setNewSelected(index: number) {
        let sel = this.tabs[index - 1] || this.tabs[index + 1];
        if (sel) {
            const channel = this.channelHub.get(sel);
            this.selected = channel;
        }
    }
    setTabsLS() {
        localStorage.setItem('tabs', JSON.stringify(this.tabs));
    }
    async joinTabs() {
        if (!this.client) return;
        await delay(1);
        let selected: Channel | undefined;
        this.tabs.forEach((tab, i) => {
            //@ts-ignore
            const c = new Channel({ key: tab, client: this.client, position: i });
            if (i === 0) selected = c;
            c.join();
            this.channelHub.set(tab, c);
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
                const m: Message = { userData: tags, message, self };
                c.handleMsg(m);
            }
        });
    }
}
