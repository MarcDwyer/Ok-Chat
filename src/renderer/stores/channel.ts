import { Commands, IrcMessage } from '../twitch_types/twitch_types';

export type Message = {
    author: string;
    message: string;
    directMsg: boolean;
};

export class Channel {
    messages: Message[] = [];
    joined: boolean = false;

    position: number = 0;

    constructor(public key: string, private ws: WebSocket) {}

    join(pos: number) {
        this.ws.send(`JOIN ${this.key}`);
        this.position = pos;
        this.joined = true;
    }
    part() {
        this.ws.send(`PART ${this.key}`);
        this.joined = false;
    }
    msg(msg: string) {
        console.log(`Channel: ${this.key}. Msg: ${msg}`);
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
