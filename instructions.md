# Sonarr

## Documentation

- [Sonarr Quick Start Guide](https://github.com/Servarr/Wiki/blob/master/sonarr/quick-start-guide.md) — the upstream walkthrough of first setup
- [Sonarr Settings](https://github.com/Servarr/Wiki/blob/master/sonarr/settings.md) — every settings page explained
- [Sonarr FAQ](https://github.com/Servarr/Wiki/blob/master/sonarr/faq.md) — common questions about searching, importing and quality
- [Sonarr Troubleshooting](https://github.com/Servarr/Wiki/blob/master/sonarr/troubleshooting.md) — diagnosing failed downloads and imports

## What you get on StartOS

- The Sonarr web interface, behind a login that is set up for you.
- qBittorrent on this server connected as Sonarr's download client, kept up to date for you.
- Indexers from Prowlarr on this server, once you connect Sonarr from Prowlarr.
- Your TV library kept in FileBrowser Quantum or NextExplorer, where you can browse the files and where Jellyfin can read them.
- Sonarr's settings, history and library database in StartOS backups. The episode files are backed up with FileBrowser Quantum or NextExplorer.

## Getting set up

1. Install FileBrowser Quantum or NextExplorer, if you have neither.
2. Run **Set Admin Password** and save the username and password it shows.
3. Run **Media Storage** and choose FileBrowser Quantum, NextExplorer, or both.
4. In qBittorrent, run **Set Download Location** and choose the same file manager. Sonarr can only import downloads it can see, and moves them fastest when they are on the same file manager as your library.
5. Run **Connect qBittorrent**.
6. If you use Prowlarr, connect Sonarr from Prowlarr's **Connect Apps** action. Indexers you add in Prowlarr then appear in Sonarr on their own.
7. Start Sonarr, open the Web UI, and sign in.
8. In your file manager, create a folder for your TV shows, such as `tv`.
9. In Sonarr, go to **Settings → Media Management → Root Folders → Add Root Folder** and pick that folder:
   - FileBrowser Quantum: `/mnt/filebrowser/tv`
   - NextExplorer: `/mnt/nextexplorer/<location>/tv`, where `<location>` is one of NextExplorer's locations, such as `Files`
10. Point a Jellyfin library at the same folder, then add shows in Sonarr with **Series → Add New**.

## Using Sonarr

- **Reset Admin Password** generates a new password and restarts Sonarr. The old password stops working.
- **Media Storage** changes which file managers Sonarr can use, and restarts Sonarr.
- **Connect qBittorrent** / **Disconnect qBittorrent** adds qBittorrent as a download client, or removes Sonarr's `qBittorrent (StartOS)` download client. The connection follows qBittorrent automatically; there is nothing to redo when qBittorrent's password changes.
- Sonarr's login is managed by StartOS: changing the username or authentication method in Sonarr's settings is undone on the next restart. Use **Reset Admin Password** instead.
