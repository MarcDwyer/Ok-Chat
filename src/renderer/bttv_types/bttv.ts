
export type Emote = {
    code: string;
    id: number;
    imageType: string;
    images: {
        "1x": string;
        "2x": string;
        "4x": string;
    };
    user: {
        displayName: string;
        id: number;
        name: string;
    }
}

export class BTTV {
   static async getEmotes(id: number): Promise<Emote[]> {
        const endpoint = `https://api.betterttv.net/3/cached/frankerfacez/users/twitch/${id}`;
        try {
            const f = await fetch(endpoint);
            const resp: Emote[] = await f.json();
            if (!resp.length) throw "No emotes found"
            return resp;
        } catch(e) {
            throw new Error(e)
        }
    }    
}