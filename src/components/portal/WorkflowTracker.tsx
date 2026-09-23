import { Check, Circle, Dot } from "lucide-react";
import { cn } from "@/lib/utils";
import { WORKFLOW_STEPS, type OrderStage } from "@/lib/portal-types";

const ORDER: OrderStage[] = [
  "quote_requested",
  "quote_sent",
  "awaiting_payment",
  "matching_writer",
  "in_progress",
  "quality_review",
  "delivered",
  "completed",
];

function indexFor(stage: OrderStage) {
  if (stage === "revision_in_progress") return ORDER.indexOf("in_progress");
  if (stage === "cancelled") return -1;
  return ORDER.indexOf(stage);
}

export function WorkflowTracker({ stage, compact }: { stage: OrderStage; compact?: boolean }) {
  const current = indexFor(stage);

  return (
    <ol className={cn("relative space-y-0", compact && "space-y-0")}>
      {WORKFLOW_STEPS.map((step, i) => {
        const done = current > i;
        const active = current === i;
        return (
          <li key={step.stage} className="relative flex gap-4 pb-6 last:pb-0">
            {i < WORKFLOW_STEPS.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[13px] top-7 h-[calc(100%-1.25rem)] w-px",
                  done ? "bg-primary/60" : "bg-border",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                done && "border-primary bg-primary text-primary-foreground",
                active && "border-primary bg-primary/12 text-primary ring-4 ring-primary/12",
                !done && !active && "border-border bg-card text-muted-foreground",
              )}
            >
              {done ? <Check className="size-3.5" /> : active ? <Dot className="size-5" /> : <Circle className="size-2.5" />}
            </span>
            <div className="min-w-0 pt-0.5">
              <p
                className={cn(
                  "text-sm font-semibold",
                  active ? "text-foreground" : done ? "text-foreground/80" : "text-muted-foreground",
                )}
              >
                {step.title}
                {active && (
                  <span className="ml-2 rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                    Now
                  </span>
                )}
              </p>
              {!compact && (
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
