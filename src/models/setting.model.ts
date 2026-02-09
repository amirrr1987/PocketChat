export interface ISetting {
  id: string;
  userId: string;
  theme?: "light" | "dark";
  notificationsEnabled?: boolean;
}
