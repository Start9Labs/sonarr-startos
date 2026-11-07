import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.0.20.3014:4',
  releaseNotes: {
    en_US:
      'Updated the Sonarr container to 4.0.20.3014-ls3 with curl library updates; the Sonarr application is unchanged. Full notes: https://github.com/linuxserver/docker-sonarr/releases/tag/4.0.20.3014-ls3',
    es_ES:
      'Contenedor de Sonarr actualizado a 4.0.20.3014-ls3 con actualizaciones de la biblioteca curl; la aplicación Sonarr no cambia. Notas completas: https://github.com/linuxserver/docker-sonarr/releases/tag/4.0.20.3014-ls3',
    de_DE:
      'Sonarr-Container auf 4.0.20.3014-ls3 mit aktualisierter curl-Bibliothek aktualisiert; die Sonarr-Anwendung bleibt unverändert. Vollständige Hinweise: https://github.com/linuxserver/docker-sonarr/releases/tag/4.0.20.3014-ls3',
    pl_PL:
      'Zaktualizowano kontener Sonarr do 4.0.20.3014-ls3 z aktualizacjami biblioteki curl; aplikacja Sonarr pozostaje bez zmian. Pełne informacje: https://github.com/linuxserver/docker-sonarr/releases/tag/4.0.20.3014-ls3',
    fr_FR:
      'Conteneur Sonarr mis à jour vers 4.0.20.3014-ls3 avec des mises à jour de la bibliothèque curl ; l’application Sonarr reste inchangée. Notes complètes : https://github.com/linuxserver/docker-sonarr/releases/tag/4.0.20.3014-ls3',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
