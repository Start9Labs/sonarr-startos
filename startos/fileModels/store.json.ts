import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const nullableString = z.string().nullable().catch(null)

const shape = z.looseObject({
  apiKey: z.string(),
  adminPassword: nullableString,
  mediaSources: z.array(z.enum(['filebrowser', 'nextexplorer'])).catch([]),
  qbittorrentConnected: z.boolean().catch(false),
  qbittorrentClientId: z.number().nullable().catch(null),
  nzbgetConnected: z.boolean().catch(false),
  nzbgetClientId: z.number().nullable().catch(null),
  // Null until decided; Prowlarr's existing record for this app decides it.
  prowlarrConnected: z.boolean().nullable().catch(null),
  prowlarrAppId: z.number().nullable().catch(null),
  // Persists explicit disconnection until its remote cleanup completes.
  prowlarrDisconnectPending: z.boolean().catch(false),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.startos, subpath: '/store.json' },
  shape,
)

export type StoreType = z.infer<typeof shape>
