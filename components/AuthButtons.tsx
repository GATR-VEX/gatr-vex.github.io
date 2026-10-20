"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

/** Matches header nav theme; accent fill keeps it a clear CTA */
const btnClassName =
  "inline-flex items-center justify-center rounded-full bg-accent px-3.5 py-1.5 font-sans text-[12px] font-medium tracking-widest text-white hover:bg-accent-hover transition-colors min-w-[5.5rem] max-w-[7.5rem] truncate";

export function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <span className={`${btnClassName} opacity-40 pointer-events-none`} aria-hidden>
        …
      </span>
    );
  }

  if (session?.user) {
    return (
      <Link href="/members" className={btnClassName}>
        Portal
      </Link>
    );
  }

  return (
    <Link href="/signin" className={btnClassName}>
      Sign in
    </Link>
  );
}
