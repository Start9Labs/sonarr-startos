import { mediaStorage } from '../actions/mediaStorage'
import { setAdminPassword } from '../actions/setAdminPassword'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const tasks = sdk.setupOnInit(async (effects) => {
  const store = await storeJson.read().const(effects)
  if (!store?.adminPassword) {
    await sdk.action.createOwnTask(effects, setAdminPassword, 'critical', {
      reason: i18n('Set the admin password before signing in'),
    })
  }
  if (!store?.mediaSources.length) {
    await sdk.action.createOwnTask(effects, mediaStorage, 'critical', {
      reason: i18n('Choose where Sonarr stores your TV library'),
    })
  }
})
