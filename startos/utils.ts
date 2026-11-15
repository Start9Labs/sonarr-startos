import { T } from '@start9labs/start-sdk'
import {
  ArrApi,
  downloadClientAddressFields,
  reconcileArrDownloadClient,
} from 'nzbget-startos/startos/utils'
import { storeJson } from './fileModels/store.json'

export const uiPort = 8989
export const uiHostId = 'ui-multi'
export const adminUsername = 'admin'
// Shared media paths must match qBittorrent, NZBGet and Jellyfin.
export const filebrowserMountpoint = '/mnt/filebrowser'
export const nextexplorerMountpoint = '/mnt/nextexplorer'
export const qbittorrentMountpoint = '/mnt/qbittorrent'
export const nzbgetMountpoint = '/mnt/nzbget'

const local = `http://127.0.0.1:${uiPort}`

async function api<A>(
  apiKey: string,
  path: string,
  method = 'GET',
  body?: unknown,
): Promise<A> {
  const res = await fetch(`${local}/api/v3${path}`, {
    method,
    headers: { 'X-Api-Key': apiKey, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${text}`)
  return JSON.parse(text || 'null')
}

async function canLogIn(password: string) {
  const res = await fetch(`${local}/login`, {
    method: 'POST',
    body: new URLSearchParams({ username: adminUsername, password }),
    redirect: 'manual',
  })
  return (
    res.status === 302 && !res.headers.get('location')?.includes('loginFailed')
  )
}

export async function reconcile(
  effects: T.Effects,
  apiKey: string,
  adminPassword: string | null,
  qbittorrent: {
    connected: boolean
    apiKey: string | null
    address: string | null
  },
  nzbget: {
    connected: boolean
    credentials: { username: string; password: string } | null
    address: string | null
  },
) {
  if (adminPassword && !(await canLogIn(adminPassword))) {
    const host = await api<object>(apiKey, '/config/host')
    await api(apiKey, '/config/host', 'PUT', {
      ...host,
      authenticationMethod: 'forms',
      authenticationRequired: 'enabled',
      username: adminUsername,
      password: adminPassword,
      passwordConfirmation: adminPassword,
    })
  }
  const request: ArrApi = (path, method, body) =>
    api(apiKey, path, method, body)
  const store = await storeJson.read().once()
  const qbittorrentClientId = await reconcileArrDownloadClient(request, {
    storedId: store?.qbittorrentClientId ?? null,
    name: 'qBittorrent (StartOS)',
    implementation: 'QBittorrent',
    connected: qbittorrent.connected,
    values:
      qbittorrent.address && qbittorrent.apiKey
        ? {
            ...downloadClientAddressFields(qbittorrent.address),
            apiKey: qbittorrent.apiKey,
            username: '',
            password: '',
          }
        : null,
  })
  const nzbgetClientId = await reconcileArrDownloadClient(request, {
    storedId: store?.nzbgetClientId ?? null,
    name: 'NZBGet (StartOS)',
    implementation: 'Nzbget',
    connected: nzbget.connected,
    values:
      nzbget.address && nzbget.credentials
        ? {
            ...downloadClientAddressFields(nzbget.address),
            username: nzbget.credentials.username,
            password: nzbget.credentials.password,
          }
        : null,
    // Must name a category seeded by NZBGet.
    defaults: { tvCategory: 'sonarr' },
  })
  if (
    qbittorrentClientId !== (store?.qbittorrentClientId ?? null) ||
    nzbgetClientId !== (store?.nzbgetClientId ?? null)
  )
    await storeJson.merge(effects, { qbittorrentClientId, nzbgetClientId })
}
