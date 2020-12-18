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
        this.ws.send(`JOIN #${this.key}`);
        this.position = pos;
        this.joined = true;
    }
    part() {
        this.ws.send(`PART ${this.key}`);
        this.joined = false;
    }
}
