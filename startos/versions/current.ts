import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.0.20.3014:9',
  releaseNotes: {
    en_US:
      'Added Connect NZBGet with automatic credentials and a separate download category. Select the same shared storage as NZBGet for imports. Rebuilt on an updated LinuxServer image with refreshed system packages; Sonarr itself is unchanged. Requires StartOS 0.4.2 or later.',
    es_ES:
      'Se añadió Conectar NZBGet con credenciales automáticas y una categoría de descargas independiente. Seleccione el mismo almacenamiento compartido que NZBGet para importar. Reconstruido sobre una imagen actualizada de LinuxServer con paquetes del sistema renovados; Sonarr no cambia. Requiere StartOS 0.4.2 o posterior.',
    de_DE:
      'NZBGet verbinden mit automatischen Zugangsdaten und eigener Downloadkategorie hinzugefügt. Für Importe denselben gemeinsamen Speicher wie NZBGet wählen. Neu erstellt auf einem aktualisierten LinuxServer-Image mit aufgefrischten Systempaketen; Sonarr selbst ist unverändert. Erfordert StartOS 0.4.2 oder neuer.',
    pl_PL:
      'Dodano Połącz NZBGet z automatycznymi danymi logowania i osobną kategorią pobrań. Do importu wybierz ten sam współdzielony magazyn co NZBGet. Przebudowano na zaktualizowanym obrazie LinuxServer z odświeżonymi pakietami systemowymi; sam Sonarr się nie zmienia. Wymaga StartOS 0.4.2 lub nowszego.',
    fr_FR:
      'Ajout de Connecter NZBGet avec identifiants automatiques et catégorie de téléchargement distincte. Sélectionnez le même stockage partagé que NZBGet pour les imports. Reconstruit sur une image LinuxServer mise à jour avec des paquets système actualisés ; Sonarr lui-même est inchangé. Nécessite StartOS 0.4.2 ou ultérieur.',
  },
  migrations: { up: async () => {}, down: IMPOSSIBLE },
})
