import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { PortalAccess } from "@/components/access/PortalAccess";
import { PortalSessionProvider } from "@/components/access/portal-session";
import { AppShell } from "@/components/portal/AppShell";
import { SupportChatProvider } from "@/components/portal/SupportChatProvider";

const PUBLIC_ROUTES = new Set(["/exam-materials", "/assignment-help", "/class-help", "/exam-help", "/new-request", "/integrity"]);
function PortalLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const page = PUBLIC_ROUTES.has(pathname) ? <Outlet /> : <PortalAccess><Outlet /></PortalAccess>;
  // SupportChatWidget reads the portal session, so its provider must live
  // inside PortalSessionProvider (it cannot stay on the root route).
  return (
    <PortalSessionProvider>
      <SupportChatProvider>
        <AppShell>{page}</AppShell>
      </SupportChatProvider>
    </PortalSessionProvider>
  );
}
export const Route = createFileRoute("/_portal")({ component: PortalLayout });
