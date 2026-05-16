import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '로또 번호 조합 검증기 - 내 번호 괜찮을까?',
  description: '내가 고른 로또 번호가 괜찮은 조합인지 확인해보세요! 홀짝 비율, 합계, 번호대 분포 등을 자동으로 분석합니다.',
  keywords: ['로또 번호 검증', '로또 번호 분석', '로또 번호 조합', '로또 홀짝 비율', '로또 합계', '로또 번호 검증기'],
  alternates: {
    canonical: 'https://lotto45.kr/number-checker',
  },
}

export default function NumberCheckerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
