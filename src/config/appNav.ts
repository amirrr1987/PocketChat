import {
  people,
  chatbox,
  settings,
  logOut,
  person,
} from "ionicons/icons";

export interface AppMenuItem {
  type: "link" | "divider" | "logout";
  path?: string;
  labelKey?: string;
  icon?: typeof chatbox;
  tab?: string;
}

/** Side menu items (shared by MainLayout and BlankLayout). */
export const appMenuItems: AppMenuItem[] = [
  { type: "link", path: "/", labelKey: "nav.chats", icon: chatbox },
  { type: "link", path: "/contacts", labelKey: "nav.contacts", icon: people },
  { type: "link", path: "/app/settings", labelKey: "nav.settings", icon: settings },
  { type: "divider", labelKey: "nav.account" },
  { type: "link", path: "/app/profile", labelKey: "nav.profile", icon: person },
  { type: "logout", labelKey: "nav.logout", icon: logOut },
];

/** Bottom tab bar items (MainLayout only). */
export const appTabItems: AppMenuItem[] = [
  { type: "link", path: "/", labelKey: "nav.chats", icon: chatbox, tab: "chats" },
  { type: "link", path: "/contacts", labelKey: "nav.contacts", icon: people, tab: "contacts" },
];
