import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  Download,
  FileText,
  MessagesSquare,
  RotateCcw,
  ShieldCheck,
  Undo2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  acceptQuote,
  approveSubmission,
  cancelOrder,
  fetchOrder,
  payOrder,
  requestRefund,
  requestRevision,
} from "@/lib/portal-data";
import { PaymentBadge, StageBadge } from "@/components/portal/StatusBadge";
import { WorkflowTracker } from "@/components/portal/WorkflowTracker";
import { useSupportChat } from "@/components/portal/support-chat-context";
import { DetailPageSkeleton } from "@/components/portal/PageSkeletons";

export const Route = createFileRoute("/_portal/orders/$orderId")({
  head: ({ params }) => ({
    meta: [
      { title: `Order ${params.orderId} | ScholarDesk Customer Portal` },
      {
        name: "description",
        content: "Track your order stage, quote, payment, submissions and revision requests.",
      },
      { property: "og:title", content: `Order ${params.orderId} | ScholarDesk Customer Portal` },
      { property: "og:description", content: "Order stage, quote, payment, submissions and revisions." },
     { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { property: "og:image", content: "https://scholardesk.pro/brand/og-image.png" }, { name: "twitter:image", content: "https://scholardesk.pro/brand/og-image.png" }],
  }),
  component: OrderDetail,
});

function OrderDetail() {
  const { orderId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { open } = useSupportChat();

  const [revisionFor, setRevisionFor] = useState<string | null>(null);
  const [revisionNote, setRevisionNote] = useState("");
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrder(orderId),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  const accept = useMutation({
    mutationFn: () => acceptQuote(orderId),
    onSuccess: () => {
      refresh();
      toast.success("Quotation accepted. Pay to start production.");
    },
  });
  const pay = useMutation({
    mutationFn: () => payOrder(orderId),
    // Paystack hosts the payment page; the order is settled server-side
    // and confirmed on /payments/callback when the customer returns.
    onSuccess: ({ checkout }) => {
      const url = checkout.authorizationUrl;
      if (!url) {
        toast.error("We could not open the payment page. Please try again.");
        return;
      }
      window.location.assign(url);
    },
    onError: () => toast.error("We could not open the payment page. Please try again."),
  });
  const cancel = useMutation({
    mutationFn: () => cancelOrder(orderId, "Cancelled by client from the portal"),
    onSuccess: () => {
      refresh();
      toast.success("Order cancelled");
    },
  });
  const revise = useMutation({
    mutationFn: ({ submissionId, note }: { submissionId: string; note: string }) =>
      requestRevision(orderId, submissionId, note),
    onSuccess: () => {
      refresh();
      setRevisionFor(null);
      setRevisionNote("");
      toast.success("Rework requested", {
        description: "Our team has escalated this to your specialist.",
      });
    },
  });
  const approve = useMutation({
    mutationFn: (submissionId: string) => approveSubmission(orderId, submissionId),
    onSuccess: () => {
      refresh();
      toast.success("Submission approved and the order is now closed.");
    },
  });
  const refund = useMutation({
    mutationFn: (reason: string) => requestRefund(orderId, reason),
    onSuccess: () => {
      refresh();
      setRefundOpen(false);
      setRefundReason("");
      toast.success("Refund request sent", {
        description: "A support agent will reply within one business day.",
      });
    },
  });

  if (isLoading || !order) {
    return <DetailPageSkeleton />;
  }

  const isOpenRequest = order.stage === "quote_requested" || order.stage === "quote_sent";
  const canEdit = order.stage !== "completed" && order.stage !== "cancelled";

  return (
    <div className="space-y-6">
      <Link
        to={isOpenRequest ? "/requests" : "/orders"}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to {isOpenRequest ? "open requests" : "orders"}
      </Link>

      <header className="surface-panel p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground">
            {order.reference}
          </span>
          <StageBadge stage={order.stage} />
          <PaymentBadge status={order.paymentStatus} />
        </div>
        <h1 className="mt-3 font-display text-2xl font-semibold leading-snug text-balance-tight">{order.title}</h1>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Meta label="Subject" value={order.subject} />
          <Meta label="Type" value={order.assignmentType} />
          <Meta
            label="Length"
            value={order.wordCount > 0 ? `${order.wordCount.toLocaleString()} words` : `${order.pages} pages`}
          />
          <Meta label="Deadline" value={new Date(order.deadline).toLocaleString()} />
        </dl>

        <div className="mt-5 flex flex-wrap gap-2">
          {order.stage === "quote_sent" && order.quote?.issuedByRole !== "customer" && (
            <>
              <Action onClick={() => accept.mutate()} primary icon={CheckCircle2} label="Accept quote" />
              <Action onClick={() => open(order.chatId ?? undefined)} icon={MessagesSquare} label="Discuss budget with support" />
            </>
          )}
          {order.stage === "awaiting_payment" && (
            <Action
              onClick={() => pay.mutate()}
              primary
              icon={CreditCard}
              label={`Pay ${order.quote?.currency} ${order.quote?.amount}`}
            />
          )}
          <Action onClick={() => open(order.chatId ?? undefined)} icon={MessagesSquare} label="Message support" />
          {canEdit && (
            <Action
              onClick={() =>
                toast.info("Editing the brief", {
                  description:
                    "Support reviews every change. If the scope grows, an agent will start a chat to renegotiate the budget.",
                })
              }
              icon={FileText}
              label="Edit brief"
            />
          )}
          {canEdit && (
            <Action onClick={() => cancel.mutate()} icon={XCircle} label="Cancel order" destructive />
          )}
          {order.paymentStatus === "paid" && order.stage !== "completed" && (
            <Action onClick={() => setRefundOpen((v) => !v)} icon={Undo2} label="Request refund" />
          )}
        </div>

        {refundOpen && (
          <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4">
            <p className="text-sm font-semibold">Refund request</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Tell us what fell short. We first offer a free rework; if that isn't right for you, refunds are
              approved by the ScholarDesk team and returned to your original payment method within five to seven business
              days.
            </p>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              rows={3}
              placeholder="What went wrong?"
              className="mt-3 w-full rounded-lg border border-input bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={!refundReason.trim() || refund.isPending}
                onClick={() => refund.mutate(refundReason.trim())}
                className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
              >
                Submit request
              </button>
              <button
                type="button"
                onClick={() => setRefundOpen(false)}
                className="rounded-lg border border-border px-3 py-2 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {order.quote && (
            <section className="surface-panel border-gold/40 p-6">
              <div className="flex items-center gap-2">
                <BadgeCheck className="size-4 text-gold" />
                <h2 className="font-display text-base font-semibold">
                  {order.quote.issuedByRole === "customer"
                    ? "Your proposed amount"
                    : "Quote from the ScholarDesk team"}
                </h2>
              </div>
              <p className="mt-3 font-display text-3xl font-semibold">
                {order.quote.currency} {order.quote.amount}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{order.quote.deliverySchedule}</p>
              {order.quote.notes && <p className="mt-2 text-sm text-muted-foreground">{order.quote.notes}</p>}
              <p className="mt-3 text-xs text-muted-foreground">
                {order.quote.issuedByRole === "customer"
                  ? "Waiting on our support team to respond."
                  : "Not the right budget? Decline, propose a different amount, or reply in chat and our team can adjust the scope and re-quote."}
              </p>
            </section>
          )}

          <section className="surface-panel p-6">
            <h2 className="font-display text-base font-semibold">Submissions</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Each file is released only after our AI-content and plagiarism review.
            </p>

            {order.submissions.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No submissions yet. You'll be notified the moment work clears review.
              </div>
            ) : (
              <ul className="mt-4 space-y-4">
                {order.submissions.map((s) => (
                  <li key={s.id} className="rounded-xl border border-border p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-bold text-secondary-foreground">
                        v{s.version}
                      </span>
                      <p className="min-w-0 flex-1 truncate text-sm font-semibold">{s.title}</p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(s.submittedAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.summary}</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Metric label="AI content" value={`${s.aiScore}%`} good={s.aiScore < 10} />
                      <Metric label="Similarity" value={`${s.plagiarismScore}%`} good={s.plagiarismScore < 10} />
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-success/30 bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                        <ShieldCheck className="size-3.5" /> Review passed
                      </span>
                    </div>

                    <ul className="mt-3 space-y-2">
                      {s.files.map((f) => (
                        <li
                          key={f.id}
                          className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2"
                        >
                          <FileText className="size-4 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 flex-1 truncate text-sm">{f.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {(f.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                          <button
                            type="button"
                            onClick={() => toast.info("Download starting…")}
                            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-semibold hover:bg-accent"
                          >
                            <Download className="size-3.5" /> Download
                          </button>
                        </li>
                      ))}
                    </ul>

                    {s.revisionNote && (
                      <p className="mt-3 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-foreground">
                        <span className="font-semibold">Rework requested:</span> {s.revisionNote}
                      </p>
                    )}

                    {s.status === "delivered" && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => approve.mutate(s.id)}
                          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                        >
                          <CheckCircle2 className="size-3.5" /> Approve submission
                        </button>
                        <button
                          type="button"
                          onClick={() => setRevisionFor(revisionFor === s.id ? null : s.id)}
                          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-accent"
                        >
                          <RotateCcw className="size-3.5" /> Request rework
                        </button>
                      </div>
                    )}

                    {revisionFor === s.id && (
                      <div className="mt-3 rounded-xl border border-border bg-muted/40 p-3">
                        <label className="text-xs font-semibold" htmlFor={`rev-${s.id}`}>
                          What needs to change?
                        </label>
                        <textarea
                          id={`rev-${s.id}`}
                          rows={3}
                          value={revisionNote}
                          onChange={(e) => setRevisionNote(e.target.value)}
                          placeholder="Be specific: page numbers, sections, tutor feedback."
                          className="mt-2 w-full rounded-lg border border-input bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                        />
                        <button
                          type="button"
                          disabled={!revisionNote.trim() || revise.isPending}
                          onClick={() => revise.mutate({ submissionId: s.id, note: revisionNote.trim() })}
                          className="mt-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                        >
                          Send to ScholarDesk team
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="surface-panel p-6">
            <h2 className="font-display text-base font-semibold">Brief</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {order.instructions}
            </p>
            {order.files.length > 0 && (
              <ul className="mt-4 space-y-2">
                {order.files.map((f) => (
                  <li key={f.id} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm">
                    <FileText className="size-4 text-muted-foreground" /> {f.name}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="surface-panel p-6">
            <h2 className="font-display text-base font-semibold">Where your order is</h2>
            <div className="mt-4">
              <WorkflowTracker stage={order.stage} />
            </div>
          </section>

          <section className="surface-panel p-6">
            <h2 className="font-display text-base font-semibold">Activity</h2>
            <ul className="mt-4 space-y-4">
              {[...order.activity].reverse().map((a) => (
                <li key={a.id} className="flex gap-3">
                  <span
                    className={cn(
                      "mt-1.5 size-2 shrink-0 rounded-full",
                      a.actor === "customer" ? "bg-primary" : a.actor === "expert" ? "bg-gold" : "bg-success",
                    )}
                  />
                  <div>
                    <p className="text-sm font-medium">{a.title}</p>
                    {a.detail && <p className="text-xs text-muted-foreground">{a.detail}</p>}
                    <p className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                      {a.actor === "customer" ? "You" : a.actor === "expert" ? "Specialist" : "ScholarDesk"} ·{" "}
                      {new Date(a.at).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <button
            type="button"
            onClick={() => navigate({ to: "/new-request" })}
            className="w-full rounded-xl border border-dashed border-border p-4 text-sm font-semibold text-muted-foreground hover:border-primary/40 hover:text-foreground"
          >
            Submit another brief
          </button>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}

function Metric({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold",
        good ? "border-success/30 bg-success/10 text-success" : "border-warning/30 bg-warning/10 text-warning",
      )}
    >
      {label} {value}
    </span>
  );
}

function Action({
  label,
  icon: Icon,
  onClick,
  primary,
  destructive,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  primary?: boolean;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors",
        primary
          ? "bg-primary text-primary-foreground hover:opacity-90"
          : destructive
            ? "border border-destructive/40 text-destructive hover:bg-destructive/10"
            : "border border-border bg-card hover:bg-accent",
      )}
    >
      <Icon className="size-3.5" /> {label}
    </button>
  );
}
