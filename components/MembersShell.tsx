import Link from "next/link";
import { signOut } from "@/auth";
import { SiteNav } from "@/components/SiteNav";
import { btnSecondary, pageMain } from "@/lib/ui";

type MembersShellProps = {
  title: string;
  children?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
};

export function MembersShell({
  title,
  children,
  backHref,
  backLabel = "Member portal",
}: MembersShellProps) {
  // Sign out only on the portal home — subpages use back navigation instead
  const showSignOut = !backHref;

  return (
    <div className="min-h-screen bg-white text-foreground w-full">
      <SiteNav />
      <main className={pageMain}>
        {backHref ? (
          <Link
            href={backHref}
            className="text-sm text-ink-muted hover:text-accent transition-colors"
          >
            ← {backLabel}
          </Link>
        ) : null}

        <div
          className={`flex items-center gap-6 ${
            backHref ? "mt-4" : "justify-between"
          } mb-10`}
        >
          <div className="page-title min-w-0 flex-1">
            <h1 className="title-text">{title}</h1>
          </div>
          {showSignOut ? (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
              className="shrink-0"
            >
              <button type="submit" className={btnSecondary}>
                Sign out
              </button>
            </form>
          ) : null}
        </div>

        {children}
      </main>
    </div>
  );
}
