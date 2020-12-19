import { makeAutoObservable } from 'mobx';
import { Client } from 'tmi.js';
import { Message } from './tc_store';

export class Channel {
    messages: Message[] = [];
    joined: boolean = false;
    error: string | null = null;
    constructor(public key: string, private client: Client) {
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
        this.messages = [m, ...this.messages];
    }
}
