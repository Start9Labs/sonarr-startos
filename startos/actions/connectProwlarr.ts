import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const connectProwlarr = sdk.Action.withoutInput(
  'connect-prowlarr',
  async ({ effects }) => {
    const connected = await storeJson
      .read((s) => s.prowlarrConnected)
      .const(effects)
    return {
      name: connected ? i18n('Disconnect Prowlarr') : i18n('Connect Prowlarr'),
      description: i18n(
        'Sync the indexers in Prowlarr on this server to Sonarr. Changing the connection restarts Sonarr.',
      ),
      warning: connected
        ? i18n(
            'Removes the Sonarr (StartOS) application from Prowlarr. Indexers it already synced stay in Sonarr.',
          )
        : null,
      allowedStatuses: 'any',
      group: null,
      visibility: 'enabled',
    }
  },
  async ({ effects }) => {
    await storeJson.update(effects, (store) => {
      if (!store) throw new Error('store.json is missing')
      const connected = !store.prowlarrConnected
      return {
        ...store,
        prowlarrConnected: connected,
        prowlarrDisconnectPending: !connected,
      }
    })
    return null
  },
)
