import { makeAutoObservable } from 'mobx';
import { Commands, SecureIrcUrl } from '../twitch_types/twitch_types';
import { msgParcer } from '../parser';

export class TwitchChat {
    ws: WebSocket | null = null;

    token: string | null = null;
    username: string | null = null;

    constructor() {
        this.token = localStorage.getItem('token');
        makeAutoObservable(this);
    }
    setToken(token: string) {
        localStorage.setItem('token', token);
        this.token = token;
    }
    initWs() {
        if (!this.token || !this.username) return;
        const { token, username } = this;
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
                    }
                    break;
                default:
                    console.log('fell through default');
            }
        };
    }
}
