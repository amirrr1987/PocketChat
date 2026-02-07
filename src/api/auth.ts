import {
  apiPost,
  setAuthToken,
  clearAuthToken,
  setAuthUser,
  clearAuthUser,
  type ApiError,
} from "./client";

export type LoginPayload = { username: string; password: string };
export type RegisterPayload = { username: string; password: string };

export type AuthUser = { id: string; username: string };
export type LoginResponse = { access_token: string; user: AuthUser };

export async function login(
  payload: LoginPayload
): Promise<LoginResponse> {
  const res = await apiPost<LoginResponse>("/auth/login", payload);
  setAuthToken(res.access_token);
  setAuthUser(res.user);
  return res;
}

export async function register(payload: RegisterPayload): Promise<void> {
  await apiPost<void>("/auth/register", payload);
}

export function logout(): void {
  clearAuthToken();
  clearAuthUser();
}

export function isApiError(e: unknown): e is ApiError {
  return (
    typeof e === "object" &&
    e !== null &&
    "status" in e &&
    "message" in (e as ApiError)
  );
}
