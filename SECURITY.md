# Security Policy

VERA handles intake for people in potentially dangerous situations. We take
security and privacy reports seriously and ask that you help us protect
users by reporting responsibly.

## Reporting a Vulnerability

**Do not open a public GitHub issue for security or privacy vulnerabilities**,
especially anything that could expose real user/case data.

Instead, email the maintainers directly at **sc@whiteknightlaw.org** with:

- A description of the issue and its potential impact
- Steps to reproduce (if applicable)
- Any relevant logs, screenshots, or URLs — with real personal data redacted

We aim to acknowledge reports within 3 business days.

## Scope

This applies to:

- The VERA static site (`index.html`) and its client-side data handling
  (`localStorage` usage, crisis-term detection, handoff packet export)
- The handoff/export flow described in
  [`docs/whiteknight-dashboard-integration.md`](docs/whiteknight-dashboard-integration.md)

## Data Handling Notes for Reporters

VERA stores in-progress case data in the browser's `localStorage` and does
not upload evidence files. If you discover a way for case data to leak,
persist longer than expected, or be exposed cross-origin, please report it —
this is treated as a high-severity issue given the sensitivity of the data
involved.
