import { makeAutoObservable } from 'mobx';
import { Commands, SecureIrcUrl } from '../twitch_types/twitch_types';
import { msgParcer } from '../parser';
import { UserInfo } from './user_info_store';
import { Channel } from './channel';

type ChannelHub = Map<string, Channel>;

export class TwitchStore {
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
        if (!channelHub.has(channel) && this.ws) {
            const chan = new Channel(channel, this.ws);
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
    joinedSaved() {
        const s = localStorage.getItem('channels');
        if (!s || !this.ws) return;
        const channels = JSON.parse(s) as string[];
        for (const channel of channels) {
            if (this.channelHub.has(channel)) continue;
            const c = new Channel(channel, this.ws);
            c.join();
            this.channelHub.set(channel, c);
        }
    }
    init(info: UserInfo) {
        this.info = info;
        this.connect();
    }
    connect() {
        if (!this.info) throw new Error('Did not receive users info');
        const { token, username } = this.info;
        const ws = new WebSocket(SecureIrcUrl);
        ws.onopen = () => {
            ws.send(`PASS oauth:${token}`);
            ws.send(`NICK ${username}`);
        };

        ws.onmessage = msg => {
            const tmsg = msgParcer(msg.data, username);
            console.log(tmsg);
            if (!tmsg) return;
            switch (tmsg?.command) {
                case Commands.PING:
                    ws.send('PONG :tmi.twitch.tv');
                    break;
                case '001':
                    this.ws = ws;
                    this.joinedSaved();
                    console.log('connected');
                    break;
                case Commands.NOTICE:
                    if (tmsg.raw.includes('failed')) {
                        console.error('failed connecting to twitch');
                        this.error = tmsg.raw;
                        this.ws = null;
                    }
                    break;
                default:
                    const channel = this.channelHub.get(tmsg.channel);
                    console.log({ channel, tmsg });
                    if (channel) {
                        channel.handleMsg(tmsg);
                    }
            }
        };

        ws.onclose = () => {
            this.ws = null;
        };
    }
}
