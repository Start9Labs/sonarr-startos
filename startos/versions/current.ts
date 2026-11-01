import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.0.20.3014:2',
  releaseNotes: {
    en_US:
      'Updated the LinuxServer image to 4.0.20.3014-ls2 with runtime dependency updates and Kerberos libraries for PostgreSQL support. Sonarr remains at 4.0.20.3014. Full image changes: https://github.com/linuxserver/docker-sonarr/compare/4.0.20.3014-ls329...4.0.20.3014-ls2',
    es_ES:
      'Imagen de LinuxServer actualizada a 4.0.20.3014-ls2 con actualizaciones de dependencias de ejecución y bibliotecas Kerberos para compatibilidad con PostgreSQL. Sonarr sigue en 4.0.20.3014. Cambios completos de la imagen: https://github.com/linuxserver/docker-sonarr/compare/4.0.20.3014-ls329...4.0.20.3014-ls2',
    de_DE:
      'LinuxServer-Image auf 4.0.20.3014-ls2 aktualisiert, mit aktualisierten Laufzeitabhängigkeiten und Kerberos-Bibliotheken für PostgreSQL-Unterstützung. Sonarr bleibt bei 4.0.20.3014. Alle Image-Änderungen: https://github.com/linuxserver/docker-sonarr/compare/4.0.20.3014-ls329...4.0.20.3014-ls2',
    pl_PL:
      'Zaktualizowano obraz LinuxServer do 4.0.20.3014-ls2, odświeżając zależności uruchomieniowe i dodając biblioteki Kerberos do obsługi PostgreSQL. Sonarr pozostaje w wersji 4.0.20.3014. Pełna lista zmian obrazu: https://github.com/linuxserver/docker-sonarr/compare/4.0.20.3014-ls329...4.0.20.3014-ls2',
    fr_FR:
      'Image LinuxServer mise à jour vers 4.0.20.3014-ls2 avec des dépendances d’exécution actualisées et les bibliothèques Kerberos pour la prise en charge de PostgreSQL. Sonarr reste en version 4.0.20.3014. Liste complète des changements de l’image : https://github.com/linuxserver/docker-sonarr/compare/4.0.20.3014-ls329...4.0.20.3014-ls2',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
