import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Library,
  ScanSearch,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { WORKFLOW_STEPS } from "@/lib/portal-types";

export const Route = createFileRoute("/_portal/new-request")({
  head: () => ({
    meta: [
      { title: "Start a new request | ScholarDesk Customer Portal" },
      {
        name: "description",
        content:
          "Choose a service and send your brief. The ScholarDesk team replies with a quotation and delivery plan, usually within 30 minutes.",
      },
      { property: "og:title", content: "Start a new request | ScholarDesk" },
      {
        property: "og:description",
        content: "Assignment help, class help, exam support, integrity reports and revision packs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
     { property: "og:image", content: "https://scholardesk.pro/brand/og-image.png" }, { name: "twitter:image", content: "https://scholardesk.pro/brand/og-image.png" }],
  }),
  component: NewRequest,
});

const SERVICES: {
  to: "/assignment-help" | "/class-help" | "/exam-help" | "/integrity" | "/exam-materials";
  label: string;
  icon: LucideIcon;
  detail: string;
  cta: string;
}[] = [
  {
    to: "/assignment-help",
    label: "Assignment help",
    icon: BookOpen,
    detail: "A single piece of work with a set deadline: essay, case study, problem set, lab report or code.",
    cta: "Request a quotation",
  },
  {
    to: "/class-help",
    label: "Class help",
    icon: GraduationCap,
    detail: "Ongoing cover across a course or term, including discussions, quizzes and weekly submissions.",
    cta: "Request a quotation",
  },
  {
    to: "/exam-help",
    label: "Exam and interview support",
    icon: Timer,
    detail: "Timed exams, tests, oral defences and interview rehearsals, booked to your scheduled window.",
    cta: "Check availability",
  },
  {
    to: "/integrity",
    label: "AI and plagiarism reports",
    icon: ScanSearch,
    detail: "Upload a draft and receive an AI content score and a similarity report with matched sources.",
    cta: "Upload a document",
  },
  {
    to: "/exam-materials",
    label: "Exam materials",
    icon: Library,
    detail: "Past papers, question banks, revision notes and model answers you can download immediately.",
    cta: "Browse the library",
  },
];

function NewRequest() {
  return (
    <div className="space-y-7">
      <section className="surface-panel p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">New request</p>
        <h1 className="mt-2 max-w-2xl font-display text-2xl font-semibold tracking-tight sm:text-[1.7rem]">
          Tell us what you need and our team will price it for you.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Choose the service that matches your task. Nothing is charged until you accept a quotation, and every
          conversation runs through the ScholarDesk support team.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SERVICES.map((service) => (
          <Link
            key={service.to}
            to={service.to}
            className="surface-panel group flex flex-col p-5 transition-colors hover:border-primary/50"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
              <service.icon className="size-4" />
            </span>
            <h2 className="mt-3 font-display text-[0.98rem] font-semibold">{service.label}</h2>
            <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">{service.detail}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
              {service.cta}
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </section>

      <section className="surface-panel p-6 sm:p-8">
        <h2 className="font-display text-base font-semibold">How your order progresses</h2>
        <ol className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {WORKFLOW_STEPS.slice(0, 8).map((step, i) => (
            <li key={step.stage} className="flex gap-3">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-secondary-foreground">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-semibold">{step.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
