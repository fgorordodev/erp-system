export function normalizeEmail(email: string): string {
  const input = email;

  return input.trim().toLowerCase();
}
