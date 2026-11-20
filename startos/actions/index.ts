import { sdk } from '../sdk'
import { connectQbittorrent } from './connectQbittorrent'
import { connectNzbget } from './connectNzbget'
import { connectProwlarr } from './connectProwlarr'
import { mediaStorage } from './mediaStorage'
import { setAdminPassword } from './setAdminPassword'

export const actions = sdk.Actions.of()
  .addAction(setAdminPassword)
  .addAction(mediaStorage)
  .addAction(connectQbittorrent)
  .addAction(connectNzbget)
  .addAction(connectProwlarr)
