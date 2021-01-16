import { makeAutoObservable, reaction } from "mobx";

export type UserInfo = {
  token: string;
  username: string;
};
export class UserInfoStore {
  token: string | null;
  username: string | null;

  constructor() {
    this.token = localStorage.getItem("token");
    this.username = localStorage.getItem("username");
    makeAutoObservable(this);

    reaction(
      () => [this.token, this.username],
      ([token, username]) => {
        console.log("setting userInfo");
        if (!token && !username) {
          localStorage.clear();
        }
      }
    );
  }

  setToken(token: string) {
    localStorage.setItem("token", token);
    this.token = token;
  }
  setUsername(username: string) {
    username = username.toLowerCase();
    localStorage.setItem("username", username);
    this.username = username;
  }
  logout() {
    this.username = null;
    this.token = null;
  }
}
