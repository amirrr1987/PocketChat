import { useHttp } from "@/composables/http.composable";

export interface UserMeResponse {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserDto {
  email?: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  profile: {
    displayName: string | null;
    avatarUrl: string | null;
  } | null;
}

export const useUsersApi = () => {
  const { instance } = useHttp();

  const getMe = async (): Promise<UserMeResponse> => {
    const { data } = await instance.get<UserMeResponse>("users/me");
    return data;
  };

  const getAll = async (): Promise<UserResponse[]> => {
    const { data } = await instance.get<UserResponse[]>("users");
    return data;
  };

  const updateMe = async (updateDto: UpdateUserDto): Promise<UserMeResponse> => {
    const { data } = await instance.patch<UserMeResponse>("users/me", updateDto);
    return data;
  };

  const changePassword = async (changePasswordDto: ChangePasswordDto): Promise<{ message: string }> => {
    const { data } = await instance.post<{ message: string }>("users/me/change-password", changePasswordDto);
    return data;
  };

  return { getMe, getAll, updateMe, changePassword };
};
