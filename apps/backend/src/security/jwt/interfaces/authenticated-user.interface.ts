export interface AuthenticatedUser {
  userId: string;
  sessionId: string;
  email: string;
  roles: string[];
  permissions: string[];
}
