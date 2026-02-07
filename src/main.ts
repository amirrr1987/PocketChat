import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import { IonicVue } from "@ionic/vue";

/* Core CSS required for Ionic components to work properly */
import "@ionic/vue/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/vue/css/normalize.css";
import "@ionic/vue/css/structure.css";
import "@ionic/vue/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/vue/css/padding.css";
import "@ionic/vue/css/float-elements.css";
import "@ionic/vue/css/text-alignment.css";
import "@ionic/vue/css/text-transformation.css";
import "@ionic/vue/css/flex-utils.css";
import "@ionic/vue/css/display.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* @import '@ionic/vue/css/palettes/dark.always.css'; */
import "@ionic/vue/css/palettes/dark.class.css";
/* @import '@ionic/vue/css/palettes/dark.system.css'; */

/* Theme variables */
import "./theme/variables.css";
import "./assets/styles/main.css";
import * as Sentry from "@sentry/vue";
import { i18n } from "./i18n";
import { initializeDarkMode } from "./composables/useDarkMode";

// Initialize dark mode before app mounts
initializeDarkMode();

const app = createApp(App);
app.use(IonicVue);
app.use(router);

app.use(i18n);
// Sentry.init({
//   app,
//   dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
//   // Adds request headers and IP for users, for more info visit:
//   // https://docs.sentry.io/platforms/javascript/guides/vue/configuration/options/#sendDefaultPii
//   sendDefaultPii: true,
//   integrations: (integrations) =>
//     integrations.filter((integration) => integration.name !== "Vue"),
// });
router.isReady().then(() => {
  app.mount("#app");
});
