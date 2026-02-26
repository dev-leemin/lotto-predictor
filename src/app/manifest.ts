import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '내로또 - AI 로또 예측기',
    short_name: '내로또',
    description: 'AI 기반 로또 6/45 번호 예측 및 추천 서비스',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f0f1a',
    theme_color: '#7c3aed',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
