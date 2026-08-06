# VERA — Victim Evidence & Response Advocate

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

VERA is a browser-based, trauma-aware intake workspace that helps crime
victims organize urgent concerns, evidence, and timelines, and prepare a
handoff packet for a human advocate to review. It's maintained by
[White Knight Law](https://www.whiteknightlaw.org/) and served as a static
site at [vera.whiteknightlaw.org](https://vera.whiteknightlaw.org/).

## Overview

Someone who has just experienced a crime is often overwhelmed, unsure what
counts as "evidence," and unsure what to tell an advocate first. VERA is a
guided, chat-style intake that:

- Walks a victim through describing what happened in their own words
- Flags language that suggests an active safety risk and immediately
  surfaces crisis-line / emergency-services guidance
- Helps organize evidence and build a timeline without requiring uploads
- Suggests relevant support resources (drawn from published victim-advocacy
  guidelines in [`resources/`](resources/))
- Packages everything into a structured handoff for a human advocate to
  review — VERA never makes decisions on its own

The whole thing runs client-side as a single static page: no account, no
server-side storage of case data beyond the browser, no dependencies to
install.

## Why we built this

Most victim-advocacy intake still starts with a phone call or a paper form,
at exactly the moment someone is least equipped to organize their thoughts.
White Knight Law built VERA to lower that barrier: give someone a calm,
structured way to get their situation down in writing on their own time,
flag anything urgent immediately, and hand a clean, complete packet to the
advocate who picks up the case — so the first human conversation starts from
context instead of a blank page.

## For reviewers

If you're evaluating this repo (open-source review, contribution program,
etc.), the fastest way to get oriented:

1. Open [`index.html`](index.html) in a browser — no build step, it just
   runs.
2. Read [`docs/whiteknight-dashboard-integration.md`](docs/whiteknight-dashboard-integration.md)
   for how a completed intake hands off to the production system.
3. Check [CONTRIBUTING.md](CONTRIBUTING.md) for how changes are made and
   why the safety/trauma-informed constraints exist.

It's a small, self-contained, actively maintained project with a clear
license, a real (if unconventional) use case, and room for meaningful
contributions — accessibility, copy, and resource-referral logic are all
open areas.

## License

This project is open source, licensed under the [MIT License](LICENSE).

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) for
project layout, local setup, and guidelines specific to working on a
sensitive, trauma-informed tool. Please also read our
[Code of Conduct](CODE_OF_CONDUCT.md).

## Security

Found a vulnerability, especially anything that could expose real case
data? See [SECURITY.md](SECURITY.md) for how to report it privately.

## Project layout

```
index.html   Entire app: markup, CSS, and vanilla JS in one file
docs/        Internal integration notes (e.g. dashboard handoff contract)
resources/   Reference PDFs (victim-advocacy guidelines) surfaced by the app
```
