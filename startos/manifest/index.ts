import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'sonarr',
  title: 'Sonarr',
  license: 'GPL-3.0',
  packageRepo: 'https://github.com/Start9Labs/sonarr-startos',
  upstreamRepo: 'https://github.com/Sonarr/Sonarr',
  marketingUrl: 'https://sonarr.tv/',
  donationUrl: 'https://opencollective.com/sonarr',
  description: { short, long },
  volumes: ['startos', 'main'],
  images: {
    sonarr: {
      source: { dockerTag: 'lscr.io/linuxserver/sonarr:4.0.20.3014-ls329' },
      arch: ['x86_64', 'aarch64'],
    },
  },
})
