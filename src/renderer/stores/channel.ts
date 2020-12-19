import { Commands, IrcMessage } from '../twitch_types/twitch_types';

export type Message = {
    author: string;
    message: string;
    directMsg: boolean;
};

export class Channel {
    messages: Message[] = [];
    joined: boolean = false;

    constructor(public key: string, private ws: WebSocket) {}

    join() {
        const joinMsg = `JOIN ${this.key}`;
        console.log(joinMsg);
        this.ws.send(joinMsg);
        this.joined = true;
    }
    part() {
        this.ws.send(`PART ${this.key}`);
        this.joined = false;
    }

    send(msg: string) {
        this.ws.send(`PRIVMSG ${this.key} :${msg}`);
    }
    handleMsg(irc: IrcMessage) {
        switch (irc.command) {
            case Commands.PRIVMSG:
                const msg: Message = {
                    author: irc.username,
                    message: irc.message,
                    directMsg: irc.directMsg
                };
                this.messages.push(msg);
                break;
            default:
                console.log(`${this.key}: ${irc.command}`);
        }
    }
}
