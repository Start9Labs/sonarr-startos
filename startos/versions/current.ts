import { rm } from 'fs/promises'
import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

export const current = VersionInfo.of({
  version: '4.0.20.3014:7',
  releaseNotes: {
    en_US: 'Connecting qBittorrent now requires qBittorrent 5.3.0:5 or later.',
    es_ES:
      'Conectar qBittorrent ahora requiere qBittorrent 5.3.0:5 o posterior.',
    de_DE:
      'Die Verbindung mit qBittorrent erfordert jetzt qBittorrent 5.3.0:5 oder neuer.',
    pl_PL:
      'Połączenie z qBittorrent wymaga teraz qBittorrent 5.3.0:5 lub nowszego.',
    fr_FR:
      'La connexion à qBittorrent nécessite désormais qBittorrent 5.3.0:5 ou une version ultérieure.',
  },
  migrations: {
    up: async () => {
      await rm(sdk.volumes.startos.subpath('share'), {
        recursive: true,
        force: true,
      })
    },
    down: IMPOSSIBLE,
  },
})
