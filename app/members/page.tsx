import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MembersShell } from "@/components/MembersShell";

const PORTAL_LINKS = [
  {
    href: "/members/print-queue",
    label: "Print queue",
  },
] as const;

export default async function MembersPortalPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin?callbackUrl=/members");
  }

  return (
    <MembersShell title="Member portal">
      <ul className="divide-y divide-rule border-y border-rule max-w-md">
        {PORTAL_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex items-center justify-between py-4 text-ink hover:text-accent transition-colors"
            >
              <span className="font-medium">{link.label}</span>
              <span className="text-ink-muted" aria-hidden>
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </MembersShell>
  );
}
