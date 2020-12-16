import { makeAutoObservable } from 'mobx';

export class TokenStore {
    token: string | null = null;
    constructor() {
        this.token = localStorage.getItem('token');
        makeAutoObservable(this);
    }
    setToken(token: string) {
        localStorage.setItem('token', token);
        this.token = token;
    }
}
