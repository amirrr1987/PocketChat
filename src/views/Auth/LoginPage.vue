<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-title>{{ t("auth.login") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen class="ion-padding">
      <ion-text class="ion-text-center">
        <h2>{{ t("auth.welcomeBack") }}</h2>
        <p class="ion-color-medium">{{ t("auth.signInToContinue") }}</p>
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
            type="password"
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
              :aria-label="t('auth.showHidePassword')"
            >
              <ion-icon
                slot="icon-only"
                :icon="eye"
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
      </ion-list>

      <ion-text color="danger" class="ion-text-center" v-if="errorMessage">
        <p class="ion-margin-top">{{ errorMessage }}</p>
      </ion-text>

      <ion-text class="ion-text-center ion-margin-top">
        <p>
          {{ t("auth.dontHaveAccount") }}
          <router-link to="/auth/register">
            {{ t("auth.signUp") }}
          </router-link>
        </p>
      </ion-text>

      <ion-button
        expand="block"
        :disabled="!isFormValid || isLoading"
        @click="handleLogin"
      >
        <ion-spinner v-if="isLoading" name="crescent" slot="start" />
        {{ t("auth.login") }}
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
import { person, lockClosed, eye } from "ionicons/icons";

const router = useRouter();
const { t } = useI18n();

const username = ref("");
const password = ref("");
const isLoading = ref(false);
const errorMessage = ref("");

const errors = ref({
  username: "",
  password: "",
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
  if (password.value.length < 6) {
    errors.value.password = t("auth.validation.passwordMinLength");
    return;
  }
  errors.value.password = "";
};

const isFormValid = computed(
  () =>
    !!username.value &&
    !!password.value &&
    !errors.value.username &&
    !errors.value.password
);

const handleLogin = async () => {
  validateUsername();
  validatePassword();
  if (!isFormValid.value) return;

  isLoading.value = true;
  errorMessage.value = "";

  try {
    await new Promise((r) => setTimeout(r, 1200));

    const toast = await toastController.create({
      message: t("auth.loginSuccess"),
      duration: 2000,
      color: "success",
    });
    toast.present();

    router.push("/chats");
  } catch (e: any) {
    errorMessage.value = t("auth.loginFailed");
  } finally {
    isLoading.value = false;
  }
};
</script>
