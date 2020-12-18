import { makeAutoObservable } from 'mobx';
import { Commands, SecureIrcUrl } from '../twitch_types/twitch_types';
import { msgParcer } from '../parser';
import { UserInfo } from './user_info_store';
import { Channel } from './channel';

type ChannelHub = Record<string, Channel>;

export class TwitchStore {
    ws: WebSocket | null = null;

    info: UserInfo | null = null;

    error: string | null = null;

    channels: string[] = [];
    channelHub: ChannelHub = {};
    selected: string | null = null;

    constructor() {
        const channels = localStorage.getItem('channels');
        if (channels) {
            this.channels = JSON.parse(channels);
        }
        makeAutoObservable(this);
    }
    joinChannel(channel: string) {
        const { channelHub } = this;
        channel = '#' + channel.toLowerCase();
        if (!(channel in channelHub) && this.ws) {
            const chan = new Channel(channel, this.ws);
            this.channelHub[chan.key] = chan;
            const pos = this.channels.push(chan.key);
            chan.join(pos);
            this.setChannelsLS();
        }
    }
    partChannel(channel: string) {
        const chan = this.channelHub[channel] as Channel | undefined;
        if (chan) {
            chan.part();
            this.channels.splice(chan.position, 1);
            this.setChannelsLS();
            delete this.channelHub[channel];
        }
    }
    setChannelsLS() {
        localStorage.setItem('channels', JSON.stringify(this.channels));
    }
    joinedSaved() {
        if (this.channels.length && this.ws) {
            this.channels.forEach((channel, i) => {
                console.log(`Joining ${channel}`);
                const chan = new Channel(channel, this.ws as WebSocket);
                chan.join(i);
                this.channelHub[channel] = chan;
            });
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
            console.log(tmsg?.channel);
            if (!tmsg) return;
            switch (tmsg?.command) {
                case Commands.PING:
                    ws.send('PONG :tmi.twitch.tv');
                    break;
                case '001':
                    this.ws = ws;
                    this.joinedSaved();
                    break;
                case Commands.NOTICE:
                    if (tmsg.raw.includes('failed')) {
                        console.error('failed connecting to twitch');
                        this.error = tmsg.raw;
                        this.ws = null;
                    }
                    break;
                default:
                    const channel = this.channelHub[tmsg.channel] as Channel | undefined;
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
