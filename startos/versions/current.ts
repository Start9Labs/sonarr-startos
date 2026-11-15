import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.0.20.3014:8',
  releaseNotes: {
    en_US:
      'Added Connect NZBGet with automatic credentials and a separate download category. Select the same shared storage as NZBGet for imports. Requires StartOS 0.4.2 or later.',
    es_ES:
      'Se añadió Conectar NZBGet con credenciales automáticas y una categoría de descargas independiente. Seleccione el mismo almacenamiento compartido que NZBGet para importar. Requiere StartOS 0.4.2 o posterior.',
    de_DE:
      'NZBGet verbinden mit automatischen Zugangsdaten und eigener Downloadkategorie hinzugefügt. Für Importe denselben gemeinsamen Speicher wie NZBGet wählen. Erfordert StartOS 0.4.2 oder neuer.',
    pl_PL:
      'Dodano Połącz NZBGet z automatycznymi danymi logowania i osobną kategorią pobrań. Do importu wybierz ten sam współdzielony magazyn co NZBGet. Wymaga StartOS 0.4.2 lub nowszego.',
    fr_FR:
      'Ajout de Connecter NZBGet avec identifiants automatiques et catégorie de téléchargement distincte. Sélectionnez le même stockage partagé que NZBGet pour les imports. Nécessite StartOS 0.4.2 ou ultérieur.',
  },
  migrations: { up: async () => {}, down: IMPOSSIBLE },
})
