import type { IUser } from "@/models/user.model";

export interface IAuthDto {
  username: string;
  password: string;
}

export interface IAuthResponse {
  user: IUser;
  accessToken: string;
}
