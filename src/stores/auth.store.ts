import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { useAuthApi } from "@/services/auth.api";
import { useUsersApi, type UserMeResponse } from "@/services/users.api";
import type { IUser } from "@/models/user.model";
import type { IAuthDto, IAuthResponse } from "@/models/auth.model";

const TOKEN_KEY = "chat_token";
const USER_KEY = "chat_user";

function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function getStoredUser(): IUser | null {
  try {
    const s = localStorage.getItem(USER_KEY);
    return s ? (JSON.parse(s) as IUser) : null;
  } catch {
    return null;
  }
}

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(getStoredToken());
  const user = ref<IUser | null>(getStoredUser());

  const isLoggedIn = computed(() => !!token.value && !!user.value);

  const api = useAuthApi();
  const usersApi = useUsersApi();

  function setAuth(newUser: IUser, newToken: string) {
    user.value = newUser;
    token.value = newToken;
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
  }

  function clearAuth() {
    user.value = null;
    token.value = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  async function loadUserData(): Promise<void> {
    if (!token.value) return;
    try {
      const userData = await usersApi.getMe();
      const userObj: IUser = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        avatarUrl: userData.avatarUrl || undefined,
        status: userData.status || 'offline',
        lastSeenAt: userData.lastSeenAt || undefined,
      };
      user.value = userObj;
      // Store plain object, not the ref
      localStorage.setItem(USER_KEY, JSON.stringify(userObj));
    } catch (error) {
      console.error("Failed to load user data:", error);
      // If loading fails, clear auth (token might be invalid)
      clearAuth();
    }
  }

  async function login(dto: IAuthDto): Promise<IAuthResponse> {
    const res = await api.login(dto);
    setAuth(res.user, res.accessToken);
    // Load full user data from /users/me
    await loadUserData();
    return res;
  }

  async function register(dto: IAuthDto & { email?: string }): Promise<IAuthResponse> {
    const res = await api.register(dto);
    setAuth(res.user, res.accessToken);
    // Load full user data from /users/me
    await loadUserData();
    return res;
  }

  async function logout() {
    try {
      await api.logout();
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      clearAuth();
    }
  }

  return {
    token,
    user,
    isLoggedIn,
    login,
    register,
    logout,
    setAuth,
    loadUserData,
  };
});
