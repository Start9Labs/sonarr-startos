# Sonarr

Sonarr keeps your TV library in a file manager — **FileBrowser Quantum** or **NextExplorer** — so you can browse it there, and so qBittorrent and Jellyfin can use the same files. Install at least one of them before you set Sonarr up.

## Documentation

- [Quick Start Guide](https://github.com/Servarr/Wiki/blob/master/sonarr/quick-start-guide.md) — the upstream walk-through of a first Sonarr setup.
- [Settings](https://github.com/Servarr/Wiki/blob/master/sonarr/settings.md) — the upstream reference for every settings page.
- [FAQ](https://github.com/Servarr/Wiki/blob/master/sonarr/faq.md) — upstream answers to common questions.
- [Troubleshooting](https://github.com/Servarr/Wiki/blob/master/sonarr/troubleshooting.md) — the upstream troubleshooting guide.

## Getting set up

1. Run **Set Admin Password** when prompted. Note the password it shows you; the username is `admin`.
2. Run **Media Storage** when prompted and choose the file manager(s) your TV library lives in.
3. In that file manager, create a folder for your library, such as `TV`.
4. Start Sonarr, open the **Web UI**, and sign in.
5. Under **Settings > Media Management > Root Folders**, add your library folder:
   - FileBrowser Quantum: `/mnt/filebrowser/TV`
   - NextExplorer: `/mnt/nextexplorer/<drive>/TV`, such as `/mnt/nextexplorer/Files/TV`

## Connecting qBittorrent

1. In qBittorrent, run **Set Download Location** and choose the **same** file manager you chose in Sonarr's **Media Storage**. Sonarr can only import downloads it can see, and when both use the same file manager, finished episodes are imported instantly without taking up extra space.
2. In Sonarr, run **Connect qBittorrent**.

Sonarr restarts and shows **qBittorrent (StartOS)** under **Settings > Download Clients**, already set up. Leave **Remote Path Mappings** empty: qBittorrent and Sonarr see your file manager at the same path.

## Connecting Prowlarr

If you run Prowlarr, connect it from Prowlarr's **Connect Apps** action. The indexers you add in Prowlarr then appear in Sonarr under **Settings > Indexers**.

## Actions

- **Set Admin Password** / **Reset Admin Password** — generates a new password for `admin` and shows it once. Sonarr restarts, and the old password stops working.
- **Media Storage** — changes which file managers Sonarr can use. Sonarr restarts. Root folders in a file manager you deselect become unavailable.
- **Connect qBittorrent** / **Disconnect qBittorrent** — adds qBittorrent as a download client, or removes the **qBittorrent (StartOS)** download client. Sonarr restarts. The connection follows qBittorrent automatically; there is nothing to redo when qBittorrent's password changes.

## Limitations

- Sonarr signs in only with the `admin` account and the password from **Set Admin Password**. Changing the authentication method, username or password in **Settings > General** is undone the next time Sonarr starts.
- The **qBittorrent (StartOS)** download client is managed by StartOS: changes to its host, port or authentication in Sonarr are undone the next time Sonarr starts. Download clients you add yourself are left alone.
- The API key is set by StartOS. Regenerating it in **Settings > General** lasts only until Sonarr restarts.
