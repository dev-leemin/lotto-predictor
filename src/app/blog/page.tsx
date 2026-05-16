import type { Metadata } from 'next'
import BlogClient from './BlogClient'

export const metadata: Metadata = {
  title: '로또 당첨 꿀팁 블로그 - 전략, 확률, 세금 총정리',
  description: '로또 당첨 전략부터 세금 계산, 확률 분석까지! 로또에 대해 알고 싶은 모든 정보를 쉽게 정리했습니다.',
  keywords: ['로또 블로그', '로또 당첨 팁', '로또 전략', '로또 세금', '로또 확률', '로또 정보'],
  alternates: {
    canonical: 'https://lotto45.kr/blog',
  },
}

export default function BlogPage() {
  return <BlogClient />
}
