# Contributing to VERA

VERA (Victim Empower & Response Advocate) is a browser-based, trauma-aware
intake workspace that helps crime victims organize urgent concerns, evidence,
and timelines, and prepare a handoff packet for a human advocate to review.
It is maintained by White Knight Law and served as a static site at
[vera.whiteknightlaw.org](https://vera.whiteknightlaw.org/).

Thanks for considering a contribution. Because this tool is used by people in
crisis, please read the "Working on a sensitive product" section before
opening a PR, even a small one.

## Project layout

This is a static, no-build project — there is no `package.json`, bundler, or
framework.

```
index.html   Entire app: markup, CSS, and vanilla JS in one file
docs/        Internal integration notes (e.g. dashboard handoff contract)
resources/   Reference PDFs (victim-advocacy guidelines) surfaced by the app
robots.txt, sitemap.xml   Site metadata for GitHub Pages
```

Everything the user interacts with — the intake chat, crisis-term detection,
timeline/evidence builders, and the dashboard handoff export — lives in
`index.html`. Keep it that way unless a change genuinely requires splitting
files; a PR that introduces a build step or framework should be discussed in
an issue first.

## Getting set up

No install step is required.

1. Fork and clone the repo.
2. Open `index.html` directly in a browser, or serve it locally so
   relative paths behave the same as production:
   ```bash
   python -m http.server 8000
   ```
   Then visit `http://localhost:8000/`.
3. Make your change directly in `index.html` (or `docs/`), reload, and test
   in the browser.

There is no test suite yet. Verify changes manually:
- Walk through the intake chat flow, including a message containing a crisis
  term, and confirm the safety messaging still appears correctly.
- Check keyboard navigation and screen-reader labeling for anything you
  touch — this app is used under stress, often on mobile.
- Test at a narrow viewport width (this is a mobile-first tool).
- Confirm `localStorage` persistence still round-trips saved case data if
  you touch the storage code.

## Working on a sensitive product

- **No real case data, ever.** Don't commit real names, transcripts, or
  evidence in test fixtures, screenshots, or commit messages. Use obviously
  fake placeholder data.
- **Don't weaken the safety messaging.** Copy that tells users to contact
  emergency services in a crisis (search `crisis` in `index.html`) is there
  deliberately — if your change touches that flow, call it out explicitly in
  the PR description.
- **Trauma-informed tone.** Copy changes should stay calm, non-judgmental,
  and victim-centered. When in doubt, match the existing voice rather than
  introducing a new one.
- **Accessibility is not optional.** Contrast, focus states, and semantic
  markup matter more here than in a typical marketing site.

## Making a change

1. Open an issue first for anything beyond a small fix (typo, copy tweak,
   minor style fix) — especially for changes to the crisis-detection logic,
   the handoff packet schema (see
   [`docs/whiteknight-dashboard-integration.md`](docs/whiteknight-dashboard-integration.md)),
   or data storage.
2. Create a branch off `main` and keep the PR scoped to one change.
3. Commit messages should describe *why*, not just *what*.
4. Open a PR describing what changed and how you tested it. Note any effect
   on the handoff packet JSON shape, since a private dashboard consumes it.

## Reporting issues

Use GitHub Issues for bugs, accessibility problems, and feature requests.
For anything that looks like it might expose real user data, do not open a
public issue — email the maintainers directly instead.
