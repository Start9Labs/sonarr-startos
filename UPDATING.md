# Updating Sonarr

## Determining the upstream version

Upstream is Sonarr's stable release, as published in linuxserver's image. Sonarr's GitHub releases list develop builds too; take the latest **stable** release:

```bash
gh release view -R Sonarr/Sonarr --json tagName -q .tagName
```

linuxserver tags it `<version>-ls<build>`. Find the newest tag for that version and confirm it is published for amd64 and arm64:

```bash
gh api 'repos/linuxserver/docker-sonarr/releases?per_page=30' --jq '.[].tag_name' | grep -v '^develop-'
docker manifest inspect lscr.io/linuxserver/sonarr:<tag> | jq -r '.manifests[].platform.architecture'
```

The pin lives in `startos/manifest/index.ts`:

```typescript
dockerTag: 'lscr.io/linuxserver/sonarr:4.0.20.3014-ls329',
```

## Applying the bump

1. Edit `dockerTag` in `startos/manifest/index.ts`.
2. Edit `startos/versions/current.ts`: the version is Sonarr's own version (`4.0.20.3014:0`), without the `-ls` suffix. A new linuxserver build of the same Sonarr version bumps the revision (`:1`).
3. Check upstream's release notes for changes to `/api/v3/config/host` or to the `config.xml` keys the package writes (`ApiKey`, `AuthenticationMethod`, `AuthenticationRequired`, `AnalyticsEnabled`).
