<p align="center">
  <img src="icon.svg" alt="Sonarr Logo" width="21%">
</p>

# Sonarr on StartOS

> Everything not listed in this document should behave the same as upstream
> Sonarr. If a feature, setting, or behavior is not mentioned here, the upstream
> documentation is accurate and fully applicable — see the Documentation section of
> `instructions.md` for links.

[Sonarr](https://github.com/Sonarr/Sonarr) is a PVR for TV shows: it watches indexers for new episodes, hands them to a download client, and imports the finished files into a media library.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

The package runs the unmodified `lscr.io/linuxserver/sonarr` image for x86_64 and aarch64.

- One subcontainer, `sonarr-sub`, running the image's s6-overlay entrypoint as PID 1, with `PUID=1000`, `PGID=1000`, `TZ=Etc/UTC`. Sonarr itself runs as uid 1000 (`abc`).
- A post-start step, `reconcile`, runs in the package's own JavaScript context once Sonarr is ready. Through Sonarr's API it applies the stored admin password (only if it no longer logs in) and creates, updates or deletes the package-managed qBittorrent download client. A failed API call is logged with its method, path and status.

## Volume and Data Layout

The package's own state and Sonarr's app data are on separate volumes; media lives in a file manager's volume.

| Volume / mount                            | Mount point         | Contents                                                                                                |
| ----------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------- |
| `main`                                    | `/config`           | Sonarr's app data: `config.xml`, `sonarr.db` and `logs.db` (SQLite), `MediaCover/`, `logs/`, `Backups/` |
| `startos`                                 | (not mounted)       | `store.json`; `share/api-key`                                                                           |
| FileBrowser Quantum `data`, if selected   | `/mnt/filebrowser`  | Read-write; the TV library and qBittorrent's downloads                                                  |
| NextExplorer `data`, if selected          | `/mnt/nextexplorer` | Read-write; one folder per drive, such as `/mnt/nextexplorer/Files`                                     |
| qBittorrent `main` `share/`, if connected | `/mnt/qbittorrent`  | Read-only; qBittorrent's Web API key, `api-key`                                                         |

The file-manager mounts are at the same paths qBittorrent saves to and Jellyfin reads from, so no remote path mappings are needed, and imports hardlink when the download and the root folder are in the same file manager.

## File Models

The package owns three files.

- **`store.json`** (`startos` volume) — `apiKey` (32 hex characters, generated on install), `adminPassword` (written by **Set Admin Password**), `mediaSources` (written by **Media Storage**), `qbittorrentConnected` (toggled by **Connect qBittorrent**), and `qbittorrentClientId` (the id of the download client `reconcile` manages). A change to any of the first four restarts Sonarr.
- **`share/api-key`** (`startos` volume) — the bare API key, no newline, rewritten from `store.json` on every init. This is the interface dependents read: Prowlarr mounts `share/` read-only to connect to Sonarr.
- **`config.xml`** (`main` volume, Sonarr's own config) — on install the package seeds `AnalyticsEnabled=False`; the user may change it afterwards. On every start, before Sonarr launches, it re-asserts `ApiKey` (from `store.json`), `AuthenticationMethod=Forms`, `AuthenticationRequired=Enabled`, `BindAddress=*`, `Port=8989`, `UrlBase` empty, and `TrustedNetworks` set to the StartOS bridge gateway, so Sonarr honors the proxy's forwarded headers. Every other key belongs to Sonarr and survives hand edits.

Sonarr's `admin` username and password live in its database; `reconcile` re-applies them whenever the stored password stops logging in, so a credential change made in **Settings > General** is reverted at the next start. The download client whose id is `qbittorrentClientId` is rewritten on every start (name, host, port, `useSsl`, `apiKey`, username and password cleared, enabled); its other settings, such as the category, belong to the user. Download clients the user adds are never touched.

## Dependencies

All dependencies are optional.

| Dependency          | Kind                             | Enabled while                        | Mount / use                                                                     |
| ------------------- | -------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------- |
| FileBrowser Quantum | exists                           | selected in **Media Storage**        | `data` read-write at `/mnt/filebrowser`                                         |
| NextExplorer        | exists                           | selected in **Media Storage**        | `data` read-write at `/mnt/nextexplorer`                                        |
| qBittorrent         | running (`primary` health check) | connected by **Connect qBittorrent** | `share/` read-only at `/mnt/qbittorrent`; download client at its bridge address |

qBittorrent's address is resolved from its web UI binding on the StartOS bridge and re-resolved reactively, so Sonarr restarts and rewrites the download client if qBittorrent's port changes.

## Network Access and Interfaces

One interface serves both the web UI and the API.

| Interface | Type | Port | Protocol | Purpose                     |
| --------- | ---- | ---- | -------- | --------------------------- |
| `ui`      | ui   | 8989 | HTTP     | Sonarr web UI and `/api/v3` |

The host id `ui-multi` and internal port 8989 are exported from `startos/utils.ts` as `uiHostId` and `uiPort`; Prowlarr resolves Sonarr's bridge address from both, so neither may change.

## Installation and First-Run Flow

Sonarr's first-run "create credentials" screen is never reachable: the package seeds `config.xml` with Forms authentication and an API key before Sonarr first starts, so `/` redirects to `/login` and no account can be claimed from the browser.

On install the package generates the API key and raises two critical tasks. Both must be completed before Sonarr can start; their order does not matter. On the first start `reconcile` creates the `admin` user.

## Actions

**Set Admin Password** (renamed **Reset Admin Password** once set) — run it on install, or whenever the password is lost.

- Changes `adminPassword` in `store.json`; Sonarr restarts and `reconcile` applies it. The old password is rejected from then on.
- Takes as long as a Sonarr restart. Safe to repeat; each run mints a new password.
- Outputs the username `admin` and the new password, shown once.

**Media Storage** — run it on install, or to add or remove a file manager.

- Changes `mediaSources` in `store.json`, which mounts or unmounts the file managers and enables or disables their dependencies. Sonarr restarts.
- Safe to repeat. Deselecting a file manager makes root folders and downloads under its mount point unavailable to Sonarr until it is selected again; nothing is deleted.

**Connect qBittorrent** / **Disconnect qBittorrent** — a toggle; run it to add qBittorrent, or again to remove it.

- Flips `qbittorrentConnected` in `store.json`; Sonarr restarts and `reconcile` creates, updates or deletes the **qBittorrent (StartOS)** download client. Disconnecting deletes only that client.
- Takes as long as a Sonarr restart. Safe to repeat.
- The client authenticates with qBittorrent's Web API key, read from the mount and watched: when qBittorrent's key changes, Sonarr restarts and `reconcile` rewrites the client, so the connection follows qBittorrent automatically.

## Tasks

Two critical tasks appear on Sonarr's page.

| Action               | Severity | Raised when                         | Cleared by                                        |
| -------------------- | -------- | ----------------------------------- | ------------------------------------------------- |
| `set-admin-password` | critical | `store.json` has no `adminPassword` | running the action                                |
| `media-storage`      | critical | `mediaSources` is empty             | running the action with at least one file manager |

Neither returns once cleared.

## Health Checks

One check, **Web Interface** (`primary`), fetches `http://127.0.0.1:8989/ping`.

It succeeds on any HTTP response, so a failure means Sonarr is not listening at all. On the first start Sonarr runs its database migrations first, which takes several seconds; connection-refused errors from the check during that window are expected in the log. A failure that persists means Sonarr crashed — read the service log.

## Backups and Restore

The `startos` and `main` volumes are copied wholesale while Sonarr is stopped. `MediaCover/` (artwork Sonarr re-downloads) and `logs/` are excluded.

Media in FileBrowser Quantum or NextExplorer is not part of Sonarr's backup; it belongs to those services' backups. A restored Sonarr comes back with its library, settings, download clients, API key and admin password, but its root folders work only once the same file manager is installed with the same folders.

## Limitations and Differences

1. Sign-in is always Forms authentication with the single `admin` account; authentication method, username and password changes made in Sonarr's UI are reverted on the next start.
2. The API key is owned by the package; regenerating it in Sonarr's UI lasts only until the next start.
3. Sonarr cannot store media on its own volume; a root folder must be under `/mnt/filebrowser` or `/mnt/nextexplorer`.
4. Sonarr's built-in updater is disabled; updates come from the package.
5. The **qBittorrent (StartOS)** download client is owned by the package while connected; edits to its connection settings in Sonarr are reverted on the next start.

---

## Quick Reference for AI Consumers

```yaml
package_id: sonarr
image: lscr.io/linuxserver/sonarr
architectures: [x86_64, aarch64]
subcontainers: [sonarr-sub]
volumes:
  main: /config
  startos: store.json (not mounted)
file_models:
  - store.json
  - config.xml
startos_managed_env_vars:
  - PUID
  - PGID
  - TZ
dependencies:
  [filebrowser (optional), nextexplorer (optional), qbittorrent (optional)]
interfaces:
  ui: { type: ui, port: 8989 }
actions:
  - set-admin-password
  - media-storage
  - connect-qbittorrent
tasks:
  - { action: set-admin-password, severity: critical }
  - { action: media-storage, severity: critical }
health_checks:
  - primary
```
