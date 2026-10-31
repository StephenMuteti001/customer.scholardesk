<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture decisions

- ScholarDesk customer portal is a client-only SPA over the existing ScholarDesk backend (`VITE_API_URL`, default `https://api.academichubpro.com/api/v1`, cookie sessions, Paystack checkout). No Lovable Cloud database — do not add local tables for portal data.
- `SupportChatProvider` must stay inside `PortalSessionProvider` in `src/routes/_portal.tsx`, never on the root route: the chat widget reads the portal session, so root mounting crashes SSR ("usePortalSession must be used within PortalSessionProvider").
- Every URL must have exactly one route file: `_portal.<page>.tsx` files claim their page path through the pathless `_portal` layout, so a sibling plain `<page>.tsx` for the same path breaks the router generator.
