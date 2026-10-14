import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, FileText, Inbox, ShieldCheck, Wallet2 } from "lucide-react";
import { fetchOrders } from "@/lib/portal-data";
import { OPEN_STAGES, WORKFLOW_STEPS } from "@/lib/portal-types";
import { PaymentBadge, StageBadge } from "@/components/portal/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatGridSkeleton } from "@/components/portal/PageSkeletons";
import { useSupportChat } from "@/components/portal/support-chat-context";

export const Route = createFileRoute("/_portal/")({
  head: () => ({
    meta: [
      { title: "Overview | ScholarDesk Customer Portal" },
      {
        name: "description",
        content:
          "Track quote requests, active orders, payments and deliveries from the ScholarDesk team.",
      },
      { property: "og:title", content: "Overview | ScholarDesk Customer Portal" },
      {
        property: "og:description",
        content: "Track quote requests, active orders, payments and deliveries.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://scholardesk.pro/brand/og-image.png" },
      { name: "twitter:image", content: "https://scholardesk.pro/brand/og-image.png" },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { open } = useSupportChat();
  const { data: orders, isLoading } = useQuery({ queryKey: ["orders"], queryFn: fetchOrders });

  const openRequests = (orders ?? []).filter((o) => OPEN_STAGES.includes(o.stage));
  const activeOrders = (orders ?? []).filter(
    (o) => !OPEN_STAGES.includes(o.stage) && o.stage !== "completed" && o.stage !== "cancelled",
  );
  const awaitingPayment = (orders ?? []).filter((o) => o.paymentStatus === "unpaid" && !OPEN_STAGES.includes(o.stage));
  const needsAttention = (orders ?? []).filter((o) => o.stage === "delivered");

  return (
    <div className="space-y-8">
      <section className="surface-panel p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Welcome back</p>
        <h1 className="mt-2 max-w-2xl font-display text-2xl font-semibold tracking-tight text-balance-tight sm:text-[1.75rem]">
          Send the brief, receive a quotation from our team, approve when you are ready.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          No payment is taken until you accept a quotation. Every submission passes an AI-content and plagiarism
          review before it reaches you, and all communication runs through the ScholarDesk support team.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/new-request"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Request a quotation <ArrowRight className="size-4" />
          </Link>
          <button
            type="button"
            onClick={() => open()}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Talk to support
          </button>
        </div>
      </section>

      {isLoading ? <StatGridSkeleton /> : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Open requests" value={openRequests.length} hint="Awaiting or reviewing a quote" icon={Inbox} />
          <StatCard label="Active orders" value={activeOrders.length} hint="Paid and in production" icon={FileText} />
          <StatCard label="Awaiting payment" value={awaitingPayment.length} hint="Quote accepted, not yet paid" icon={Wallet2} />
          <StatCard label="Ready to review" value={needsAttention.length} hint="Delivered to you" icon={ShieldCheck} />
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
        <div className="surface-panel p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-base font-semibold">Needs your attention</h2>
            <Link to="/orders" className="text-xs font-semibold text-primary hover:underline">
              View all orders
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {isLoading ? (
              [0, 1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
            ) : (
              [...openRequests, ...needsAttention, ...awaitingPayment].slice(0, 4).map((order) => (
                <Link
                  key={order.id}
                  to="/orders/$orderId"
                  params={{ orderId: order.id }}
                  className="block rounded-xl border border-border p-4 transition-colors hover:border-primary/40 hover:bg-accent/30"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground">
                      {order.reference}
                    </span>
                    <StageBadge stage={order.stage} />
                    <PaymentBadge status={order.paymentStatus} />
                  </div>
                  <p className="mt-2 line-clamp-1 font-medium">{order.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {order.subject} · due {new Date(order.deadline).toLocaleDateString()}
                  </p>
                </Link>
              ))
            )}
            {!isLoading && openRequests.length + needsAttention.length + awaitingPayment.length === 0 && (
              <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Nothing waiting on you right now.
              </p>
            )}
          </div>
        </div>

        <div className="surface-panel p-5 sm:p-6">
          <h2 className="font-display text-base font-semibold">How every order works</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            You never deal with an expert. Our team matches, reviews and delivers.
          </p>
          <ol className="mt-4 space-y-3">
            {WORKFLOW_STEPS.map((step, i) => (
              <li key={step.stage} className="flex gap-3">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-secondary-foreground">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold">{step.title}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: number;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="surface-panel p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
