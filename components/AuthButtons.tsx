"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { btnPrimary } from "@/lib/ui";

/** Fixed width so the control doesn’t shift as label length changes */
const btnClassName = `${btnPrimary} min-w-[5.5rem] max-w-[7.5rem] truncate`;

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
