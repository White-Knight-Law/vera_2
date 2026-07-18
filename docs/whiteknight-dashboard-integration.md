# White Knight Dashboard Integration Contract

VERA currently runs as a static GitHub Pages intake surface:

https://white-knight-law.github.io/vera_2/

The production White Knight Law dashboard is served by Cloud Run in Google Cloud project `ai-litigation`:

- Frontend service: `whiteknight-frontend`
- API service: `whiteknight`
- Domains: `whiteknightlaw.org`, `www.whiteknightlaw.org`, `api.whiteknightlaw.org`
- Cloud Build repo: `JohnOjabo/whiteknight`

## Handoff Packet

The VERA handoff packet is JSON and can be exported or copied from the chat handoff panel.

Required top-level fields:

- `version`
- `source`
- `sourceUrl`
- `targetSystem`
- `exportedAt`
- `handoff`
- `flags`
- `transcript`
- `intake`
- `timeline`
- `evidence`
- `summary`

## Dashboard Work

When the private dashboard source is available, add:

- Public CTA from the homepage to VERA.
- CTA from `/crime-victim-advocate` to VERA.
- Dashboard navigation item or integration card for VERA Intake.
- Authenticated import endpoint that accepts the handoff packet.
- Reviewer queue view for `flags`, crisis escalation status, timeline, evidence, and transcript.
- Silent handling for logged-out `401` case-load responses.

Until the backend endpoint exists, staff can use the "Copy dashboard packet" or "Export handoff packet" controls in VERA.
