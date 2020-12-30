import { GeneralColors } from "./general_colors";
import { Message } from "./stores/tc_store";

export function removeBreaks(s: string) {
  return s.replace(/(\r\n|\n|\r)/gm, "");
}

export interface Deferred<T> extends Promise<T> {
  resolve: (value?: T | PromiseLike<T>) => void;
  // deno-lint-ignore no-explicit-any
  reject: (reason?: any) => void;
}
/** Creates a Promise with the `reject` and `resolve` functions
 * placed as methods on the promise object itself. It allows you to do:
 *
 *     const p = deferred<number>();
 *     // ...
 *     p.resolve(42);
 */
export function deferred<T>(): Deferred<T> {
  let methods;
  const promise = new Promise<T>((resolve, reject): void => {
    methods = { resolve, reject };
  });
  return Object.assign(promise, methods) as Deferred<T>;
}

export function delay(ms: number): Promise<void> {
  return new Promise((res): number =>
    setTimeout((): void => {
      res();
    }, ms)
  );
}

export function checkKeybind(keys: string[]) {
  let closeKey = 0;
  const lookFor = {
    Control: true,
    w: true,
    W: true,
    Meta: true,
  };
  for (const key of keys) {
    if (key in lookFor) ++closeKey;
  }
  return closeKey >= 2;
}

export function isAlpha(s: string) {
  const reg = /^[a-z0-9]+$/i;
  return reg.test(s);
}
export function getMsgStyle(m: Message) {
  const result = {
    backgroundColor: "",
  };
  if (m.isDirect) {
    result.backgroundColor = GeneralColors.directMsg;
    return result;
  }
  if (m.self) {
    result.backgroundColor = GeneralColors.selfMsg;
  }
  if (m.userData.mod) {
    result.backgroundColor = GeneralColors.modMsg;
  }
  return result;
}

export const removeQuery = (piece: string, len: number) => {
  let a: string[] = piece.split("");

  a.splice(0, len);

  return a.join("");
};
