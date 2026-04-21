"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { setStoredUser } from "@/lib/auth";

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const userId = params.get("user_id");
    const displayName = params.get("display_name") ?? "User";
    const email = params.get("email") ?? "";

    if (userId) {
      const user = { id: userId, email, displayName };

      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(
          { type: "syncup-google-auth-success", payload: user },
          window.location.origin,
        );
        window.close();
        return;
      }

      setStoredUser(user);
      router.replace("/app/calendar");
    } else {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ type: "syncup-google-auth-error" }, window.location.origin);
        window.close();
        return;
      }

      router.replace("/?error=auth_failed");
    }
  }, [params, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-muted-foreground">Signing you in…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <p className="text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
