import { sdk } from '../sdk'
import { connectQbittorrent } from './connectQbittorrent'
import { mediaStorage } from './mediaStorage'
import { setAdminPassword } from './setAdminPassword'

export const actions = sdk.Actions.of()
  .addAction(setAdminPassword)
  .addAction(mediaStorage)
  .addAction(connectQbittorrent)
