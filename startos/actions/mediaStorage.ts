import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  mediaSources: Value.multiselect({
    name: i18n('Media Storage'),
    description: i18n(
      '- FileBrowser Quantum: mounted at /mnt/filebrowser\n- NextExplorer: mounted at /mnt/nextexplorer, one folder per location, such as /mnt/nextexplorer/Files',
    ),
    values: {
      filebrowser: i18n('FileBrowser Quantum'),
      nextexplorer: i18n('NextExplorer'),
    },
    default: [],
    minLength: 1,
  }),
})

export const mediaStorage = sdk.Action.withInput(
  'media-storage',

  async () => ({
    name: i18n('Media Storage'),
    description: i18n(
      'Choose which file managers Sonarr stores your TV library in and reads finished downloads from. Each one is mounted read-write, and changing the selection restarts Sonarr.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => ({
    mediaSources:
      (await storeJson.read((s) => s.mediaSources).const(effects)) ?? [],
  }),

  async ({ effects, input }) =>
    storeJson.merge(effects, { mediaSources: input.mediaSources }),
)
