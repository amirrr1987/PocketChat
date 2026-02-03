<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button menu="main-menu"></ion-menu-button>
        </ion-buttons>
        <ion-title>{{ t("settings.title") }}</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" size="default" @click="navigateTo('/')">
            <!-- if rtl arrowForward if ltr arrowBack -->
            <ion-icon
              :icon="currentLocale === 'fa' ? arrowBack : arrowForward"
              slot="icon-only"
            ></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ t("settings.title") }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <!-- User Avatar Section -->
      <div class="settings-header">
        <ion-avatar class="settings-avatar">
          <img
            src="https://placehold.co/80x80/4285f4/ffffff?text=JD"
            alt="User"
          />
        </ion-avatar>
        <h3 class="settings-user-name">John Doe</h3>
        <p class="settings-user-email">john.doe@example.com</p>
      </div>

      <ion-list>
        <!-- Language Section -->
        <ion-list-header>
          <ion-label>
            <h2>{{ t("settings.language") }}</h2>
            <p>{{ t("settings.languageDescription") }}</p>
          </ion-label>
        </ion-list-header>

        <ion-item>
          <ion-label>
            <h3>{{ t("settings.persian") }}</h3>
            <p>فارسی</p>
          </ion-label>
          <ion-radio
            slot="end"
            :checked="currentLocale === 'fa'"
            value="fa"
            @click="changeLanguage('fa')"
          ></ion-radio>
        </ion-item>

        <ion-item>
          <ion-label>
            <h3>{{ t("settings.english") }}</h3>
            <p>English</p>
          </ion-label>
          <ion-radio
            slot="end"
            :checked="currentLocale === 'en'"
            value="en"
            @click="changeLanguage('en')"
          ></ion-radio>
        </ion-item>

        <!-- Divider -->
        <ion-item-divider>
          <ion-label>{{ t("settings.appearance") }}</ion-label>
        </ion-item-divider>

        <!-- Appearance Options -->
        <ion-item button :detail="false">
          <ion-icon :icon="moon" slot="start" color="primary"></ion-icon>
          <ion-label>
            <h3>{{ t("settings.darkMode") }}</h3>
            <p>{{ t("settings.darkModeDescription") }}</p>
          </ion-label>
          <ion-toggle
            slot="end"
            :checked="isDarkMode"
            @ionChange="toggleDarkMode"
          ></ion-toggle>
        </ion-item>

        <!-- Divider -->
        <ion-item-divider>
          <ion-label>{{ t("settings.notifications") }}</ion-label>
        </ion-item-divider>

        <!-- Notification Options -->
        <ion-item button :detail="false">
          <ion-icon
            :icon="notifications"
            slot="start"
            color="primary"
          ></ion-icon>
          <ion-label>
            <h3>{{ t("settings.pushNotifications") }}</h3>
            <p>{{ t("settings.pushNotificationsDescription") }}</p>
          </ion-label>
          <ion-toggle
            slot="end"
            :checked="pushNotifications"
            @ionChange="togglePushNotifications"
          ></ion-toggle>
        </ion-item>

        <ion-item button :detail="false">
          <ion-icon :icon="mail" slot="start" color="primary"></ion-icon>
          <ion-label>
            <h3>{{ t("settings.emailNotifications") }}</h3>
            <p>{{ t("settings.emailNotificationsDescription") }}</p>
          </ion-label>
          <ion-toggle
            slot="end"
            :checked="emailNotifications"
            @ionChange="toggleEmailNotifications"
          ></ion-toggle>
        </ion-item>

        <!-- Divider -->
        <ion-item-divider>
          <ion-label>{{ t("settings.privacy") }}</ion-label>
        </ion-item-divider>

        <!-- Privacy Options -->
        <ion-item button :detail="true" @click="openPrivacySettings">
          <ion-icon :icon="lockClosed" slot="start" color="primary"></ion-icon>
          <ion-label>
            <h3>{{ t("settings.privacySettings") }}</h3>
            <p>{{ t("settings.privacySettingsDescription") }}</p>
          </ion-label>
        </ion-item>

        <ion-item button :detail="true" @click="openBlockedContacts">
          <ion-icon :icon="ban" slot="start" color="primary"></ion-icon>
          <ion-label>
            <h3>{{ t("settings.blockedContacts") }}</h3>
            <p>{{ t("settings.blockedContactsDescription") }}</p>
          </ion-label>
        </ion-item>

        <!-- Divider -->
        <ion-item-divider>
          <ion-label>{{ t("settings.about") }}</ion-label>
        </ion-item-divider>

        <!-- About Section -->
        <ion-item button :detail="true" @click="openAbout">
          <ion-icon
            :icon="informationCircle"
            slot="start"
            color="primary"
          ></ion-icon>
          <ion-label>
            <h3>{{ t("settings.about") }}</h3>
            <p>{{ t("settings.aboutDescription") }}</p>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label>
            <h3>{{ t("settings.version") }}</h3>
            <p>0.0.1</p>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonMenuButton,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonRadio,
  IonToggle,
  IonItemDivider,
  IonIcon,
} from "@ionic/vue";
import {
  moon,
  notifications,
  mail,
  lockClosed,
  ban,
  informationCircle,
  arrowForward,
  arrowBack,
} from "ionicons/icons";
import { setLocale } from "@/i18n";
import { useDarkMode } from "@/composables/useDarkMode";
import { useRouter } from "vue-router";
const router = useRouter();
const { locale, t } = useI18n();
const { isDarkMode, toggleDarkMode: toggleDarkModeComposable } = useDarkMode();

const currentLocale = computed(() => locale.value);

const navigateTo = (path: string) => {
  router.push(path);
};

// Notification states
const pushNotifications = ref(true);
const emailNotifications = ref(false);

// Load saved preferences
onMounted(() => {
  const savedPushNotifications =
    localStorage.getItem("push-notifications") !== "false";
  pushNotifications.value = savedPushNotifications;

  const savedEmailNotifications =
    localStorage.getItem("email-notifications") === "true";
  emailNotifications.value = savedEmailNotifications;
});

const changeLanguage = (lang: "fa" | "en") => {
  setLocale(lang);
};

const toggleDarkMode = (event: CustomEvent) => {
  const checked = event.detail.checked;
  toggleDarkModeComposable(checked);
};

const togglePushNotifications = (event: CustomEvent) => {
  pushNotifications.value = event.detail.checked;
  localStorage.setItem("push-notifications", event.detail.checked.toString());
};

const toggleEmailNotifications = (event: CustomEvent) => {
  emailNotifications.value = event.detail.checked;
  localStorage.setItem("email-notifications", event.detail.checked.toString());
};

const openPrivacySettings = () => {
  // TODO: Navigate to privacy settings page
  console.log("Open privacy settings");
};

const openBlockedContacts = () => {
  // TODO: Navigate to blocked contacts page
  console.log("Open blocked contacts");
};

const openAbout = () => {
  // TODO: Show about modal or navigate to about page
  console.log("Open about");
};
</script>

<style scoped>
ion-list-header ion-label h2 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 4px;
}

ion-list-header ion-label p {
  font-size: 0.875rem;
  color: var(--ion-color-medium);
  margin: 0;
}

ion-item h3 {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 4px;
}

ion-item p {
  font-size: 0.875rem;
  color: var(--ion-color-medium);
  margin: 0;
}

ion-item-divider {
  margin-top: 16px;
}

ion-item-divider ion-label {
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.settings-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  background: var(--ion-background-color);
}

.settings-avatar {
  width: 80px;
  height: 80px;
  margin-bottom: 12px;
  border: 3px solid var(--ion-color-primary);
}

.settings-user-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: var(--ion-text-color);
}

.settings-user-email {
  font-size: 0.875rem;
  color: var(--ion-color-medium);
  margin: 0;
}
</style>
