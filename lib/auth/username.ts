const USERNAME_PATTERN = /^[a-z0-9._-]{3,32}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_EMAIL_DOMAIN = "example.com";

/**
 * Supabase Auth signs in with email/password. New accounts are created from a
 * username and a synthetic address. Login also accepts a full email address so
 * administrators can use the underlying account email.
 */
export function usernameToEmail(input: string): string | null {
  const value = input.trim().toLowerCase();
  if (!value || !USERNAME_PATTERN.test(value)) return null;

  const domain = process.env.AUTH_EMAIL_DOMAIN ?? DEFAULT_EMAIL_DOMAIN;
  return `${value}@${domain}`;
}

export function loginIdentifierToEmail(input: string): string | null {
  const value = input.trim().toLowerCase();
  if (!value) return null;

  if (value.includes("@")) {
    return EMAIL_PATTERN.test(value) ? value : null;
  }

  return usernameToEmail(value);
}

export function displayUsername(user: {
  email?: string | null;
  app_metadata?: Record<string, unknown> | null;
  user_metadata?: Record<string, unknown> | null;
}): string {
  const metadataUsername =
    user.app_metadata?.username ?? user.user_metadata?.username;
  if (typeof metadataUsername === "string" && metadataUsername.trim()) {
    return metadataUsername.trim();
  }

  const email = user.email?.trim().toLowerCase();
  if (email?.includes("@")) {
    return email.split("@", 1)[0];
  }

  return "there";
}
