<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-title>{{ t("auth.register") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen class="ion-padding auth-content">
      <div class="auth-logo-container">
        <img src="/logo.svg" alt="Logo" class="auth-logo" />
      </div>
      <ion-text class="ion-text-center auth-header">
        <h2 class="auth-title">{{ t("auth.welcomeToApp") }}</h2>
        <p class="auth-subtitle">{{ t("auth.createAccountToContinue") }}</p>
      </ion-text>

      <ion-list>
        <ion-item class="ion-margin-top">
          <ion-input
            v-model="username"
            label-placement="stacked"
            :label="t('auth.username')"
            :placeholder="t('auth.enterUsername')"
            @blur="validateUsername"
          >
            <ion-icon slot="start" :icon="person" aria-hidden="true"></ion-icon>
          </ion-input>
        </ion-item>
        <ion-text
          v-if="errors.username"
          color="danger"
          class="ion-margin-start"
        >
          <p class="ion-margin-top ion-margin-bottom">{{ errors.username }}</p>
        </ion-text>

        <ion-item class="ion-margin-top">
          <ion-input
            v-model="password"
            label-placement="stacked"
            :label="t('auth.password')"
            :placeholder="t('auth.enterPassword')"
            :type="showPassword ? 'text' : 'password'"
            @blur="validatePassword"
          >
            <ion-icon
              slot="start"
              :icon="lockClosed"
              aria-hidden="true"
            ></ion-icon>
            <ion-button
              fill="clear"
              slot="end"
              type="button"
              :aria-label="t('auth.showHidePassword')"
              @click.prevent="showPassword = !showPassword"
            >
              <ion-icon
                slot="icon-only"
                :icon="showPassword ? eyeOff : eye"
                aria-hidden="true"
              ></ion-icon>
            </ion-button>
          </ion-input>
        </ion-item>
        <ion-text
          v-if="errors.password"
          color="danger"
          class="ion-margin-start"
        >
          <p class="ion-margin-top ion-margin-bottom">{{ errors.password }}</p>
        </ion-text>

        <ion-item class="ion-margin-top">
          <ion-input
            v-model="confirmPassword"
            label-placement="stacked"
            :label="t('auth.confirmPassword')"
            :placeholder="t('auth.enterConfirmPassword')"
            :type="showConfirmPassword ? 'text' : 'password'"
            @blur="validateConfirmPassword"
          >
            <ion-icon
              slot="start"
              :icon="lockClosed"
              aria-hidden="true"
            ></ion-icon>
            <ion-button
              fill="clear"
              slot="end"
              type="button"
              :aria-label="t('auth.showHidePassword')"
              @click.prevent="showConfirmPassword = !showConfirmPassword"
            >
              <ion-icon
                slot="icon-only"
                :icon="showConfirmPassword ? eyeOff : eye"
                aria-hidden="true"
              ></ion-icon>
            </ion-button>
          </ion-input>
        </ion-item>
        <ion-text
          v-if="errors.confirmPassword"
          color="danger"
          class="ion-margin-start"
        >
          <p class="ion-margin-top ion-margin-bottom">
            {{ errors.confirmPassword }}
          </p>
        </ion-text>
      </ion-list>

      <ion-text color="danger" class="ion-text-center" v-if="errorMessage">
        <p class="ion-margin-top">{{ errorMessage }}</p>
      </ion-text>

      <ion-text class="ion-text-center ion-margin-top">
        <p>
          {{ t("auth.alreadyHaveAccount") }}
          <router-link to="/auth/login"> {{ t("auth.signIn") }} </router-link>
        </p>
      </ion-text>

      <ion-button
        expand="block"
        :disabled="!isFormValid || isLoading"
        @click="handleRegister"
      >
        <ion-spinner v-if="isLoading" name="crescent" slot="start" />
        {{ t("auth.register") }}
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonList,
  IonText,
  IonIcon,
  IonSpinner,
  toastController,
} from "@ionic/vue";
import { person, lockClosed, eye, eyeOff } from "ionicons/icons";

const router = useRouter();
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const { t } = useI18n();

const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const isLoading = ref(false);
const errorMessage = ref("");

const errors = ref({
  username: "",
  password: "",
  confirmPassword: "",
});

const validateUsername = () => {
  if (!username.value) {
    errors.value.username = t("auth.validation.usernameRequired");
    return;
  }
  if (username.value.length < 3) {
    errors.value.username = t("auth.validation.usernameMinLength");
    return;
  }
  errors.value.username = "";
};

const validatePassword = () => {
  if (!password.value) {
    errors.value.password = t("auth.validation.passwordRequired");
    return;
  }
  if (password.value.length < 8) {
    errors.value.password = t("auth.validation.passwordMinLength");
    return;
  }
  errors.value.password = "";
  // Re-validate confirm password if it's already filled
  if (confirmPassword.value) {
    validateConfirmPassword();
  }
};

const validateConfirmPassword = () => {
  if (!confirmPassword.value) {
    errors.value.confirmPassword = t("auth.validation.confirmPasswordRequired");
    return;
  }
  if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = t("auth.validation.passwordsDoNotMatch");
    return;
  }
  errors.value.confirmPassword = "";
};

const isFormValid = computed(
  () =>
    !!username.value &&
    !!password.value &&
    !!confirmPassword.value &&
    !errors.value.username &&
    !errors.value.password &&
    !errors.value.confirmPassword
);

const handleRegister = async () => {
  validateUsername();
  validatePassword();
  validateConfirmPassword();
  if (!isFormValid.value) return;

  isLoading.value = true;
  errorMessage.value = "";

  try {
    const { register, login, isApiError } = await import("@/api/auth");
    await register({ username: username.value, password: password.value });
    await login({ username: username.value, password: password.value });

    const toast = await toastController.create({
      message: t("auth.registerSuccess"),
      duration: 2000,
      color: "success",
    });
    toast.present();

    router.push("/");
  } catch (e: unknown) {
    const { isApiError } = await import("@/api/auth");
    errorMessage.value = isApiError(e) && e.message ? e.message : t("auth.registerFailed");
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.auth-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100%;
  padding: 32px 24px;
}

.auth-logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.auth-logo {
  width: 80px;
  height: 80px;
}

.auth-header {
  margin-bottom: 32px;
}

.auth-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--ion-text-color);
}

.auth-subtitle {
  font-size: 1rem;
  color: var(--ion-color-medium);
  margin: 0;
}

ion-list {
  margin-bottom: 24px;
}

ion-button {
  margin-top: 16px;
  --padding-top: 14px;
  --padding-bottom: 14px;
  font-weight: 600;
}

ion-text p {
  margin: 8px 0;
}

ion-text a {
  color: var(--ion-color-primary);
  text-decoration: none;
  font-weight: 500;
}

ion-text a:hover {
  text-decoration: underline;
}
</style>
