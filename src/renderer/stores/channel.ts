import { action, makeObservable, observable } from 'mobx';
import { nanoid } from 'nanoid';
import { Client } from 'tmi.js';
import { Message } from './tc_store';

type ChannelData = {
    position: number;
    client: Client;
    key: string;
};
export class Channel {
    id: string = nanoid(10);
    limit = 10;
    pause: boolean = false;
    snapshot: Message[] = [];

    key: string;
    position: number;

    messages: Message[] = [];
    joined: boolean = false;
    error: string | null = null;

    private client: Client;

    constructor({ client, position, key }: ChannelData) {
        this.client = client;
        this.position = position;
        this.key = key;
        makeObservable(this, {
            pause: observable,
            snapshot: observable,
            messages: observable,
            error: observable,
            joined: observable,
            position: observable,
            join: action,
            part: action,
            handleMsg: action,
            initPause: action,
            endPause: action
        });
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
    initPause() {
        this.pause = true;
        this.snapshot = [...this.messages];
    }
    endPause() {
        this.snapshot = [];
        this.pause = false;
    }
}
