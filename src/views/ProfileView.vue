<template>
  <div class="p-4 space-y-6 max-w-2xl mx-auto overflow-y-auto h-full">
    <h1 class="text-xl font-semibold text-stone-800">Profile</h1>

    <div v-if="userData" class="space-y-6">
      <!-- Avatar Section -->
      <div class="flex items-center gap-4">
        <div class="relative">
          <img
            v-if="avatarUrl"
            :src="avatarUrl"
            alt="Avatar"
            class="w-20 h-20 rounded-full object-cover border-2 border-stone-200"
          />
          <div
            v-else
            class="w-20 h-20 rounded-full bg-stone-200 flex items-center justify-center text-stone-400 text-2xl font-semibold"
          >
            {{ userData.username.charAt(0).toUpperCase() }}
          </div>
        </div>
        <div class="flex-1">
          <h2 class="text-lg font-medium text-stone-800">
            {{ userData.displayName || userData.username }}
          </h2>
          <p class="text-sm text-stone-500">@{{ userData.username }}</p>
        </div>
      </div>

      <!-- Profile Information Section -->
      <div class="space-y-4 border-t border-stone-200 pt-6">
        <h3 class="text-md font-semibold text-stone-700">Profile Information</h3>

        <div>
          <label class="block text-sm text-stone-600 mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            class="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-800"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label class="block text-sm text-stone-600 mb-1">Username</label>
          <input
            v-model="username"
            type="text"
            class="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-800"
            placeholder="username"
          />
        </div>

        <div>
          <label class="block text-sm text-stone-600 mb-1">Display Name</label>
          <input
            v-model="displayName"
            type="text"
            class="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-800"
            placeholder="Your display name"
          />
        </div>

        <div>
          <label class="block text-sm text-stone-600 mb-1">Avatar URL</label>
          <input
            v-model="avatarUrl"
            type="url"
            class="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-800"
            placeholder="https://example.com/avatar.jpg"
          />
          <p class="text-xs text-stone-500 mt-1">Enter a URL for your avatar image</p>
        </div>

        <p v-if="profileMessage" class="text-sm" :class="profileMessageOk ? 'text-green-600' : 'text-red-600'">
          {{ profileMessage }}
        </p>

        <button
          type="button"
          class="rounded-lg bg-sky-600 text-white px-4 py-2 font-medium hover:bg-sky-700 disabled:opacity-50"
          :disabled="savingProfile"
          @click="saveProfile"
        >
          {{ savingProfile ? "Saving…" : "Save Profile" }}
        </button>
      </div>

      <!-- Change Password Section -->
      <div class="space-y-4 border-t border-stone-200 pt-6">
        <h3 class="text-md font-semibold text-stone-700">Change Password</h3>

        <div>
          <label class="block text-sm text-stone-600 mb-1">Current Password</label>
          <input
            v-model="currentPassword"
            type="password"
            class="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-800"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label class="block text-sm text-stone-600 mb-1">New Password</label>
          <input
            v-model="newPassword"
            type="password"
            class="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-800"
            placeholder="••••••••"
          />
          <p class="text-xs text-stone-500 mt-1">Minimum 8 characters</p>
        </div>

        <div>
          <label class="block text-sm text-stone-600 mb-1">Confirm New Password</label>
          <input
            v-model="confirmPassword"
            type="password"
            class="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-800"
            placeholder="••••••••"
          />
        </div>

        <p v-if="passwordMessage" class="text-sm" :class="passwordMessageOk ? 'text-green-600' : 'text-red-600'">
          {{ passwordMessage }}
        </p>

        <button
          type="button"
          class="rounded-lg bg-sky-600 text-white px-4 py-2 font-medium hover:bg-sky-700 disabled:opacity-50"
          :disabled="changingPassword || !canChangePassword"
          @click="changePassword"
        >
          {{ changingPassword ? "Changing…" : "Change Password" }}
        </button>
      </div>
    </div>
    <p v-else class="text-stone-500">Loading…</p>
  </div>
</template>
<script setup lang="ts">
import { ref,  onMounted, computed } from "vue";
import { useUsersApi, type UserMeResponse } from "@/services/users.api";
import { useAuthStore } from "@/stores/auth.store";

const usersApi = useUsersApi();
const authStore = useAuthStore();

const userData = ref<UserMeResponse | null>(null);
const loading = ref(false);

// Profile fields
const email = ref("");
const username = ref("");
const displayName = ref("");
const avatarUrl = ref("");

// Password fields
const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");

// Profile state
const savingProfile = ref(false);
const profileMessage = ref("");
const profileMessageOk = ref(false);

// Password state
const changingPassword = ref(false);
const passwordMessage = ref("");
const passwordMessageOk = ref(false);

const canChangePassword = computed(() => {
  return (
    currentPassword.value.length >= 8 &&
    newPassword.value.length >= 8 &&
    newPassword.value === confirmPassword.value
  );
});

async function loadUserData() {
  loading.value = true;
  try {
    userData.value = await usersApi.getMe();
    email.value = userData.value.email;
    username.value = userData.value.username;
    displayName.value = userData.value.displayName || "";
    avatarUrl.value = userData.value.avatarUrl || "";
  } catch (error) {
    console.error("Failed to load user data:", error);
    profileMessage.value = "Failed to load profile.";
    profileMessageOk.value = false;
  } finally {
    loading.value = false;
  }
}

async function saveProfile() {
  profileMessage.value = "";
  savingProfile.value = true;
  try {
    const updated = await usersApi.updateMe({
      email: email.value.trim() || undefined,
      username: username.value.trim() || undefined,
      displayName: displayName.value.trim() || undefined,
      avatarUrl: avatarUrl.value.trim() || undefined,
    });
    userData.value = updated;
    // Update auth store user data
    if (authStore.user) {
      authStore.user.username = updated.username;
      authStore.user.email = updated.email;
      authStore.user.avatarUrl = updated.avatarUrl || undefined;
    }
    profileMessage.value = "Profile saved successfully.";
    profileMessageOk.value = true;
    setTimeout(() => (profileMessage.value = ""), 3000);
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string | string[] } }; message?: string };
    const msg = err.response?.data?.message
      ? Array.isArray(err.response.data.message)
        ? err.response.data.message[0]
        : err.response.data.message
      : err.message ?? "Failed to save profile.";
    profileMessage.value = String(msg);
    profileMessageOk.value = false;
  } finally {
    savingProfile.value = false;
  }
}

async function changePassword() {
  if (!canChangePassword.value) return;

  passwordMessage.value = "";
  changingPassword.value = true;
  try {
    await usersApi.changePassword({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    });
    passwordMessage.value = "Password changed successfully.";
    passwordMessageOk.value = true;
    // Clear password fields
    currentPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";
    setTimeout(() => (passwordMessage.value = ""), 3000);
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string | string[] } }; message?: string };
    const msg = err.response?.data?.message
      ? Array.isArray(err.response.data.message)
        ? err.response.data.message[0]
        : err.response.data.message
      : err.message ?? "Failed to change password.";
    passwordMessage.value = String(msg);
    passwordMessageOk.value = false;
  } finally {
    changingPassword.value = false;
  }
}

onMounted(() => {
  loadUserData();
});
</script>
