export function getTwitchUrl(clientID: string, redirect: string) {
  return `https://id.twitch.tv/oauth2/authorize?client_id=${clientID}&redirect_uri=${redirect}&response_type=token&scope=chat:edit chat:read`;
}

export interface Deferred<T> extends Promise<T> {
  resolve: (value?: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

export function deferred<T>(): Deferred<T> {
  let methods;
  const promise = new Promise<T>((resolve, reject): void => {
    methods = { resolve, reject };
  });
  return Object.assign(promise, methods) as Deferred<T>;
}
