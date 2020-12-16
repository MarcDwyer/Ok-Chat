import { BrowserWindow } from 'electron';

type AuthConfig = {
    parent: BrowserWindow;
    clientID: string;
    redirect: string;
};
export class AuthApp {
    url: string;

    private window: BrowserWindow | null = null;
    private parent: BrowserWindow | null;
    constructor({ clientID, parent, redirect }: AuthConfig) {
        this.parent = parent;
        this.url = `https://id.twitch.tv/oauth2/authorize?client_id=${clientID}&redirect_uri=${redirect}&response_type=token&scope=chat:edit chat:read`;
    }

    async getWindow() {
        this.window = new BrowserWindow({
            width: 600,
            height: 800,
            webPreferences: { nodeIntegration: false, contextIsolation: true },
            alwaysOnTop: true
        });

        await this.window.loadURL(this.url);
        return this.window;
    }
    reset() {
        if (this.window) {
            this.window.close();
            this.window = null;
        }
    }
}
