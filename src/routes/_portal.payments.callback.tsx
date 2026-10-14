import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { verifyPayment } from "@/lib/portal-data";
import { Skeleton } from "@/components/ui/skeleton";

type Search = { reference?: string; trxref?: string };

export const Route = createFileRoute("/_portal/payments/callback")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    reference: typeof search["reference"] === "string" ? search["reference"] : undefined,
    trxref: typeof search["trxref"] === "string" ? search["trxref"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Payment status | ScholarDesk Customer Portal" },
      { name: "description", content: "Confirmation of your ScholarDesk payment." },
      { property: "og:title", content: "Payment status | ScholarDesk Customer Portal" },
      { property: "og:description", content: "Confirmation of your ScholarDesk payment." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaymentCallback,
});

function PaymentCallback() {
  const { reference, trxref } = Route.useSearch();
  const ref = reference ?? trxref ?? "";
  const queryClient = useQueryClient();

  const result = useQuery({
    queryKey: ["payment", ref],
    queryFn: () => verifyPayment(ref),
    enabled: ref.length > 0,
    retry: 2,
    // Paystack can report "pending" for a few seconds; poll briefly.
    refetchInterval: (query) =>
      query.state.data?.checkout.status === "pending" && query.state.dataUpdateCount < 6 ? 3000 : false,
  });

  const status = result.data?.checkout.status;

  useEffect(() => {
    if (status === "paid") {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      void queryClient.invalidateQueries({ queryKey: ["exam-materials"] });
    }
  }, [status, queryClient]);

  if (!ref) {
    return <Panel icon={XCircle} tone="text-destructive" title="Payment reference missing" body="We could not find a payment to confirm." />;
  }

  if (result.isPending) {
    return (
      <div className="surface-panel mx-auto max-w-lg space-y-3 p-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (result.isError || !result.data) {
    return <Panel icon={XCircle} tone="text-destructive" title="We could not confirm this payment" body="If you were charged, our team will reconcile it automatically. You can also contact support." />;
  }

  const { checkout, sourceType } = result.data;
  const nextLink =
    sourceType === "material" ? (
      <Link to="/exam-materials" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
        Go to exam materials
      </Link>
    ) : (
      <Link to="/orders/$orderId" params={{ orderId: checkout.orderId }} className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
        View your order
      </Link>
    );

  if (checkout.status === "paid") {
    return (
      <Panel
        icon={CheckCircle2}
        tone="text-success"
        title="Payment received"
        body={`${checkout.currency} ${checkout.amount.toFixed(2)} confirmed (ref ${checkout.reference}).`}
        action={nextLink}
      />
    );
  }

  if (checkout.status === "pending") {
    return <Panel icon={Clock} tone="text-muted-foreground" title="Payment processing" body="Paystack is still confirming this payment. This page updates automatically." action={nextLink} />;
  }

  return <Panel icon={XCircle} tone="text-destructive" title="Payment not completed" body="No money was taken. You can try again from your order." action={nextLink} />;
}

function Panel({
  icon: Icon,
  tone,
  title,
  body,
  action,
}: {
  icon: typeof CheckCircle2;
  tone: string;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="surface-panel mx-auto max-w-lg space-y-3 p-6 text-center">
      <Icon className={`mx-auto size-10 ${tone}`} />
      <h1 className="font-display text-xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">{body}</p>
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
}
