import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Lotto45 - AI 로또 예측기',
    short_name: 'Lotto45',
    description: 'AI 기반 로또 6/45 번호 예측 및 추천 서비스',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F9FAFB',
    theme_color: '#4F46E5',
    categories: ['entertainment', 'utilities'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  }
}