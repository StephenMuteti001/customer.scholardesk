import { useState, type ReactNode } from "react";
import { API_BASE_URL } from "@/lib/api";
import { authUrl } from "@/lib/auth-return";
import { AccessCard } from "./AccessCard";
import { usePortalSession } from "./portal-session";

/** The API owns the session; no browser storage or UI state can grant access. */
export function PortalAccess({ children }: { children: ReactNode }) {
  const { access, checkAccess, email } = usePortalSession();
  const [switching, setSwitching] = useState(false);

  if (access === "allowed") return <>{children}</>;

  const switchAccount = async () => {
    setSwitching(true);
    const match = document.cookie.match(/(?:^|;\s*)csrf_access_token=([^;]+)/);
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: match?.[1] ? { "X-CSRF-TOKEN": decodeURIComponent(match[1]) } : {},
      });
    } catch {
      /* signing in again replaces the session */
    }
    window.location.assign(authUrl("login"));
  };

  return (
    <AccessCard
      state={access}
      portalLabel="Customer portal"
      accountNoun="customer"
      markSrc="/favicon-192.png"
      signInHref={authUrl("login")}
      register={{ href: authUrl("register"), label: "Create a free account" }}
      signedInAs={email}
      onRetry={() => void checkAccess()}
      onSwitchAccount={() => void switchAccount()}
      switching={switching}
      footer={
        <>
          Need help? Email{" "}
          <a className="font-semibold text-primary hover:underline" href="mailto:support@scholardesk.pro">
            support@scholardesk.pro
          </a>
        </>
      }
    />
  );
}
