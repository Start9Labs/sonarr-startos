import { manifest as filebrowserManifest } from 'filebrowser-quantum-startos/startos/manifest'
import { manifest as nextexplorerManifest } from 'nextexplorer-startos/startos/manifest'
import { manifest as qbittorrentManifest } from 'qbittorrent-startos/startos/manifest'
import { FileHelper } from '@start9labs/start-sdk'
import {
  uiHostId as qbittorrentHostId,
  uiPort as qbittorrentPort,
} from 'qbittorrent-startos/startos/utils'
import { configXml } from './fileModels/config.xml'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  filebrowserMountpoint,
  nextexplorerMountpoint,
  qbittorrentMountpoint,
  reconcile,
  uiPort,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Sonarr!'))

  const store = await storeJson
    .read((s) => ({
      apiKey: s.apiKey,
      adminPassword: s.adminPassword,
      mediaSources: s.mediaSources,
      qbittorrentConnected: s.qbittorrentConnected,
    }))
    .const(effects)
  if (!store?.apiKey) throw new Error('store.json has no API key')

  await configXml.merge(effects, {
    Config: {
      ApiKey: store.apiKey,
      AuthenticationMethod: 'Forms',
      AuthenticationRequired: 'Enabled',
      BindAddress: '*',
      Port: String(uiPort),
      UrlBase: '',
      TrustedNetworks: await sdk.getOsIp(effects),
    },
  })

  const qbittorrentAddress = store.qbittorrentConnected
    ? await sdk.host
        .getBridgeAddress(effects, {
          packageId: 'qbittorrent',
          hostId: qbittorrentHostId,
          internalPort: qbittorrentPort,
          ssl: false,
        })
        .const()
    : null

  let mounts = sdk.Mounts.of().mountVolume({
    volumeId: 'main',
    subpath: null,
    mountpoint: '/config',
    readonly: false,
  })
  if (store.mediaSources.includes('filebrowser')) {
    mounts = mounts.mountDependency<typeof filebrowserManifest>({
      dependencyId: 'filebrowser',
      volumeId: 'data',
      subpath: null,
      mountpoint: filebrowserMountpoint,
      readonly: false,
    })
  }
  if (store.mediaSources.includes('nextexplorer')) {
    mounts = mounts.mountDependency<typeof nextexplorerManifest>({
      dependencyId: 'nextexplorer',
      volumeId: 'data',
      subpath: null,
      mountpoint: nextexplorerMountpoint,
      readonly: false,
    })
  }

  if (store.qbittorrentConnected) {
    mounts = mounts.mountDependency<typeof qbittorrentManifest>({
      dependencyId: 'qbittorrent',
      volumeId: 'main',
      subpath: 'share',
      mountpoint: qbittorrentMountpoint,
      readonly: true,
    })
  }

  const subcontainer = sdk.SubContainer.of(
    effects,
    { imageId: 'sonarr' },
    mounts,
    'sonarr-sub',
  )

  const qbittorrentApiKey = store.qbittorrentConnected
    ? await FileHelper.string(
        `${await subcontainer.rootfs}${qbittorrentMountpoint}/api-key`,
      )
        .read(
          (key) => key,
          (prev, next) => next === null || prev === next,
        )
        .const(effects)
    : null

  return sdk.Daemons.of(effects)
    .addDaemon('primary', {
      subcontainer,
      exec: {
        command: sdk.useEntrypoint(),
        runAsInit: true,
        env: { PUID: '1000', PGID: '1000', TZ: 'Etc/UTC' },
      },
      ready: {
        display: i18n('Web Interface'),
        fn: () =>
          sdk.healthCheck.checkWebUrl(
            effects,
            `http://127.0.0.1:${uiPort}/ping`,
            {
              successMessage: i18n('The web interface is ready'),
              errorMessage: i18n('The web interface is not ready'),
            },
          ),
      },
      requires: [],
    })
    .addOneshot('reconcile', {
      subcontainer: null,
      exec: {
        fn: async () => {
          await reconcile(effects, store.apiKey, store.adminPassword, {
            connected: store.qbittorrentConnected,
            apiKey: qbittorrentApiKey,
            address: qbittorrentAddress,
          })
          return null
        },
      },
      requires: ['primary'],
    })
})
