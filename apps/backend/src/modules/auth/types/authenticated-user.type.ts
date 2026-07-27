export type AuthenticatedUser = {
  userId: string;
  sessionId: string;
  roles: string[];
  permissions: string[];
  email: string;
};
