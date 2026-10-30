<p align="center">
  <img src="icon.svg" alt="Sonarr Logo" width="21%">
</p>

# Sonarr on StartOS

> Everything not listed in this document should behave the same as upstream Sonarr.
> If a feature, setting, or behavior is not mentioned here, the upstream
> documentation is accurate and fully applicable — see the Documentation section of
> `instructions.md` for links.

[Sonarr](https://github.com/Sonarr/Sonarr) is a PVR for TV shows: it watches for new episodes of the series you follow, sends releases to a download client, and imports the finished files into a library. This package owns Sonarr's API key and admin login, closes the first-run "create a login" screen, manages the qBittorrent download client, publishes its API key for Prowlarr, and keeps the library in FileBrowser Quantum or NextExplorer — the same place qBittorrent saves to and Jellyfin reads from.

- **Upstream repo:** <https://github.com/Sonarr/Sonarr>
- **Wrapper repo:** <https://github.com/Start9Labs/sonarr-startos>

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

The LinuxServer image, run unmodified through its own s6-overlay entrypoint.

| Property      | Value                                       |
| ------------- | ------------------------------------------- |
| Image         | `lscr.io/linuxserver/sonarr`                |
| Architectures | x86_64, aarch64                             |
| Command       | The image's `/init`, as PID 1 (`runAsInit`) |
| Environment   | `PUID=1000`, `PGID=1000`, `TZ=Etc/UTC`      |

| Subcontainer | Purpose                                       |
| ------------ | --------------------------------------------- |
| `sonarr-sub` | The `primary` daemon — the one to `attach` to |

Sonarr runs as uid 1000 (`abc`). The image's init re-owns `/config` to that uid on every boot, so files the package writes there as root are fine. In-app updates are disabled by the image (`UpdateMechanism=Docker`); Sonarr is updated by updating the package.

The `reconcile` oneshot runs in the package's JavaScript context once `primary` is ready, on every start, against Sonarr's API on `127.0.0.1:8989` with the stored API key:

- **Login.** If the stored password no longer logs in, it reads `GET /api/v3/config/host` and `PUT`s it back with Forms authentication, authentication required, username `admin` and the stored password, so a credential changed in Sonarr's settings is reverted at the next start.
- **qBittorrent download client.** While qBittorrent is connected, it creates or updates a QBittorrent download client named `qBittorrent (StartOS)` (the name is unique, so it cannot collide with a client you named `qBittorrent`) at qBittorrent's bridge address, authenticating with qBittorrent's Web API key and no username or password, and records its id in `store.json` as `qbittorrentClientId`. It finds that client by the recorded id, or by its name when no id was recorded, so a start interrupted after the create never leaves a second client behind. Disconnected, it deletes that one client. Clients you add yourself are never touched, unless you name one `qBittorrent (StartOS)` in any letter case. A new client is created disabled and then enabled with `forceSave`, because Sonarr tests an enabled client on create even with `forceSave`.

## Volume and Data Layout

Two volumes of its own, plus a read-write mount of each file manager the user selects.

| Volume                        | Mount Point         | Purpose                                                                                                      |
| ----------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------ |
| `main`                        | `/config`           | `config.xml`, `sonarr.db`, `logs.db`, `MediaCover/`, `logs/`, and Sonarr's own scheduled database copies     |
| `startos`                     | not mounted         | `store.json`; `share/api-key`                                                                                |
| `filebrowser` `data`          | `/mnt/filebrowser`  | TV library and qBittorrent downloads, when FileBrowser Quantum is selected                                   |
| `nextexplorer` `data`         | `/mnt/nextexplorer` | TV library and qBittorrent downloads, when NextExplorer is selected; one directory per NextExplorer location |
| `qbittorrent` `main` `share/` | `/mnt/qbittorrent`  | Read-only, while connected; qBittorrent's Web API key, `api-key`                                             |

**The mount points are a contract with qBittorrent and Jellyfin.** qBittorrent mounts the same volumes at the same paths, so a path qBittorrent reports for a finished download is the path Sonarr sees: no remote path mapping is needed, and a root folder on the same volume as the download lets Sonarr hardlink instead of copy. Changing either mount point breaks that.

## File Models

Three models.

| File            | Format | Modelled                  | Written by                                        |
| --------------- | ------ | ------------------------- | ------------------------------------------------- |
| `store.json`    | JSON   | Yes — `FileHelper.json`   | Install init (`apiKey`), the actions, `reconcile` |
| `config.xml`    | XML    | Yes — `FileHelper.xml`    | Install init, then `setupMain` on every start     |
| `share/api-key` | text   | Yes — `FileHelper.string` | Every init, from `store.json` `apiKey`            |

| `store.json` key       | Set by              | Notes                                                     |
| ---------------------- | ------------------- | --------------------------------------------------------- |
| `apiKey`               | Install             | 32 hex characters; also published at `share/api-key`      |
| `adminPassword`        | Set Admin Password  | Plaintext, because Sonarr's API takes the password itself |
| `mediaSources`         | Media Storage       | `filebrowser`, `nextexplorer`, or both                    |
| `qbittorrentConnected` | Connect qBittorrent | Whether qBittorrent is connected                          |
| `qbittorrentClientId`  | `reconcile`         | Sonarr's id for the package-managed download client       |

`config.xml` is Sonarr's own file and Sonarr rewrites it whenever settings are saved. The package writes only these keys:

| Key                      | When         | Value                               |
| ------------------------ | ------------ | ----------------------------------- |
| `ApiKey`                 | Every start  | `store.json` `apiKey`               |
| `AuthenticationMethod`   | Every start  | `Forms`                             |
| `AuthenticationRequired` | Every start  | `Enabled`                           |
| `BindAddress`            | Every start  | `*`                                 |
| `Port`                   | Every start  | `8989`                              |
| `UrlBase`                | Every start  | empty                               |
| `TrustedNetworks`        | Every start  | The OS's bridge address (`getOsIp`) |
| `AnalyticsEnabled`       | Install only | `False`                             |

**Writing these before Sonarr's first boot is what closes the first-run screen.** Out of the box Sonarr starts with no authentication and offers whoever loads the UI first the chance to create the login. With Forms authentication and no user yet, it redirects everyone to a login page nobody can pass until `reconcile` creates the user.

**`AuthenticationRequired=Enabled` is forced because every proxied request comes from a local address.** Sonarr's "disabled for local addresses" option would otherwise open the UI to anyone who can reach the interface.

**`TrustedNetworks` is the StartOS reverse proxy.** Without it Sonarr ignores `X-Forwarded-Proto`, and its login redirect sends an HTTPS browser to an `http://` URL on the HTTPS port.

Everything else in `config.xml`, and every setting in the UI, is yours. Regenerating the API key in the UI does not stick: the next start restores the stored one.

## Dependencies

Three, all optional.

| Dependency     | Kind                              | Declared while            |
| -------------- | --------------------------------- | ------------------------- |
| `filebrowser`  | `exists`                          | Selected in Media Storage |
| `nextexplorer` | `exists`                          | Selected in Media Storage |
| `qbittorrent`  | `running`, health check `primary` | qBittorrent is connected  |

Sonarr reads and writes a file manager's `data` volume whether or not that service is running, so it only has to be installed. While a selected file manager is uninstalled, Sonarr mounts nothing of it and starts anyway: its root folders show as missing, the disk scan skips them, and imports into them are refused. Installing it again restarts Sonarr, which mounts it. Both serve their volume as uid 1000, the uid Sonarr runs as, so imported episodes are immediately manageable there.

qBittorrent's bridge address is resolved with `getBridgeAddress` from qBittorrent's `ui-multi` host and its internal port, imported from `qbittorrent-startos`; a change to it restarts Sonarr, which re-points the download client. The key is read from `/mnt/qbittorrent/api-key` and watched the same way, so when qBittorrent's key changes Sonarr restarts and `reconcile` updates the client: the connection follows qBittorrent automatically. While qBittorrent is uninstalled its address resolves to nothing, so Sonarr mounts nothing of it, starts normally and leaves the client as it is; installing qBittorrent again restarts Sonarr, which reconnects it.

## Network Access and Interfaces

One HTTP interface, serving both the web UI and the API.

| Interface | Id   | Type | Port | Masked | Description                      |
| --------- | ---- | ---- | ---- | ------ | -------------------------------- |
| Web UI    | `ui` | ui   | 8989 | No     | The Sonarr web interface and API |

The host id is `ui-multi` and the internal port 8989; Prowlarr resolves Sonarr's bridge address from both (exported from `startos/utils.ts` as `uiHostId` and `uiPort`), so neither may change. **`share/api-key` on the `startos` volume is the interface dependents read:** the bare API key, no newline, alone in that directory; Prowlarr mounts it read-only to connect to Sonarr. The API takes the `X-Api-Key` header; the web UI uses a session cookie.

## Installation and First-Run Flow

Install generates the API key, seeds `config.xml`, and raises two critical tasks: Set Admin Password and Media Storage. Sonarr does not start until both are done.

After that: Connect qBittorrent, create a root folder, and add indexers, by hand or from Prowlarr's Connect Apps action. `instructions.md` walks through it.

## Actions

Three actions, all available whether or not Sonarr is running. Each writes `store.json`, and the restart that triggers applies it.

### Set Admin Password / Reset Admin Password

- **When:** once at setup; again to rotate the password.
- **What it changes:** `adminPassword` in `store.json`; `reconcile` applies it to Sonarr on the restart.
- **Cost:** seconds, then a restart.
- **Repeat safety:** safe; each run replaces the password, the old one stops working, and StartOS asks for confirmation once a password exists.
- **Outputs:** username `admin` and the password, masked and copyable.

### Media Storage

- **When:** at setup, and whenever you add or drop a file manager.
- **What it changes:** `mediaSources` in `store.json`, which decides the mounts and which dependencies are declared.
- **Cost:** a restart.
- **Repeat safety:** safe. Dropping a file manager unmounts it; root folders on it go missing in Sonarr until it is selected again, and nothing on disk is touched.

### Connect qBittorrent / Disconnect qBittorrent

- **When:** once, to connect; again to disconnect. Nothing to redo when qBittorrent's password or key changes.
- **What it changes:** toggles `qbittorrentConnected` in `store.json`, which declares the dependency, mounts qBittorrent's `share/` while qBittorrent is installed, and has `reconcile` create or delete the managed client. StartOS asks for confirmation before disconnecting.
- **Cost:** a restart.
- **Repeat safety:** safe; connecting again reuses the one package-managed client.

## Tasks

| Task               | Raised when                 | Severity | Cleared by         |
| ------------------ | --------------------------- | -------- | ------------------ |
| Set Admin Password | No password in `store.json` | critical | Running the action |
| Media Storage      | No file manager selected    | critical | Running the action |

## Health Checks

| Check         | Probes                   | Failure means                                              |
| ------------- | ------------------------ | ---------------------------------------------------------- |
| Web Interface | `GET /ping` on port 8989 | Sonarr is starting, migrating its database, or has crashed |

`/ping` answers without authentication. The `reconcile` oneshot has no check of its own; its errors are in the service log.

## Backups and Restore

Both volumes, excluding `MediaCover/` (poster and fanart cache, re-downloaded), `logs/`, `logs.db`, and `Backups/` (Sonarr's own scheduled database copies, which the StartOS backup already covers). Sonarr is stopped during the backup, so `sonarr.db` is copied quiescent.

The episode files themselves live in FileBrowser Quantum or NextExplorer and are backed up with that service, not this one. A restore brings back the library database, settings, download clients, the API key and the admin password; restore the file manager too, or Sonarr's root folders point at episodes that are not there.

## Limitations and Differences

1. **Authentication cannot be turned off.** The package always applies Forms login with user `admin` on start; a different username or method set in the UI is reverted.
2. **The API key is fixed by the package.** Regenerating it in the UI lasts only until the next start.
3. **No local media storage.** Episodes go to FileBrowser Quantum or NextExplorer; Sonarr's own volume holds only its configuration.
4. **The `qBittorrent (StartOS)` client's name, host, port, SSL, API key, username and password are reset on every start.** Its other settings, such as the category, are yours.

---

## Quick Reference for AI Consumers

```yaml
package_id: 'sonarr'
image: 'lscr.io/linuxserver/sonarr'
architectures: [x86_64, aarch64]
subcontainers: [sonarr-sub]
volumes:
  main: '/config'
  startos: 'store.json (not mounted)'
dependency_mounts:
  filebrowser: '/mnt/filebrowser (read-write)'
  nextexplorer: '/mnt/nextexplorer (read-write)'
  qbittorrent: '/mnt/qbittorrent (share/, read-only)'
file_models: [store.json, config.xml, share/api-key]
startos_managed_env_vars: [PUID, PGID, TZ]
dependencies:
  - { id: filebrowser, kind: exists, optional: true }
  - { id: nextexplorer, kind: exists, optional: true }
  - { id: qbittorrent, kind: running, optional: true }
interfaces:
  ui: { host_id: ui-multi, port: 8989, type: ui, protocol: http }
actions: [set-admin-password, media-storage, connect-qbittorrent]
tasks:
  - { action: set-admin-password, severity: critical }
  - { action: media-storage, severity: critical }
health_checks: [primary]
oneshots: [reconcile]
api_key: 'store.json apiKey (startos volume); published at startos share/api-key on every init; enforced into config.xml ApiKey on every start'
```
