import { createI18n } from "vue-i18n";
import fa from "./fa";
import en from "./en";

// Get saved locale from localStorage or default to 'fa'
const savedLocaleRaw = localStorage.getItem("app-locale") || "fa";
const savedLocale: "fa" | "en" = savedLocaleRaw === "en" ? "en" : "fa";

export const i18n = createI18n({
  locale: savedLocale,
  fallbackLocale: "fa",
  legacy: false,
  messages: {
    fa,
    en,
  },
});

// Helper function to change language
export const setLocale = (locale: "fa" | "en") => {
  i18n.global.locale.value = locale;
  localStorage.setItem("app-locale", locale);
  document.documentElement.setAttribute("dir", locale === "fa" ? "rtl" : "ltr");
  document.documentElement.setAttribute("lang", locale);
};

// Set initial direction and lang attribute
document.documentElement.setAttribute(
  "dir",
  savedLocale === "fa" ? "rtl" : "ltr"
);
document.documentElement.setAttribute("lang", savedLocale);
