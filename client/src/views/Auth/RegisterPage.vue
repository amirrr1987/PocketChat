<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-title>Register</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen class="ion-padding">
      <ion-text class="ion-text-center">
        <h2>Welcome to our app</h2>
        <p class="ion-color-medium">Create an account to continue</p>
      </ion-text>

      <ion-list>
        <ion-item class="ion-margin-top">
          <ion-input
            label-placement="stacked"
            label="Username"
            placeholder="Enter your username"
          >
            <ion-icon slot="start" :icon="person" aria-hidden="true"></ion-icon>
          </ion-input>
        </ion-item>

        <ion-item class="ion-margin-top">
          <ion-input
            label-placement="stacked"
            label="Password"
            placeholder="Enter your password"
          >
            <ion-icon
              slot="start"
              :icon="lockClosed"
              aria-hidden="true"
            ></ion-icon>
            <ion-button fill="clear" slot="end" aria-label="Show/hide">
              <ion-icon
                slot="icon-only"
                :icon="eye"
                aria-hidden="true"
              ></ion-icon>
            </ion-button>
          </ion-input>
        </ion-item>
        <ion-item class="ion-margin-top">
          <ion-input
            label-placement="stacked"
            label="Confirm password"
            placeholder="Enter your confirm password"
          >
            <ion-icon
              slot="start"
              :icon="lockClosed"
              aria-hidden="true"
            ></ion-icon>
            <ion-button fill="clear" slot="end" aria-label="Show/hide">
              <ion-icon
                slot="icon-only"
                :icon="eye"
                aria-hidden="true"
              ></ion-icon>
            </ion-button>
          </ion-input>
        </ion-item>
      </ion-list>

      <ion-text color="danger" class="ion-text-center" v-if="errorMessage">
        <p class="ion-margin-top">{{ errorMessage }}</p>
      </ion-text>

      <ion-text class="ion-text-center ion-margin-top">
        <p>
          Already have an account?
          <router-link to="/auth/login"> Sign in </router-link>
        </p>
      </ion-text>

      <ion-button
        expand="block"
        :disabled="!isFormValid || isLoading"
        @click="handleLogin"
      >
        <ion-spinner v-if="isLoading" name="crescent" slot="start" />
        Register
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
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

const username = ref("");
const password = ref("");
const isLoading = ref(false);
const errorMessage = ref("");

const errors = ref({
  username: "",
  password: "",
});

const validateUsername = () => {
  if (!username.value) return (errors.value.username = "Username is required");
  if (username.value.length < 3)
    return (errors.value.username = "Minimum 3 characters");
  errors.value.username = "";
};

const validatePassword = () => {
  if (!password.value) return (errors.value.password = "Password is required");
  if (password.value.length < 6)
    return (errors.value.password = "Minimum 6 characters");
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
      message: "Login successful",
      duration: 2000,
      color: "success",
    });
    toast.present();

    router.push("/chats");
  } catch (e: any) {
    errorMessage.value = "Login failed";
  } finally {
    isLoading.value = false;
  }
};
</script>
