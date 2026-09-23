import { ShieldCheck, type LucideIcon } from "lucide-react";
import { RequestForm, type RequestVariant } from "@/components/forms/RequestForm";
import { WORKFLOW_STEPS } from "@/lib/portal-types";

export interface ServiceRequestPageProps {
  variant: RequestVariant;
  eyebrow: string;
  title: string;
  description: string;
  highlights: { icon: LucideIcon; title: string; detail: string }[];
}

export function ServiceRequestPage({
  variant,
  eyebrow,
  title,
  description,
  highlights,
}: ServiceRequestPageProps) {
  return (
    <div className="space-y-7">
      <section className="surface-panel p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
        <h1 className="mt-2 max-w-2xl font-display text-2xl font-semibold tracking-tight sm:text-[1.7rem]">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {highlights.map((h) => (
            <div key={h.title} className="rounded-xl border border-border bg-card p-4">
              <h.icon className="size-4 text-primary" />
              <p className="mt-2 text-sm font-semibold">{h.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{h.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-7 lg:grid-cols-[1.6fr_1fr]">
        <RequestForm variant={variant} />

        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <div className="surface-panel p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-success" />
              <p className="font-display text-sm font-semibold">No payment until you accept</p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              A member of the ScholarDesk team prices the work and sends you a quotation. The budget can be
              discussed in chat or by email before anything is charged.
            </p>
          </div>

          <div className="surface-panel p-6">
            <h2 className="font-display text-base font-semibold">What happens next</h2>
            <ol className="mt-4 space-y-4">
              {WORKFLOW_STEPS.slice(0, 6).map((step, i) => (
                <li key={step.stage} className="flex gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-secondary-foreground">
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
        </aside>
      </div>
    </div>
  );
}
