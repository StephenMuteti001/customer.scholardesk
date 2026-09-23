import { createFileRoute } from "@tanstack/react-router";
import { AlarmClock, MessagesSquare, Target } from "lucide-react";
import { ServiceRequestPage } from "@/components/portal/ServiceRequestPage";

export const Route = createFileRoute("/_portal/exam-help")({
  head: () => ({
    meta: [
      { title: "Exam and interview support | ScholarDesk Customer Portal" },
      {
        name: "description",
        content:
          "Preparation and live support for timed exams, tests, oral defences and interviews, scheduled with the ScholarDesk team.",
      },
      { property: "og:title", content: "Exam and interview support | ScholarDesk" },
      {
        property: "og:description",
        content: "Book a specialist for your exam window or interview rehearsal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <ServiceRequestPage
      variant="exam"
      eyebrow="Exam and interview support"
      title="Book a specialist for your exam window or interview."
      description="Share the date, the platform and the topics. Our team confirms availability, sends a quotation and prepares a specialist who knows the format you are sitting."
      highlights={[
        {
          icon: AlarmClock,
          title: "Scheduled to your window",
          detail: "Tell us the exact date, time zone and duration, and we confirm cover in advance.",
        },
        {
          icon: Target,
          title: "Prepared for your format",
          detail: "Multiple choice, structured questions, oral defence or panel interview, each handled differently.",
        },
        {
          icon: MessagesSquare,
          title: "Briefed before the day",
          detail: "Support runs a readiness check with you so nothing is left to chance.",
        },
      ]}
    />
  ),
});
