import { ref, watch } from "vue";

const DARK_MODE_KEY = "dark-mode";
const DARK_CLASS = "ion-palette-dark"; // کلاس مورد نیاز Ionic

// Global dark mode state
const isDarkMode = ref(false);

// Apply dark mode to document
// طبق مستندات Ionic: کلاس .ion-palette-dark باید به عنصر html اضافه شود
const applyDarkMode = (enabled: boolean) => {
  if (enabled) {
    document.documentElement.classList.add(DARK_CLASS);
  } else {
    document.documentElement.classList.remove(DARK_CLASS);
  }
};

// Initialize watch for dark mode changes
watch(
  isDarkMode,
  (newValue) => {
    applyDarkMode(newValue);
    localStorage.setItem(DARK_MODE_KEY, newValue.toString());
  },
  { immediate: false }
);

// Initialize dark mode from localStorage
export const initializeDarkMode = () => {
  const saved = localStorage.getItem(DARK_MODE_KEY);
  if (saved !== null) {
    isDarkMode.value = saved === "true";
  } else {
    // Default to system preference if no saved preference
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    isDarkMode.value = prefersDark;
    localStorage.setItem(DARK_MODE_KEY, prefersDark.toString());
  }

  // Apply immediately
  applyDarkMode(isDarkMode.value);
};

// Toggle dark mode
export const toggleDarkMode = (enabled?: boolean) => {
  if (enabled !== undefined) {
    isDarkMode.value = enabled;
  } else {
    isDarkMode.value = !isDarkMode.value;
  }
};

// Get current dark mode state
export const getDarkMode = () => isDarkMode.value;

// Export composable
export const useDarkMode = () => {
  return {
    isDarkMode,
    toggleDarkMode,
    getDarkMode,
  };
};
