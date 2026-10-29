import { actions } from '../actions'
import { restoreInit } from '../backups'
import { dependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { sdk } from '../sdk'
import { versionGraph } from '../versions'
import { seedFiles } from './seedFiles'
import { shareApiKey } from './shareApiKey'
import { tasks } from './tasks'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  setInterfaces,
  actions,
  dependencies,
  seedFiles,
  shareApiKey,
  tasks,
)

export const uninit = sdk.setupUninit(versionGraph)
