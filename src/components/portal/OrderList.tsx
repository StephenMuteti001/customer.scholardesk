import { Link } from "@tanstack/react-router";
import { CalendarClock, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentBadge, StageBadge } from "./StatusBadge";
import type { Order } from "@/lib/portal-types";

export function OrderListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="surface-panel p-5">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-28" />
          </div>
          <Skeleton className="mt-3 h-5 w-2/3" />
          <Skeleton className="mt-2 h-4 w-1/3" />
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function OrderCard({ order, footer }: { order: Order; footer?: React.ReactNode }) {
  return (
    <article className="surface-panel overflow-hidden transition-colors hover:border-primary/40">
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground">
            {order.reference}
          </span>
          <StageBadge stage={order.stage} />
          <PaymentBadge status={order.paymentStatus} />
          {order.quote && (
            <span className="ml-auto font-display text-sm font-semibold">
              {order.quote.currency} {order.quote.amount}
            </span>
          )}
        </div>

        <Link
          to="/orders/$orderId"
          params={{ orderId: order.id }}
          className="mt-3 block font-display text-lg font-semibold leading-snug hover:text-primary"
        >
          {order.title}
        </Link>

        <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <FileText className="size-3.5" />
            {order.subject} · {order.assignmentType}
          </div>
          <div className="flex items-center gap-1.5">
            <CalendarClock className="size-3.5" />
            Due {new Date(order.deadline).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
          </div>
          {order.wordCount > 0 && <div>{order.wordCount.toLocaleString()} words</div>}
          {order.citationStyle !== "None" && <div>{order.citationStyle}</div>}
        </dl>
      </div>

      {footer && <div className="flex flex-wrap gap-2 border-t border-border bg-muted/30 px-5 py-3">{footer}</div>}
    </article>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="surface-panel flex flex-col items-center gap-3 p-12 text-center">
      <FileText className="size-8 text-muted-foreground/50" />
      <p className="font-display text-base font-semibold">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{body}</p>
      {action}
    </div>
  );
}
