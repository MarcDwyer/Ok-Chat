import { makeAutoObservable } from 'mobx';
import { Client } from 'tmi.js';
import { Message } from './tc_store';

type ChannelData = {
    position: number;
    client: Client;
    key: string;
};
export class Channel {
    client: Client;
    key: string;
    position: number;

    messages: Message[] = [];
    joined: boolean = false;
    error: string | null = null;

    constructor({ client, position, key }: ChannelData) {
        this.client = client;
        this.position = position;
        this.key = key;
        makeAutoObservable(this);
    }

    async join() {
        console.log(`Joining ${this.key}`);
        try {
            await this.client.join(this.key);
            this.error = null;
            this.joined = true;
        } catch (e) {
            this.error = e;
            this.joined = false;
        }
    }
    part() {
        this.client.part(this.key).then(() => (this.joined = false));
        this.joined = false;
    }

    send(msg: string) {
        this.client.say(this.key, msg);
    }
    handleMsg(m: Message) {
        const limit = 250;
        let msgs = [...this.messages];
        if (msgs.length > limit) {
            console.log('limit hit');
            msgs.length = limit - 25;
        }
        this.messages = [m, ...msgs];
    }
}
