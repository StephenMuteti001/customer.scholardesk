import type { ReactNode } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authUrl } from "@/lib/auth-return";
import { usePortalSession } from "./portal-session";

/** The API owns the session; no browser storage or UI state can grant access. */
export function PortalAccess({ children }: { children: ReactNode }) {
  const { access, checkAccess } = usePortalSession();

  if (access === "allowed") return <>{children}</>;
  if (access === "checking") return <div aria-live="polite" className="flex min-h-[28rem] items-center justify-center text-muted-foreground">Checking access…</div>;

  const title = access === "sign-in" ? "Sign in required" : access === "wrong-account" ? "Access restricted" : "Unable to check access";
  const detail = access === "sign-in"
    ? "Please sign in to your ScholarDesk customer account to open this page."
    : access === "wrong-account"
      ? "This page requires a ScholarDesk customer account. If you use another account, switch accounts and try again."
      : "We could not verify your account right now. Check your connection and try again.";

  return (
    <div className="flex min-h-[28rem] items-center justify-center px-2 py-10">
      <section role="alert" aria-live="assertive" className="w-full max-w-md border-t-2 border-primary pt-8 text-foreground">
        <LockKeyhole aria-hidden="true" className="mb-5 size-9 text-primary" />
        <p className="mb-2 text-sm font-semibold text-primary">ScholarDesk · Customer portal</p>
        <h1 className="font-display text-2xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">{detail}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          {access !== "unavailable" && <Button asChild><a href={authUrl("login")}>Sign in</a></Button>}
          {access === "sign-in" && <Button variant="outline" asChild><a href={authUrl("register")}>Create account</a></Button>}
          <Button variant="outline" onClick={() => void checkAccess()}>Try again</Button>
        </div>
      </section>
    </div>
  );
}
