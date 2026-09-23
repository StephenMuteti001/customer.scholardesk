import { createFileRoute } from "@tanstack/react-router";
import { ClipboardCheck, Clock4, Users } from "lucide-react";
import { ServiceRequestPage } from "@/components/portal/ServiceRequestPage";

export const Route = createFileRoute("/_portal/assignment-help")({
  head: () => ({
    meta: [
      { title: "Assignment help | ScholarDesk Customer Portal" },
      {
        name: "description",
        content:
          "Send your assignment brief, rubric and deadline. The ScholarDesk team replies with a quotation and delivery schedule, usually within 30 minutes.",
      },
      { property: "og:title", content: "Assignment help | ScholarDesk" },
      {
        property: "og:description",
        content: "Essays, case studies, problem sets, lab reports and code, matched to a subject specialist.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <ServiceRequestPage
      variant="assignment"
      eyebrow="Assignment help"
      title="Send the brief. Receive a quotation. Approve when you are ready."
      description="Essays, case studies, problem sets, lab reports, presentations and code, matched to a specialist who has completed similar work before. You never deal with the expert directly."
      highlights={[
        {
          icon: Users,
          title: "Matched by our team",
          detail: "We assign a vetted specialist in your subject once you approve the quotation.",
        },
        {
          icon: ClipboardCheck,
          title: "Screened before delivery",
          detail: "Every submission passes an AI content and plagiarism review before it reaches you.",
        },
        {
          icon: Clock4,
          title: "Quotation in about 30 minutes",
          detail: "A support specialist prices the work and sends a delivery schedule you can discuss.",
        },
      ]}
    />
  ),
});
