export interface AuthUser {
  userId: string;
  sessionId: string;
  email: string;
  roles: string[];
  permissions: string[];
}
