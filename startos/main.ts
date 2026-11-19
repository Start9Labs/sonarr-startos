import { manifest as filebrowserManifest } from 'filebrowser-quantum-startos/startos/manifest'
import { manifest as nextexplorerManifest } from 'nextexplorer-startos/startos/manifest'
import { manifest as qbittorrentManifest } from 'qbittorrent-startos/startos/manifest'
import { FileHelper } from '@start9labs/start-sdk'
import { manifest as nzbgetManifest } from 'nzbget-startos/startos/manifest'
import { credentialsShape } from 'nzbget-startos/startos/fileModels/credentials'
import {
  uiHostId as nzbgetHostId,
  uiPort as nzbgetPort,
} from 'nzbget-startos/startos/utils'
import {
  uiHostId as qbittorrentHostId,
  uiPort as qbittorrentPort,
} from 'qbittorrent-startos/startos/utils'
import { manifest as prowlarrManifest } from 'prowlarr-startos/startos/manifest'
import {
  legacyApplicationsShape,
  reconcileProwlarrApplication,
  uiHostId as prowlarrHostId,
  uiPort as prowlarrPort,
} from 'prowlarr-startos/startos/utils'
import { configXml } from './fileModels/config.xml'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  filebrowserMountpoint,
  nextexplorerMountpoint,
  qbittorrentMountpoint,
  nzbgetMountpoint,
  prowlarrMountpoint,
  reconcile,
  uiHostId,
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
      nzbgetConnected: s.nzbgetConnected,
      prowlarrConnected: s.prowlarrConnected,
      prowlarrLegacyPending: s.prowlarrLegacyPending,
      prowlarrRemovalPending: s.prowlarrRemovalPending,
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

  const nzbgetAddress = store.nzbgetConnected
    ? await sdk.host
        .getBridgeAddress(effects, {
          packageId: 'nzbget',
          hostId: nzbgetHostId,
          internalPort: nzbgetPort,
          ssl: false,
        })
        .const()
    : null

  const prowlarrAddress =
    store.prowlarrConnected !== false ||
    store.prowlarrLegacyPending ||
    store.prowlarrRemovalPending
      ? await sdk.host
          .getBridgeAddress(effects, {
            packageId: 'prowlarr',
            hostId: prowlarrHostId,
            internalPort: prowlarrPort,
            ssl: false,
          })
          .const()
      : null
  const ownAddress = prowlarrAddress
    ? await sdk.host
        .getBridgeAddress(effects, {
          hostId: uiHostId,
          internalPort: uiPort,
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
  const installed = (id: 'filebrowser' | 'nextexplorer') =>
    sdk.getServiceManifest(effects, id, (m) => m !== null).const()
  if (
    store.mediaSources.includes('filebrowser') &&
    (await installed('filebrowser'))
  ) {
    mounts = mounts.mountDependency<typeof filebrowserManifest>({
      dependencyId: 'filebrowser',
      volumeId: 'data',
      subpath: null,
      mountpoint: filebrowserMountpoint,
      readonly: false,
    })
  }
  if (
    store.mediaSources.includes('nextexplorer') &&
    (await installed('nextexplorer'))
  ) {
    mounts = mounts.mountDependency<typeof nextexplorerManifest>({
      dependencyId: 'nextexplorer',
      volumeId: 'data',
      subpath: null,
      mountpoint: nextexplorerMountpoint,
      readonly: false,
    })
  }

  // The address is null while qBittorrent is uninstalled, when its volume can't be mounted.
  if (qbittorrentAddress) {
    mounts = mounts.mountDependency<typeof qbittorrentManifest>({
      dependencyId: 'qbittorrent',
      volumeId: 'public',
      subpath: null,
      mountpoint: qbittorrentMountpoint,
      readonly: true,
    })
  }

  if (nzbgetAddress)
    mounts = mounts.mountDependency<typeof nzbgetManifest>({
      dependencyId: 'nzbget',
      volumeId: 'public',
      subpath: null,
      mountpoint: nzbgetMountpoint,
      readonly: true,
    })

  if (prowlarrAddress)
    mounts = mounts.mountDependency<typeof prowlarrManifest>({
      dependencyId: 'prowlarr',
      volumeId: 'public',
      subpath: null,
      mountpoint: prowlarrMountpoint,
      readonly: true,
    })

  const subcontainer = sdk.SubContainer.of(
    effects,
    { imageId: 'sonarr' },
    mounts,
    'sonarr-sub',
  )

  const qbittorrentApiKey = qbittorrentAddress
    ? await FileHelper.string(
        `${await subcontainer.rootfs}${qbittorrentMountpoint}/api-key`,
      )
        .read(
          (key) => key,
          (prev, next) => next === null || prev === next,
        )
        .const(effects)
    : null

  const nzbgetCredentials = nzbgetAddress
    ? await FileHelper.json(
        `${await subcontainer.rootfs}${nzbgetMountpoint}/credentials.json`,
        credentialsShape,
      )
        .read(({ username, password }) => ({ username, password }))
        .const(effects)
    : null

  const prowlarrApiKey = prowlarrAddress
    ? await FileHelper.string(
        `${await subcontainer.rootfs}${prowlarrMountpoint}/api-key`,
      )
        .read(
          (key) => key,
          (prev, next) => next === null || prev === next,
        )
        .const(effects)
    : null

  const prowlarrLegacy =
    prowlarrAddress && store.prowlarrLegacyPending
      ? await FileHelper.json(
          `${await subcontainer.rootfs}${prowlarrMountpoint}/legacy-applications.json`,
          legacyApplicationsShape,
        )
          .read()
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
          await reconcile(
            effects,
            store.apiKey,
            store.adminPassword,
            {
              connected: store.qbittorrentConnected,
              apiKey: qbittorrentApiKey,
              address: qbittorrentAddress,
            },
            {
              connected: store.nzbgetConnected,
              credentials: nzbgetCredentials,
              address: nzbgetAddress,
            },
          )
          return null
        },
      },
      requires: ['primary'],
    })
    .addOneshot('prowlarr', {
      subcontainer: null,
      exec: {
        fn: async (_, signal) => {
          if (!prowlarrAddress && !store.prowlarrRemovalPending) return null
          if (prowlarrAddress && !prowlarrApiKey) return null
          if (
            prowlarrAddress &&
            store.prowlarrLegacyPending &&
            prowlarrLegacy === null
          )
            return null
          const legacy = prowlarrLegacy?.sonarr ?? null
          const storedId =
            (await storeJson.read((s) => s.prowlarrAppId).once()) ??
            legacy?.appId ??
            null
          const { connected, appId } =
            prowlarrAddress && prowlarrApiKey
              ? await reconcileProwlarrApplication(
                  { address: prowlarrAddress, apiKey: prowlarrApiKey },
                  {
                    id: 'sonarr',
                    storedId,
                    connected: store.prowlarrConnected,
                    legacy,
                    values: ownAddress
                      ? {
                          baseUrl: `http://${ownAddress}`,
                          apiKey: store.apiKey,
                        }
                      : null,
                  },
                )
              : { connected: false, appId: null }
          await storeJson.update(effects, (current) => {
            if (
              current === null ||
              signal.aborted ||
              current.prowlarrConnected !== store.prowlarrConnected ||
              current.prowlarrLegacyPending !== store.prowlarrLegacyPending ||
              current.prowlarrRemovalPending !== store.prowlarrRemovalPending
            )
              return null
            return {
              ...current,
              prowlarrConnected: connected,
              prowlarrAppId: appId,
              prowlarrLegacyPending: false,
              prowlarrRemovalPending: false,
            }
          })
          return null
        },
      },
      requires: [],
    })
})
