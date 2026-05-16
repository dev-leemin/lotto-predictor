import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '로또 세금 계산기 - 당첨되면 실수령액은 얼마?',
  description: '로또 당첨되면 세금 얼마나 떼일까? 당첨금을 입력하면 세금과 실수령액을 바로 계산해드립니다. 2026년 기준.',
  keywords: ['로또 세금 계산기', '로또 실수령액', '로또 세금', '로또 당첨금 세금', '복권 세금', '로또 세율', '당첨금 실수령액'],
  alternates: {
    canonical: 'https://lotto45.kr/tax-calculator',
  },
}

export default function TaxCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
