# Updating Sonarr

## Determining the upstream version

Upstream is the LinuxServer image `lscr.io/linuxserver/sonarr`, pinned in `startos/manifest/index.ts`:

```typescript
source: { dockerTag: 'lscr.io/linuxserver/sonarr:4.0.20.3014-ls3' },
```

LinuxServer tags its stable builds `<sonarr version>-ls<build>`; `develop-*` is not stable. The build number can restart (`-ls1` followed `-ls329`), so read the release list in publication order rather than sorting build numbers or trusting the Latest badge:

```bash
gh api 'repos/linuxserver/docker-sonarr/releases?per_page=100' --jq '.[] | select(.draft == false and .prerelease == false) | select(.tag_name | test("^[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+-ls[0-9]+$")) | [.published_at, .tag_name] | @tsv'
```

Confirm the tag ships both architectures before pinning it:

```bash
docker manifest inspect lscr.io/linuxserver/sonarr:<tag> | jq -r '.manifests[].platform.architecture'
```

## Applying the bump

1. Read Sonarr's release notes (`gh release view -R Sonarr/Sonarr v<version>`) between the old and new versions. A major version can change the host-config API or `config.xml` keys this package writes; check both against `startos/main.ts` and `startos/fileModels/config.xml.ts`.
2. Edit `dockerTag` in `startos/manifest/index.ts`.
3. Edit `startos/versions/current.ts`: the version is the Sonarr version without the `-ls` suffix (`'4.0.20.3014:0'`). A new LinuxServer build of the same Sonarr version is a downstream revision bump (`:1`).
