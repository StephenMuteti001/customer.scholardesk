import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowDownToLine,
  CloudUpload,
  FileText,
  MessagesSquare,
  ScanSearch,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchIntegrityReports, requestIntegrityQuote } from "@/lib/portal-data";
import type { IntegrityReport } from "@/lib/portal-types";
import { Skeleton } from "@/components/ui/skeleton";
import { useSupportChat } from "@/components/portal/support-chat-context";
import { usePortalSession } from "@/components/access/portal-session";
import { authUrl, clearRequestDraft, readRequestDraft, saveRequestDraft } from "@/lib/auth-return";

export const Route = createFileRoute("/_portal/integrity")({
  head: () => ({
    meta: [
      { title: "AI and plagiarism reports | ScholarDesk Customer Portal" },
      {
        name: "description",
        content:
          "Request a quotation for an AI-content report or plagiarism review managed by ScholarDesk support.",
      },
      { property: "og:title", content: "AI and plagiarism reports | ScholarDesk" },
      {
        property: "og:description",
        content: "Request a support-managed AI-content or plagiarism review and agree the budget by quotation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://scholardesk.pro/brand/og-image.png" },
      { name: "twitter:image", content: "https://scholardesk.pro/brand/og-image.png" },
    ],
  }),
  component: IntegrityPage,
});

function IntegrityPage() {
  const { open } = useSupportChat();
  const { access } = usePortalSession();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState(() => String(readRequestDraft("integrity")?.email ?? ""));
  const [dragging, setDragging] = useState(false);
  const [checks, setChecks] = useState({ ai: true, plagiarism: true });

  const { data, isLoading } = useQuery({ queryKey: ["integrity-reports"], queryFn: fetchIntegrityReports, enabled: access === "allowed" });

  const quoteRequest = useMutation({
    mutationFn: requestIntegrityQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setFile(null);
      clearRequestDraft("integrity");
      toast.success("Quote request sent", {
        description: "Support will review the document and discuss the budget with you before any checks begin.",
      });
    },
    onError: () => toast.error("We could not send that request. Please try again."),
  });

  const pick = (list: FileList | null) => {
    const first = list?.[0];
    if (!first) return;
    setFile(first);
  };

  const start = () => {
    if (!file) {
      toast.error("Add a document first");
      return;
    }
    if (!checks.ai && !checks.plagiarism) {
      toast.error("Select at least one report type");
      return;
    }
    if (!email.trim()) { toast.error("Add an email address first"); return; }
    if (access !== "allowed") {
      saveRequestDraft("integrity", { email, ai: checks.ai, plagiarism: checks.plagiarism, hadFiles: true });
      window.location.assign(authUrl("login"));
      return;
    }
    quoteRequest.mutate({ email: email.trim(), file, fileName: file.name, wordCount: Math.max(250, Math.round(file.size / 6)), checks });
  };

  return (
    <div className="space-y-7">
      <section className="surface-panel p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">AI and plagiarism</p>
        <h1 className="mt-2 max-w-2xl font-display text-2xl font-semibold tracking-tight sm:text-[1.7rem]">
          Ask our integrity desk to review your document.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Upload a draft for our support team to scope. We will send a quotation and agree the budget with you
          before specialists run the requested checks. Your documents are never added to a public database.
        </p>
      </section>

      <div className="grid gap-7 lg:grid-cols-[1fr_1.15fr]">
        <section className="surface-panel p-6">
          <h2 className="font-display text-base font-semibold">Upload a document</h2>
          <p className="mt-1 text-xs text-muted-foreground">PDF, DOCX or TXT, up to 25MB.</p>
          <label className="mt-5 block text-sm font-semibold" htmlFor="integrity-email">Delivery email</label>
          <input id="integrity-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-2 h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm outline-none focus:ring-2 focus:ring-ring/40" />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              pick(e.dataTransfer.files);
            }}
            className={cn(
              "mt-4 rounded-xl border border-dashed p-8 text-center transition-colors",
              dragging ? "border-primary bg-accent/40" : "border-border bg-muted/40",
            )}
          >
            <CloudUpload className="mx-auto size-6 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold">Drag and drop your document here</p>
            <p className="mt-1 text-xs text-muted-foreground">or</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-3 rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold transition-colors hover:bg-muted"
            >
              Browse files
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
              onChange={(e) => pick(e.target.files)}
            />
          </div>

          {file && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
              <FileText className="size-4 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-[0.7rem] text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                aria-label="Remove document"
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          )}

          <fieldset className="mt-5">
            <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Checks to quote
            </legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <CheckCard
                label="AI content report"
                detail="Probability that sections read as machine generated."
                checked={checks.ai}
                onChange={(v) => setChecks((c) => ({ ...c, ai: v }))}
              />
              <CheckCard
                label="Plagiarism report"
                detail="Similarity score with the matched sources listed."
                checked={checks.plagiarism}
                onChange={(v) => setChecks((c) => ({ ...c, plagiarism: v }))}
              />
            </div>
          </fieldset>

          <button
            type="button"
            onClick={start}
            disabled={quoteRequest.isPending}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {quoteRequest.isPending ? <span className="size-4 animate-pulse rounded-full bg-primary-foreground/50" /> : <ScanSearch className="size-4" />}
            {quoteRequest.isPending ? "Sending request" : access === "allowed" ? "Request a quotation" : "Sign in and continue"}
          </button>

          <p className="mt-3 flex items-center gap-2 text-[0.72rem] text-muted-foreground">
            <ShieldCheck className="size-3.5 text-success" />
            No check begins until you approve support's quotation.
          </p>
          <button type="button" onClick={() => access === "allowed" ? open() : window.location.assign(authUrl("login"))} className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline">
            <MessagesSquare className="size-3.5" /> Discuss the budget with support
          </button>
        </section>

        <section className="surface-panel p-6">
          <h2 className="font-display text-base font-semibold">Your reports</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Every document you have submitted, newest first.
          </p>

          <div className="mt-4 space-y-3">
            {access !== "allowed" ? (
              <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Sign in to see and track your reports.</p>
            ) : isLoading ? (
              [0, 1, 2].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
            ) : (data ?? []).length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No documents submitted yet.
              </p>
            ) : (
              (data ?? []).map((report) => <ReportCard key={report.id} report={report} />)
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function CheckCard({
  label,
  detail,
  checked,
  onChange,
}: {
  label: string;
  detail: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "cursor-pointer rounded-xl border p-4 transition-colors",
        checked ? "border-primary bg-accent/40" : "border-border bg-card hover:bg-muted",
      )}
    >
      <span className="flex items-center gap-2 text-sm font-semibold">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="size-4 accent-primary"
        />
        {label}
      </span>
      <span className="mt-1.5 block text-xs leading-relaxed text-muted-foreground">{detail}</span>
    </label>
  );
}

function ReportCard({ report }: { report: IntegrityReport }) {
  const ready = report.status === "ready";
  return (
    <article className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{report.fileName}</p>
          <p className="text-[0.72rem] text-muted-foreground">
            {report.wordCount.toLocaleString()} words, submitted{" "}
            {new Date(report.submittedAt).toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
            })}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-[0.68rem] font-semibold capitalize",
            ready
              ? "border-success/30 bg-success/12 text-success"
              : report.status === "failed"
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-info/30 bg-info/12 text-info",
          )}
        >
          {report.status}
        </span>
      </div>

      {ready ? (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ScoreBar label="AI content" value={report.aiScore ?? 0} />
            <ScoreBar label="Similarity" value={report.plagiarismScore ?? 0} />
          </div>
          {report.topMatches && report.topMatches.length > 0 && (
            <ul className="mt-3 space-y-1 text-[0.72rem] text-muted-foreground">
              {report.topMatches.map((m) => (
                <li key={m.source} className="flex items-center justify-between gap-3">
                  <span className="truncate">{m.source}</span>
                  <span className="font-semibold text-foreground">{m.overlap}%</span>
                </li>
              ))}
            </ul>
          )}
          <a
            href={report.reportUrl ?? "#"}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-xs font-semibold transition-colors hover:bg-muted"
          >
            <ArrowDownToLine className="size-3.5" /> Download full report
          </a>
        </>
      ) : (
        <div className="mt-4 space-y-2">
          <Skeleton className="h-2.5 w-full rounded-full" />
          <p className="text-[0.72rem] text-muted-foreground">
            The integrity desk is processing this document.
          </p>
        </div>
      )}
    </article>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const tone = value < 15 ? "bg-success" : value < 35 ? "bg-warning" : "bg-destructive";
  return (
    <div>
      <div className="flex items-center justify-between text-[0.72rem]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-muted">
        <div className={cn("h-2 rounded-full", tone)} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}
