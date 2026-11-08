import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.0.20.3014:5',
  releaseNotes: {
    en_US:
      'Updated the Sonarr container to 4.0.20.3014-ls4 with a PostgreSQL connection compatibility fix; the Sonarr application is unchanged. Full notes: https://github.com/linuxserver/docker-sonarr/releases/tag/4.0.20.3014-ls4',
    es_ES:
      'Contenedor de Sonarr actualizado a 4.0.20.3014-ls4 con una corrección de compatibilidad de las conexiones PostgreSQL; la aplicación Sonarr no cambia. Notas completas: https://github.com/linuxserver/docker-sonarr/releases/tag/4.0.20.3014-ls4',
    de_DE:
      'Sonarr-Container auf 4.0.20.3014-ls4 mit einer Kompatibilitätskorrektur für PostgreSQL-Verbindungen aktualisiert; die Sonarr-Anwendung bleibt unverändert. Vollständige Hinweise: https://github.com/linuxserver/docker-sonarr/releases/tag/4.0.20.3014-ls4',
    pl_PL:
      'Zaktualizowano kontener Sonarr do 4.0.20.3014-ls4 z poprawką zgodności połączeń PostgreSQL; aplikacja Sonarr pozostaje bez zmian. Pełne informacje: https://github.com/linuxserver/docker-sonarr/releases/tag/4.0.20.3014-ls4',
    fr_FR:
      'Conteneur Sonarr mis à jour vers 4.0.20.3014-ls4 avec un correctif de compatibilité des connexions PostgreSQL ; l’application Sonarr reste inchangée. Notes complètes : https://github.com/linuxserver/docker-sonarr/releases/tag/4.0.20.3014-ls4',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
