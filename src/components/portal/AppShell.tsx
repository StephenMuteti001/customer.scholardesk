import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  FilePlus2,
  FileText,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  Library,
  LockKeyhole,
  ScanSearch,
  Timer,
  LifeBuoy,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme";
import { useSupportChat } from "./support-chat-context";
import { usePortalSession } from "@/components/access/portal-session";
import { authUrl } from "@/lib/auth-return";

const PRIVATE_ROUTES = new Set(["/", "/requests", "/orders", "/profile"]);

const NAV_GROUPS = [
  {
    label: "Workspace",
    items: [
      { to: "/", label: "Overview", icon: LayoutDashboard, exact: true },
      { to: "/requests", label: "Open requests", icon: Inbox },
      { to: "/orders", label: "Orders", icon: FileText },
      { to: "/new-request", label: "New request", icon: FilePlus2 },
    ],
  },
  {
    label: "Services",
    items: [
      { to: "/assignment-help", label: "Assignment help", icon: BookOpen },
      { to: "/class-help", label: "Class help", icon: GraduationCap },
      { to: "/exam-help", label: "Exam & interview", icon: Timer },
      { to: "/integrity", label: "AI & plagiarism", icon: ScanSearch },
      { to: "/exam-materials", label: "Exam materials", icon: Library },
    ],
  },
  {
    label: "Account",
    items: [{ to: "/profile", label: "Profile", icon: UserRound }],
  },
] as const;

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Overview", subtitle: "A summary of your requests, orders and deliveries" },
  "/requests": { title: "Open requests", subtitle: "Briefs awaiting a quotation from our team" },
  "/orders": { title: "Orders", subtitle: "Work in production, delivered and completed" },
  "/new-request": { title: "New request", subtitle: "Choose a service and send us your brief" },
  "/assignment-help": { title: "Assignment help", subtitle: "One task, one deadline, priced by our team" },
  "/class-help": { title: "Class help", subtitle: "Ongoing cover for a full course or term" },
  "/exam-help": { title: "Exam & interview", subtitle: "Scheduled support for timed sittings and interviews" },
  "/integrity": { title: "AI & plagiarism", subtitle: "Request a support-managed integrity quotation" },
  "/exam-materials": { title: "Exam materials", subtitle: "Past papers, question banks and revision packs" },
  "/profile": { title: "Profile", subtitle: "Your contact and institution details" },
};

function useCurrent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const entry =
    PAGE_TITLES[pathname] ??
    PAGE_TITLES[Object.keys(PAGE_TITLES).find((k) => k !== "/" && pathname.startsWith(k)) ?? "/"];
  return { pathname, ...entry };
}

function NavList({ pathname, signedIn, onNavigate }: { pathname: string; signedIn: boolean; onNavigate?: () => void }) {
  return (
    <div className="space-y-6">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {group.label}
          </p>
          <nav className="space-y-1">
            {group.items.map((item) => {
              const exact = "exact" in item && item.exact;
              const Icon = item.icon;
              const active = exact ? pathname === item.to : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onNavigate}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.9rem] transition-colors",
                    active
                      ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                      : "font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className={cn("size-[1.05rem]", active ? "text-sidebar-primary" : "opacity-80")} />
                  {item.label}
                  {!signedIn && PRIVATE_ROUTES.has(item.to) && <LockKeyhole className="ml-auto size-3.5 opacity-55" aria-label="Sign in required" />}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname, title, subtitle } = useCurrent();
  const { open } = useSupportChat();
  const { access } = usePortalSession();
  const signedIn = access === "allowed";
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    setMenu(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="sticky top-0 z-30 hidden h-screen w-[16.5rem] shrink-0 overflow-y-auto border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:block">
        <Brand />
        <div className="px-3 pb-2 pt-3">
          <NavList pathname={pathname} signedIn={signedIn} />
        </div>
        <SupportCard signedIn={signedIn} onOpen={() => signedIn ? open() : window.location.assign(authUrl("login"))} />
      </aside>

      {menu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMenu(false)}
            className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 flex w-[17rem] flex-col bg-sidebar text-sidebar-foreground shadow-panel">
            <div className="flex items-center justify-between pr-3">
              <Brand />
              <button
                type="button"
                onClick={() => setMenu(false)}
                className="rounded-lg p-2 text-sidebar-foreground hover:bg-sidebar-accent/60"
                aria-label="Close navigation"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-4">
              <NavList pathname={pathname} signedIn={signedIn} onNavigate={() => setMenu(false)} />
            </div>
              <SupportCard signedIn={signedIn}
              onOpen={() => {
                setMenu(false);
                if (signedIn) open();
                else window.location.assign(authUrl("login"));
              }}
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3.5 sm:px-8">
            <button
              type="button"
              onClick={() => setMenu(true)}
              className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="size-4" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-[1.05rem] font-semibold tracking-tight">{title}</h1>
              <p className="truncate text-[0.78rem] text-muted-foreground">{subtitle}</p>
            </div>
            <ThemeToggle />
            <Link
              to="/new-request"
              className="hidden items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:inline-flex"
            >
              <FilePlus2 className="size-4" /> New request
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-8 sm:py-9">{children}</main>

        <footer className="border-t border-border px-4 py-6 text-[0.78rem] text-muted-foreground sm:px-8">
          ScholarDesk. Every submission is screened for AI-generated content and plagiarism before it reaches you.
        </footer>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3 px-5 py-5">
      <img src="/scholardesk-mark.png" alt="ScholarDesk" className="size-9 object-contain" />
      <div className="leading-tight">
        <p className="font-display text-sm font-semibold">ScholarDesk</p>
        <p className="text-[0.72rem] text-muted-foreground">Customer portal</p>
      </div>
    </div>
  );
}

function SupportCard({ signedIn, onOpen }: { signedIn: boolean; onOpen: () => void }) {
  return (
    <div className="m-3 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-4">
      {/* <p className="text-sm font-semibold">Need a hand?</p>
      <p className="mt-1 text-[0.78rem] leading-relaxed text-muted-foreground">
        Our support team handles every conversation. You never deal with an expert directly.
      </p> */}
      <button
        type="button"
        onClick={onOpen}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sidebar-primary px-3 py-2 text-xs font-semibold text-sidebar-primary-foreground transition-opacity hover:opacity-90"
      >
        {signedIn ? <LifeBuoy className="size-3.5" /> : <LockKeyhole className="size-3.5" />} {signedIn ? "Message support" : "Sign in"}
      </button>
    </div>
  );
}
