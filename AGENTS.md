# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

- Keep `parseTagValue: false` on the `config.xml` model: without it, an API key that parses as a number (all digits, or digits around one `e`) is rewritten as one.
- Never write the password into `config.xml` or `sonarr.db`; Sonarr hashes it itself, so it only goes in through `PUT /api/v3/config/host`.
