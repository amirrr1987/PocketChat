export interface IUser {
  id: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  lastSeenAt?: string;
}
