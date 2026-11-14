import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.0.20.3014:9',
  releaseNotes: {
    en_US:
      'Rebuilt on an updated LinuxServer image of Sonarr 4.0.20.3014 with refreshed system packages; Sonarr itself is unchanged.',
    es_ES:
      'Reconstruido sobre una imagen actualizada de LinuxServer de Sonarr 4.0.20.3014 con paquetes del sistema renovados; Sonarr no cambia.',
    de_DE:
      'Neu erstellt auf einem aktualisierten LinuxServer-Image von Sonarr 4.0.20.3014 mit aufgefrischten Systempaketen; Sonarr selbst ist unverändert.',
    pl_PL:
      'Przebudowano na zaktualizowanym obrazie LinuxServer Sonarr 4.0.20.3014 z odświeżonymi pakietami systemowymi; sam Sonarr się nie zmienia.',
    fr_FR:
      'Reconstruit sur une image LinuxServer mise à jour de Sonarr 4.0.20.3014 avec des paquets système actualisés ; Sonarr lui-même est inchangé.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
