export type JwtPayload = {
  sub: string;
  sessionId: string;
  email?: string;
};
