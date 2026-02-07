/**
 * API client for backend (NestJS). Base URL in dev is '' (Vite proxy forwards /api to backend).
 */
const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";

const API_VERSION = "1";
const PREFIX = `${API_BASE}/api/v${API_VERSION}`;

export type ApiError = { status: number; message: string; details?: unknown };

export function getAuthToken(): string | null {
  return localStorage.getItem("access_token");
}

export function setAuthToken(token: string): void {
  localStorage.setItem("access_token", token);
}

export function clearAuthToken(): void {
  localStorage.removeItem("access_token");
}

const AUTH_USER_KEY = "auth_user";

export type AuthUser = { id: string; username: string };

export function getAuthUser(): AuthUser | null {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setAuthUser(user: AuthUser): void {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuthUser(): void {
  localStorage.removeItem(AUTH_USER_KEY);
}

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: res.statusText || "Request failed" };
  }

  if (!res.ok) {
    const err: ApiError = {
      status: res.status,
      message:
        (data && typeof data === "object" && "message" in data && typeof (data as { message: unknown }).message === "string")
          ? (data as { message: string }).message
          : res.statusText || "Request failed",
      details: data,
    };
    throw err;
  }

  return data as T;
}

export async function api<T>(
  path: string,
  options: RequestInit & { body?: object } = {}
): Promise<T> {
  const { body, ...rest } = options;
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  const fetchOptions: RequestInit = {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };
  const res = await fetch(`${PREFIX}${path}`, fetchOptions);
  return handleResponse<T>(res);
}

export const apiGet = <T>(path: string) =>
  api<T>(path, { method: "GET" });
export const apiPost = <T>(path: string, body?: object) =>
  api<T>(path, { method: "POST", body } as RequestInit & { body?: object });
export const apiPut = <T>(path: string, body?: object) =>
  api<T>(path, { method: "PUT", body } as RequestInit & { body?: object });
export const apiPatch = <T>(path: string, body?: object) =>
  api<T>(path, { method: "PATCH", body } as RequestInit & { body?: object });
export const apiDelete = <T>(path: string) =>
  api<T>(path, { method: "DELETE" });
