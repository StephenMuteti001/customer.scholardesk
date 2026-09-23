import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { fetchOrdersByStatus, type OrderListStatus } from "@/lib/portal-data";
import { EmptyState, OrderCard, OrderListSkeleton } from "@/components/portal/OrderList";

export const Route = createFileRoute("/_portal/orders/")({
  head: () => ({
    meta: [
      { title: "Orders | ScholarDesk Customer Portal" },
      {
        name: "description",
        content: "Converted orders in production, delivered work and completed assignments.",
      },
      { property: "og:title", content: "Orders | ScholarDesk Customer Portal" },
      { property: "og:description", content: "Track converted orders, deliveries and payment status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrdersPage,
});

type Tab = OrderListStatus;

const TABS: { key: Tab; label: string }[] = [
  { key: "active", label: "In production" },
  { key: "delivered", label: "Delivered" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

function OrdersPage() {
  const [tab, setTab] = useState<Tab>("active");
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["orders", "status", tab],
    queryFn: () => fetchOrdersByStatus(tab),
  });
  const orders = data?.orders ?? [];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Orders</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Requests become orders once a quote is accepted and paid. Requests still awaiting a quote live under{" "}
            <Link to="/requests" className="font-semibold text-primary hover:underline">
              open requests
            </Link>
            .
          </p>
        </div>
      </header>

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1">
        {TABS.map((t) => {
          const count = data?.counts?.[t.key];
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors",
                tab === t.key
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              {count !== undefined && <span className="rounded-full bg-muted px-1.5 text-[11px]">{count}</span>}
            </button>
          );
        })}
      </div>

      {isLoading || isFetching ? (
        <OrderListSkeleton />
      ) : orders.length === 0 ? (
        <EmptyState title="Nothing here yet" body="Orders appear in this tab as they move through the workflow." />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              footer={
                <Link
                  to="/orders/$orderId"
                  params={{ orderId: order.id }}
                  className="inline-flex items-center rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                >
                  Open order
                </Link>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
