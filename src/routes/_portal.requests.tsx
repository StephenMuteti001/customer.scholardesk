import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, CreditCard, MessagesSquare } from "lucide-react";
import { fetchOrders, acceptQuote, payOrder } from "@/lib/portal-data";
import { OPEN_STAGES } from "@/lib/portal-types";
import { EmptyState, OrderCard, OrderListSkeleton } from "@/components/portal/OrderList";
import { useSupportChat } from "@/components/portal/support-chat-context";

export const Route = createFileRoute("/_portal/requests")({
  head: () => ({
    meta: [
      { title: "Open requests | ScholarDesk Customer Portal" },
      {
        name: "description",
        content: "Briefs you've submitted that are waiting on a quote from the ScholarDesk team.",
      },
      { property: "og:title", content: "Open requests | ScholarDesk Customer Portal" },
      { property: "og:description", content: "Briefs waiting on a quote from the ScholarDesk team." },
    ],
  }),
  component: RequestsPage,
});

function RequestsPage() {
  const queryClient = useQueryClient();
  const { open } = useSupportChat();
  const { data, isLoading } = useQuery({ queryKey: ["orders"], queryFn: fetchOrders });

  const accept = useMutation({
    mutationFn: (orderId: string) => acceptQuote(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Quote accepted", { description: "Pay to convert this into an active order." });
    },
  });

  const pay = useMutation({
    mutationFn: (orderId: string) => payOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Payment received", { description: "We're matching a specialist for you now." });
    },
  });

  const requests = (data ?? []).filter((o) => OPEN_STAGES.includes(o.stage));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold">Open requests</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          These briefs are with our team for pricing. Nothing is charged until you accept a quotation, and the
          budget can always be discussed by chat or email before you commit.
        </p>
      </header>

      {isLoading ? (
        <OrderListSkeleton />
      ) : requests.length === 0 ? (
        <EmptyState
          title="No open requests"
          body="Every brief you've sent has been quoted and converted. Send a new brief to get a quotation, usually within 30 minutes."
          action={
            <Link
              to="/new-request"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Request a quote
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {requests.map((order) => (
            <div key={order.id} className="space-y-0">
              <OrderCard
                order={order}
                footer={
                  <>
                    <button
                      type="button"
                      onClick={() => open(order.chatId ?? undefined)}
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-accent"
                    >
                      <MessagesSquare className="size-3.5" /> Discuss the budget
                    </button>
                    {order.stage === "quote_sent" && (
                      <button
                        type="button"
                        disabled={accept.isPending}
                        onClick={() => accept.mutate(order.id)}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                      >
                        <CheckCircle2 className="size-3.5" /> Accept quote
                      </button>
                    )}
                    {order.stage === "awaiting_payment" && (
                      <button
                        type="button"
                        disabled={pay.isPending}
                        onClick={() => pay.mutate(order.id)}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                      >
                        <CreditCard className="size-3.5" /> Pay {order.quote?.currency} {order.quote?.amount}
                      </button>
                    )}
                    <Link
                      to="/orders/$orderId"
                      params={{ orderId: order.id }}
                      className="inline-flex items-center rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-accent"
                    >
                      View brief
                    </Link>
                  </>
                }
              />
              {order.quote && order.stage === "quote_sent" && (
                <div className="mx-1 -mt-1 rounded-b-xl border border-t-0 border-gold/40 bg-gold/10 px-5 py-3 text-xs text-foreground">
                  <span className="font-semibold">Quote: {order.quote.currency} {order.quote.amount}</span> ·{" "}
                  {order.quote.deliverySchedule}
                  {order.quote.notes ? ` · ${order.quote.notes}` : ""}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
