import { computed } from "vue";
import { getAuthToken, getAuthUser, type AuthUser } from "@/api/client";

export function useAuth() {
  const token = computed(() => getAuthToken());
  const user = computed<AuthUser | null>(() => getAuthUser());
  const isLoggedIn = computed(() => !!token.value);

  return { token, user, isLoggedIn };
}
