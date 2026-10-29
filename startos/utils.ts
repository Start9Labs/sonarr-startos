import { T } from '@start9labs/start-sdk'
import { storeJson } from './fileModels/store.json'

export const uiPort = 8989
export const uiHostId = 'ui-multi'
export const adminUsername = 'admin'
export const filebrowserMountpoint = '/mnt/filebrowser'
export const nextexplorerMountpoint = '/mnt/nextexplorer'
export const qbittorrentMountpoint = '/mnt/qbittorrent'

const downloadClientName = 'qBittorrent (StartOS)'

type DownloadClient = {
  id: number
  enable: boolean
  fields: { name: string; value?: unknown }[]
}

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

  const storedId =
    (await storeJson.read((s) => s.qbittorrentClientId).once()) ?? null
  const current = (await api<DownloadClient[]>(apiKey, '/downloadclient')).find(
    (c) => c.id === storedId,
  )
  let clientId = current?.id ?? null

  if (!qbittorrent.connected) {
    if (current) await api(apiKey, `/downloadclient/${current.id}`, 'DELETE')
    clientId = null
  } else if (qbittorrent.apiKey && qbittorrent.address) {
    const [host, port] = qbittorrent.address.split(/:(?=\d+$)/)
    // Creating an enabled client tests the connection even with forceSave; updating with forceSave does not.
    const record =
      current ??
      (await api<DownloadClient>(
        apiKey,
        '/downloadclient?forceSave=true',
        'POST',
        {
          ...(
            await api<{ implementation: string }[]>(
              apiKey,
              '/downloadclient/schema',
            )
          ).find((s) => s.implementation === 'QBittorrent'),
          name: downloadClientName,
          enable: false,
        },
      ))
    const values: Record<string, unknown> = {
      host,
      port: Number(port),
      useSsl: false,
      apiKey: qbittorrent.apiKey,
      username: '',
      password: '',
    }
    await api(apiKey, `/downloadclient/${record.id}?forceSave=true`, 'PUT', {
      ...record,
      name: downloadClientName,
      enable: true,
      fields: record.fields.map((f) =>
        f.name in values ? { ...f, value: values[f.name] } : f,
      ),
    })
    clientId = record.id
  }

  if (clientId !== storedId)
    await storeJson.merge(effects, { qbittorrentClientId: clientId })
}
