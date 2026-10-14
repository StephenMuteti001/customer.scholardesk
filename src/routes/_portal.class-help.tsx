import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, LineChart, ShieldCheck } from "lucide-react";
import { ServiceRequestPage } from "@/components/portal/ServiceRequestPage";

export const Route = createFileRoute("/_portal/class-help")({
  head: () => ({
    meta: [
      { title: "Class help | ScholarDesk Customer Portal" },
      {
        name: "description",
        content:
          "Ongoing cover for an online course: discussions, quizzes, assignments and deadlines, managed by the ScholarDesk team.",
      },
      { property: "og:title", content: "Class help | ScholarDesk" },
      {
        property: "og:description",
        content: "Weekly coursework handled on schedule, with progress reported back to you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
     { property: "og:image", content: "https://scholardesk.pro/brand/og-image.png" }, { name: "twitter:image", content: "https://scholardesk.pro/brand/og-image.png" }],
  }),
  component: () => (
    <ServiceRequestPage
      variant="class"
      eyebrow="Class help"
      title="Steady cover for a full course, week after week."
      description="Discussions, quizzes, weekly assignments and graded milestones handled to your target grade. Tell us the platform and the scope, and our team returns a quotation for the term or for the weeks you choose."
      highlights={[
        {
          icon: CalendarClock,
          title: "Deadlines tracked for you",
          detail: "We work to your course calendar and confirm each submission as it is completed.",
        },
        {
          icon: LineChart,
          title: "Progress you can see",
          detail: "Your order timeline records every task completed, with grades logged where available.",
        },
        {
          icon: ShieldCheck,
          title: "One point of contact",
          detail: "All updates come from the support team. Writers are never part of your conversation.",
        },
      ]}
    />
  ),
});
