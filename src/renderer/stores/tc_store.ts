import { makeAutoObservable } from 'mobx';
import { Commands, SecureIrcUrl } from '../twitch_types/twitch_types';
import { msgParcer } from '../parser';
import { UserInfo } from './user_info_store';

export class TwitchStore {
    ws: WebSocket | null = null;

    info: UserInfo | null = null;

    error: string | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    initWs({ username, token }: UserInfo) {
        const ws = new WebSocket(SecureIrcUrl);
        ws.onopen = () => {
            ws.send(`PASS oauth:${token}`);
            ws.send(`NICK ${username}`);
            this.ws = ws;
        };

        ws.onmessage = msg => {
            const tmsg = msgParcer(msg.data, username);
            if (!tmsg) return;
            console.log(tmsg);
            switch (tmsg?.command) {
                case Commands.PING:
                    ws.send('PONG :tmi.twitch.tv');
                    break;
                case '001':
                    this.ws = ws;
                    break;
                case Commands.NOTICE:
                    if (tmsg.raw.includes('failed')) {
                        console.error('failed connecting to twitch');
                        this.error = tmsg.raw;
                        this.ws = null;
                    }
                    break;
                default:
                    console.log('fell through default');
            }
        };

        ws.onclose = () => {
            this.ws = null;
        };
    }
}
