"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { StoredUser } from "@/lib/auth";
import { setStoredUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";

type GooglePopupLoginButtonProps = {
  label?: string;
  className?: string;
  fullWidth?: boolean;
  compact?: boolean;
};

type AuthSuccessMessage = {
  type: "syncup-google-auth-success";
  payload: StoredUser;
};

type AuthErrorMessage = {
  type: "syncup-google-auth-error";
};

type PopupMessage = AuthSuccessMessage | AuthErrorMessage;

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z"
      />
    </svg>
  );
}

export function GooglePopupLoginButton({
  label = "Continue with Google",
  className,
  fullWidth = false,
  compact = false,
}: GooglePopupLoginButtonProps) {
  const router = useRouter();
  const [isWorking, setIsWorking] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const buildPopupFeatures = () => {
    const width = 520;
    const height = 700;
    const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
    const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);

    return `popup=yes,width=${width},height=${height},left=${Math.round(left)},top=${Math.round(top)}`;
  };

  useEffect(() => {
    const onMessage = (event: MessageEvent<PopupMessage>) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === "syncup-google-auth-success") {
        setStoredUser(event.data.payload);
        setAuthError(null);
        setIsWorking(false);
        router.replace("/app/calendar");
      }

      if (event.data?.type === "syncup-google-auth-error") {
        setIsWorking(false);
        setAuthError("Sign-in failed. Please try again.");
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [router]);

  const handlePopupLogin = () => {
    const popupFeatures = buildPopupFeatures();
    const authWindow = window.open(
      `${env.apiBaseUrl}/auth/google/login`,
      "syncup-google-login",
      popupFeatures,
    );

    if (!authWindow) {
      setAuthError("Popup was blocked. Please allow popups and try again.");
      return;
    }

    setAuthError(null);
    setIsWorking(true);

    authWindow.focus();

    const closedCheck = window.setInterval(() => {
      if (authWindow.closed) {
        window.clearInterval(closedCheck);
        setIsWorking(false);
      }
    }, 400);
  };

  return (
    <div className={cn(fullWidth ? "w-full" : "", className)}>
      <button
        type="button"
        onClick={handlePopupLogin}
        disabled={isWorking}
        className={cn(
          "group inline-flex items-center justify-center gap-3 rounded-full border border-slate-300/80 bg-white px-5 font-semibold text-slate-900 shadow-[0_14px_35px_-24px_rgba(2,6,23,0.75)] transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70",
          compact ? "py-3 text-sm" : "py-3.5 text-sm",
          fullWidth ? "w-full" : "",
        )}
      >
        <GoogleIcon />
        <span>{isWorking ? "Waiting for Google..." : label}</span>
      </button>
      {authError ? <p className="mt-2 text-sm text-destructive">{authError}</p> : null}
    </div>
  );
}
