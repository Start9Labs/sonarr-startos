# Updating Sonarr

## Determining the upstream version

Upstream is the LinuxServer image `lscr.io/linuxserver/sonarr`, pinned in `startos/manifest/index.ts`:

```typescript
source: { dockerTag: 'lscr.io/linuxserver/sonarr:4.0.20.3014-ls329' },
```

LinuxServer tags its stable builds `<sonarr version>-ls<build>`; its GitHub release marked Latest is the stable one (`develop-*` is not). The build number can restart (`-ls1` followed `-ls329`), so go by Latest, not by the highest number:

```bash
gh release view -R linuxserver/docker-sonarr --json tagName -q .tagName
```

Confirm the tag ships both architectures before pinning it:

```bash
docker manifest inspect lscr.io/linuxserver/sonarr:<tag> | jq -r '.manifests[].platform.architecture'
```

## Applying the bump

1. Read Sonarr's release notes (`gh release view -R Sonarr/Sonarr v<version>`) between the old and new versions. A major version can change the host-config API or `config.xml` keys this package writes; check both against `startos/main.ts` and `startos/fileModels/config.xml.ts`.
2. Edit `dockerTag` in `startos/manifest/index.ts`.
3. Edit `startos/versions/current.ts`: the version is the Sonarr version without the `-ls` suffix (`'4.0.20.3014:0'`), with localized release notes. A new LinuxServer build of the same Sonarr version is a downstream revision bump (`:1`).
4. Install on a box and confirm the login still works and an old password is rejected after Reset Admin Password.
