import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, ShieldCheck, University } from "lucide-react";
import { useSupportChat } from "@/components/portal/support-chat-context";

export const Route = createFileRoute("/_portal/profile")({
  head: () => ({
    meta: [
      { title: "Profile | ScholarDesk Customer Portal" },
      { name: "description", content: "Your contact details, billing preferences and account protections." },
      { property: "og:title", content: "Profile | ScholarDesk Customer Portal" },
      { property: "og:description", content: "Contact details, billing preferences and protections." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { open } = useSupportChat();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Keep your contact details current so quotes and deliveries reach you quickly.
        </p>
      </header>

      <section className="surface-panel p-6">
        <div className="flex items-center gap-4">
          <span className="flex size-14 items-center justify-center rounded-full bg-primary font-display text-lg font-semibold text-primary-foreground">
            JM
          </span>
          <div>
            <p className="font-display text-lg font-semibold">Jane Mwangi</p>
            <p className="text-sm text-muted-foreground">Customer since 2024 · 12 completed orders</p>
          </div>
        </div>

        <dl className="mt-6 grid gap-5 sm:grid-cols-2">
          <Row icon={Mail} label="Email" value="jane.mwangi@university.edu" />
          <Row icon={Phone} label="Phone" value="+254 700 000 000" />
          <Row icon={University} label="Institution" value="University of Nairobi" />
          <Row icon={ShieldCheck} label="Account protection" value="Two-factor authentication enabled" />
        </dl>
      </section>

      <section className="surface-panel p-6">
        <h2 className="font-display text-base font-semibold">Payments and refunds</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          There is no stored wallet balance. You pay per order once you accept a quote, and every payment is tied
          to a specific order reference. If a delivery falls short we start with a free rework; where that isn't
          right, the ScholarDesk team approves a refund to your original payment method within five to seven business days.
        </p>
        <button
          type="button"
          onClick={() => open()}
          className="mt-4 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-accent"
        >
          Ask support about billing
        </button>
      </section>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 text-muted-foreground" />
      <div>
        <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 text-sm font-medium">{value}</dd>
      </div>
    </div>
  );
}
