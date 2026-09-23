# Academic Hub client portal — API contract

Transport is unchanged from the current platform:

- Base URL: `VITE_API_URL` (default `https://api.academichubpro.com/api/v1`)
- Cookie-based session (`credentials: "include"`)
- CSRF double-submit: `csrf_access_token` cookie is echoed as `X-CSRF-TOKEN`
- `401`/`403` → redirect to the auth portal (`VITE_AUTH_PORTAL_URL`)

Implemented in `src/lib/api.ts`; every call in the portal goes through
`src/lib/portal-data.ts`. Set `VITE_USE_MOCK_DATA=false` to hit the live API.

## Orders

The portal now distinguishes **open requests** (no accepted/paid quote) from
**orders** (converted). Both are the same resource; the `stage` field decides
where they render.

| Method | Path | Purpose | Change |
| --- | --- | --- | --- |
| GET | `/orders` | List all client orders + requests | existing (add `stage`, `payment_status`, `quote`) |
| GET | `/orders/{id}` | Single order with `submissions[]` and `activity[]` | existing (extend) |
| POST | `/orders/quote-requests` | Submit a brief; creates an order in `quote_requested`. No price field from the client. | **new** (replaces client-supplied budget) |
| PATCH | `/orders/{id}` | Edit brief. Server flags scope creep for support review. | existing |
| POST | `/orders/{id}/cancel` | `{ reason }` | existing |
| POST | `/orders/{id}/quote/accept` | Client accepts the team quote → `awaiting_payment` | **new** |
| POST | `/orders/{id}/payments` | Create/settle payment for the accepted quote → `matching_writer`, `payment_status: paid` | **new** (replaces wallet deposits) |
| POST | `/orders/{id}/refund-requests` | `{ reason }` → `payment_status: refund_requested` | **new** |

### Order payload additions

```jsonc
{
  "stage": "quote_requested|quote_sent|awaiting_payment|matching_writer|in_progress|quality_review|delivered|revision_in_progress|completed|cancelled",
  "payment_status": "unpaid|partially_paid|paid|refund_requested|refunded",
  "quote": {
    "amount": 148, "currency": "USD",
    "issued_at": "…", "expires_at": "…",
    "delivery_schedule": "Draft in 48h…",
    "notes": "…", "accepted_at": "…"
  },
  "activity": [{ "id": "…", "at": "…", "actor": "client|support|writer|system", "title": "…", "detail": "…" }]
}
```

Quotes are always **issued by the Academic Hub team** — there is no
client-supplied budget field anywhere in the request payload.

## Submissions and revisions

| Method | Path | Purpose | Change |
| --- | --- | --- | --- |
| GET | `/orders/{id}/submissions` | Versioned submissions released to the client after integrity review | existing (add `ai_score`, `plagiarism_score`, `version`, `status`) |
| POST | `/orders/{id}/submissions/{submissionId}/revision-requests` | `{ note }` → order `revision_in_progress`; support escalates to the writer | **new** |
| POST | `/orders/{id}/submissions/{submissionId}/approve` | Client approves → order `completed` | **new** |

Writer submissions must **not** be exposed to the client until the internal
integrity review passes; failing work is routed back to the writer and never
appears in this list.

## Support chat

Chats belong to the client ↔ support team. Writers are never participants.

| Method | Path | Purpose | Change |
| --- | --- | --- | --- |
| GET | `/support-chat` | Thread list: `subject`, `order_reference`, `status`, `agent_name`, `unread`, `updated_at`, `last_message` | existing (add `subject`, `status`, `agent_name`, `last_message`) |
| GET | `/support-chat/{chatId}/messages` | Messages (marks thread read) | existing |
| POST | `/support-chat/{chatId}/messages` | `{ body }`, optional multipart attachments | existing |
| POST | `/support-chat` | `{ subject, orderReference? }` start a thread | **new** |
| POST | `/support-chat/{chatId}/status` | `{ status: "open"\|"pending"\|"resolved"\|"archived" }` — only after resolution | **new** (support-side, client read-only) |

Scope-creep negotiations are support-initiated threads referencing the order.

## Removed

- All wallet endpoints (`/wallet`, `/wallet/deposits`, `/withdrawals`,
  `/transactions`, payment methods) are no longer called by the client portal.
  Payment is per order via `/orders/{id}/payments`.
- Bidding endpoints (`/orders/{id}/bids`) — clients never see writers or bids.

## Exam materials

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/exam-materials` | List purchasable materials. Response `{ data: ExamMaterial[] }`. Each item carries `owned: boolean` for the current client. |
| POST | `/exam-materials/{id}/purchase` | Charge the client for a pack and grant access. Response `{ data: ExamMaterial }` with `owned: true`. |

`ExamMaterial`: `id, title, summary, subject, level (Undergraduate|Postgraduate|Professional), category (Past papers|Revision notes|Question banks|Study guides|Model answers), institution?, year, pages, format (PDF|DOCX|PPTX|ZIP), price, currency, rating, downloads, owned`.

A signed download URL should be returned for owned packs (suggested field `downloadUrl`, short lived).

## Integrity reports (AI and plagiarism)

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/integrity-reports` | List the client's submitted documents and results. Response `{ data: IntegrityReport[] }`. |
| POST | `/integrity-reports` | Start a scan. Body `{ fileName, wordCount, checks: { ai, plagiarism } }`, or `multipart/form-data` with the file plus `checks[ai]` and `checks[plagiarism]`. Response `{ data: IntegrityReport }` with `status: "processing"`. |

`IntegrityReport`: `id, fileName, wordCount, submittedAt, status (queued|processing|ready|failed), checks {ai, plagiarism}, aiScore?, plagiarismScore?, topMatches?: [{ source, overlap }], reportUrl?`.

All calls use the existing cookie session and `X-CSRF-TOKEN` double submit header.
