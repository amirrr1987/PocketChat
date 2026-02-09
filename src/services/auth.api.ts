import { useHttp } from "@/composables/http.composable";
import type { IAuthDto, IAuthResponse } from "@/models/auth.model";

export const useAuthApi = () => {
  const { instance } = useHttp();

  const register = async (dto: IAuthDto & { email?: string }): Promise<IAuthResponse> => {
    const { data } = await instance.post<IAuthResponse>("auth/register", {
      username: dto.username,
      password: dto.password,
      email: dto.email,
    });
    return data;
  };

  const login = async (dto: IAuthDto): Promise<IAuthResponse> => {
    const { data } = await instance.post<IAuthResponse>("auth/login", {
      username: dto.username,
      password: dto.password,
    });
    return data;
  };

  const logout = async (): Promise<{ message: string }> => {
    const { data } = await instance.post<{ message: string }>("auth/logout");
    return data;
  };

  return { register, login, logout };
};
