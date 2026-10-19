"use client";

import { Suspense, useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteNav } from "@/components/SiteNav";
import { btnPrimary, pageMain } from "@/lib/ui";

function SignInContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/members";
  const errorParam = searchParams.get("error");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  useEffect(() => {
    if (!errorParam) return;
    if (errorParam === "AccessDenied") {
      setError(
        "That Google account isn’t on the members list. Ask an officer to add your Gmail.",
      );
    } else {
      setError("Could not sign in with Google. Try again.");
    }
  }, [errorParam]);

  async function onGoogleSignIn() {
    setError(null);
    setSubmitting(true);
    await signIn("google", { callbackUrl });
  }

  return (
    <div className="max-w-sm">
      <div className="page-title mb-8">
        <h1 className="title-text">Sign in</h1>
      </div>

      <p className="text-sm text-ink-muted mb-6 leading-relaxed">
        Use a Google account that is on the club members list.
      </p>

      {error ? <p className="mb-6 text-sm text-red-600">{error}</p> : null}

      {status === "authenticated" ? (
        <p className="text-sm text-ink-muted">Redirecting…</p>
      ) : (
        <button
          type="button"
          onClick={() => void onGoogleSignIn()}
          disabled={submitting}
          className={`${btnPrimary} w-full disabled:opacity-50`}
        >
          {submitting ? "Redirecting…" : "Continue with Google"}
        </button>
      )}
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-white text-foreground w-full">
      <SiteNav />
      <main className={pageMain}>
        <Suspense fallback={null}>
          <SignInContent />
        </Suspense>
      </main>
    </div>
  );
}
