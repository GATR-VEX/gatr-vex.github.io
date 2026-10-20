/**
 * Designated club members who may sign in with Google.
 *
 * Prefer AUTH_MEMBER_EMAILS in the environment (comma-separated) so officers
 * can add Gmail addresses in Vercel without a code change. Values in
 * DEFAULT_MEMBER_EMAILS are always included as a fallback.
 */
const DEFAULT_MEMBER_EMAILS: readonly string[] = [
  "davis3lester@gmail.com",
  "cannon.cms@gmail.com",
  "logancthomley@gmail.com",
  "lizzie.marchand42@gmail.com",
  "jason.iduyan@gmail.com",
  "zander.d515@gmail.com",
  "monadoboy55@gmail.com",
  "jacobsabelli@gmail.com",
  "awestphal521@gmail.com",
  "dylan7lester@gmail.com",
];

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function emailsFromEnv(): string[] {
  const raw = process.env.AUTH_MEMBER_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => normalizeEmail(e))
    .filter(Boolean);
}

export function memberEmails(): string[] {
  const set = new Set<string>([
    ...DEFAULT_MEMBER_EMAILS.map(normalizeEmail),
    ...emailsFromEnv(),
  ]);
  return [...set];
}

export function isAllowedMember(email: string): boolean {
  const normalized = normalizeEmail(email);
  return memberEmails().includes(normalized);
}
