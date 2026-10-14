import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CloudUpload, FileText, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createQuoteRequest } from "@/lib/portal-data";
import { usePortalSession } from "@/components/access/portal-session";
import { authUrl, clearRequestDraft, readRequestDraft, saveRequestDraft } from "@/lib/auth-return";

const SUBJECTS = [
  "Business & Management",
  "Nursing & Healthcare",
  "Law",
  "Computer Science",
  "Psychology",
  "Economics",
  "Engineering",
  "Education",
  "Mathematics & Statistics",
  "Other",
];

const ASSIGNMENT_TYPES = [
  "Essay",
  "Research paper",
  "Case study",
  "Problem set",
  "Lab report",
  "Presentation",
  "Dissertation chapter",
  "Programming task",
];

const CLASS_SCOPE = [
  "Full class takeover",
  "Weekly discussions only",
  "Quizzes and tests only",
  "Assignments only",
  "Discussions and assignments",
  "Exam support",
];

const PLATFORMS = ["Canvas", "Blackboard", "Moodle", "Brightspace", "Pearson MyLab", "Cengage", "Other"];

const CITATION_STYLES = ["APA 7", "MLA 9", "Harvard", "Chicago", "Vancouver", "IEEE", "Not required"];

const EXAM_TYPES = [
  "Proctored online exam",
  "Timed quiz or test",
  "Final examination",
  "Midterm examination",
  "Interview preparation",
  "Mock interview session",
  "Oral defence rehearsal",
];

const EXAM_DURATIONS = ["Under 1 hour", "1 to 2 hours", "2 to 3 hours", "Over 3 hours", "Multiple sittings"];

export type RequestVariant = "assignment" | "class" | "exam";

export function RequestForm({ variant, compact }: { variant: RequestVariant; compact?: boolean }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { access } = usePortalSession();
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const draftKey = `quote:${variant}`;
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);

  const submit = useMutation({
    mutationFn: createQuoteRequest,
    onSuccess: (order) => {
      clearRequestDraft(draftKey);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Your brief has been received", {
        description: "A support specialist is preparing your quotation, usually within 30 minutes.",
      });
      navigate({ to: "/orders/$orderId", params: { orderId: order.id } });
    },
    onError: () => toast.error("We could not submit that request. Please try again."),
  });

  useEffect(() => {
    const draft = readRequestDraft(draftKey);
    const form = formRef.current;
    if (!draft || !form) return;
    Object.entries(draft).forEach(([name, value]) => {
      const field = form.elements.namedItem(name);
      if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) field.value = String(value);
    });
    if (draft.hadFiles === true) toast.info("Your brief was restored. Please select your attachments again before submitting.");
  }, [draftKey]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (access !== "allowed") {
      const values: Record<string, string | boolean> = {};
      form.forEach((value, key) => { if (typeof value === "string") values[key] = value; });
      values.hadFiles = files.length > 0;
      saveRequestDraft(draftKey, values);
      window.location.assign(authUrl("login"));
      return;
    }
    const isClass = variant === "class";
    const isExam = variant === "exam";

    const instructions = isExam
      ? [
          `Session type: ${String(form.get("examType") ?? "")}`,
          `Platform or proctor: ${String(form.get("platform") ?? "")}`,
          `Expected duration: ${String(form.get("duration") ?? "")}`,
          "",
          String(form.get("instructions") ?? ""),
        ].join("\n")
      : isClass
      ? [
          `Platform: ${String(form.get("platform") ?? "")}`,
          `Scope: ${String(form.get("scope") ?? "")}`,
          `Duration: ${String(form.get("duration") ?? "")}`,
          "",
          String(form.get("instructions") ?? ""),
        ].join("\n")
      : String(form.get("instructions") ?? "");

    submit.mutate({
      fullName: String(form.get("fullName") ?? ""),
      email: String(form.get("email") ?? ""),
      title: String(form.get("title") ?? ""),
      subject: String(form.get("subject") ?? ""),
      assignmentType: isExam
        ? String(form.get("examType") ?? "Exam session")
        : isClass
          ? String(form.get("scope") ?? "Online class")
          : String(form.get("assignmentType") ?? ""),
      wordCount: Number(form.get("wordCount") ?? 0),
      citationStyle: String(form.get("citationStyle") ?? "Not required"),
      deadline: String(form.get("deadline") ?? new Date().toISOString()),
      instructions,
      fileNames: files.map((file) => file.name),
      files,
    });
  };

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className={cn("surface-panel space-y-6", compact ? "p-5 sm:p-6" : "p-6 sm:p-8")}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" name="fullName" required placeholder="Jane Mwangi" />
        <Field label="Email address" name="email" type="email" required placeholder="jane@university.edu" />
      </div>

      <Field
        label={
          variant === "class"
            ? "Class or course title"
            : variant === "exam"
              ? "Exam, test or interview title"
              : "Assignment title"
        }
        name="title"
        required
        placeholder={
          variant === "class"
            ? "BUS 340: Organisational Behaviour"
            : variant === "exam"
              ? "ACC 210 final examination"
              : "Ethics of predictive policing"
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Subject area" name="subject" options={SUBJECTS} />
        {variant === "class" ? (
          <SelectField label="What you need covered" name="scope" options={CLASS_SCOPE} />
        ) : variant === "exam" ? (
          <SelectField label="Session type" name="examType" options={EXAM_TYPES} />
        ) : (
          <SelectField label="Assignment type" name="assignmentType" options={ASSIGNMENT_TYPES} />
        )}
      </div>

      {variant === "class" ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField label="Learning platform" name="platform" options={PLATFORMS} />
          <Field label="Class duration" name="duration" placeholder="8 weeks" />
          <Field label="Next due date" name="deadline" type="datetime-local" required />
        </div>
      ) : variant === "exam" ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField label="Platform or proctor" name="platform" options={PLATFORMS} />
          <SelectField label="Expected duration" name="duration" options={EXAM_DURATIONS} />
          <Field label="Scheduled date and time" name="deadline" type="datetime-local" required />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Word count or pages" name="wordCount" type="number" min={0} placeholder="2000" />
          <SelectField label="Citation style" name="citationStyle" options={CITATION_STYLES} />
          <Field label="Deadline" name="deadline" type="datetime-local" required />
        </div>
      )}

      <div>
        <p className="text-sm font-semibold">
          {variant === "class"
            ? "Syllabus, schedule or portal instructions"
            : variant === "exam"
              ? "Exam guidelines, topic list or interview pack"
              : "Brief, rubric or reading list"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {variant === "class"
            ? "Share the syllabus and any grading rules your instructor published."
            : variant === "exam"
              ? "Share the topic coverage, sample questions and any rules your institution published."
              : "Attach everything your tutor gave you."}
        </p>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "mt-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-8 text-center transition-colors",
            dragging ? "border-primary bg-accent/40" : "border-border hover:border-primary/50 hover:bg-accent/20",
          )}
        >
          <CloudUpload className="size-6 text-muted-foreground" />
          <p className="text-sm font-semibold">Drag and drop your document here</p>
          <p className="text-xs text-muted-foreground">PDF, DOCX or TXT, up to 25MB</p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={(e) => setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])])}
          />
        </div>
        {files.length > 0 && (
          <ul className="mt-3 space-y-2">
            {files.map((file, i) => (
              <li key={`${file.name}-${i}`} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
                <FileText className="size-4 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
                <button
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label htmlFor="instructions" className="text-sm font-semibold">
          Instructions
        </label>
        <textarea
          id="instructions"
          name="instructions"
          rows={6}
          required
          placeholder={
            variant === "class"
              ? "Weekly workload, participation rules, target grade, dates you must not miss."
              : variant === "exam"
                ? "Topics covered, question format, time zone, grade you are aiming for."
                : "Marking criteria, required sources, tutor comments, preferred structure."
          }
          className="mt-2 w-full rounded-xl border border-input bg-card p-3.5 text-sm leading-relaxed outline-none transition-shadow placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring/40"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-border pt-5">
        <button
          type="submit"
          disabled={submit.isPending}
          className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {submit.isPending ? "Sending your brief" : access === "allowed" ? "Get my quotation" : "Sign in and continue"}
        </button>
        <p className="text-xs text-muted-foreground">
          We reply with a quotation and delivery plan, usually within 30 minutes.
        </p>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  min?: number;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-semibold">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        min={min}
        className="mt-2 h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm outline-none transition-shadow placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring/40"
      />
    </div>
  );
}

function SelectField({ label, name, options }: { label: string; name: string; options: string[] }) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-semibold">
        {label}
      </label>
      <select
        id={name}
        name={name}
        className="mt-2 h-11 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/40"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
