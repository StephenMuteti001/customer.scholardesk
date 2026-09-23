import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/portal/AppShell";

export const Route = createFileRoute("/_portal")({
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
