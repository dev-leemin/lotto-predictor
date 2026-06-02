import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '로또 번호 조합 검증기 - 내 번호 분석하기',
  description: '내가 고른 로또 번호, 괜찮은 조합일까? 홀짝 비율, 고저 분포, 합계 범위, 연번 여부 등 6가지 지표로 번호 조합을 무료로 분석해 드립니다.',
  keywords: ['로또 번호 검증', '로또 번호 분석', '로또 번호 조합', '로또번호 확인', '로또 번호 검사', '복권번호 분석'],
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
