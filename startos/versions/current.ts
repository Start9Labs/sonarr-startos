import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.0.20.3014:10',
  releaseNotes: {
    en_US:
      'Added Connect Prowlarr: Sonarr now connects itself to Prowlarr on this server, which syncs its indexers to Sonarr. If Prowlarr already syncs to Sonarr, the connection is kept automatically.',
    es_ES:
      'Se añadió Conectar Prowlarr: Sonarr ahora se conecta por sí mismo a Prowlarr en este servidor, que sincroniza sus indexadores con Sonarr. Si Prowlarr ya sincroniza con Sonarr, la conexión se mantiene automáticamente.',
    de_DE:
      'Prowlarr verbinden hinzugefügt: Sonarr verbindet sich jetzt selbst mit Prowlarr auf diesem Server, das seine Indexer mit Sonarr synchronisiert. Synchronisiert Prowlarr bereits mit Sonarr, bleibt die Verbindung automatisch bestehen.',
    pl_PL:
      'Dodano Połącz Prowlarr: Sonarr sam łączy się teraz z Prowlarr na tym serwerze, który synchronizuje do niego swoje indeksatory. Jeśli Prowlarr już synchronizuje się z Sonarr, połączenie zostaje zachowane automatycznie.',
    fr_FR:
      'Ajout de Connecter Prowlarr : Sonarr se connecte désormais lui-même à Prowlarr sur ce serveur, qui synchronise ses indexeurs avec Sonarr. Si Prowlarr synchronise déjà Sonarr, la connexion est conservée automatiquement.',
  },
  migrations: { up: async () => {}, down: IMPOSSIBLE },
})
