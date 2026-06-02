import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '로또 당첨금 세금 계산기 - 실수령액 바로 확인',
  description: '로또 1등 당첨되면 세금은 얼마? 당첨금을 입력하면 소득세, 주민세를 자동 계산하고 실수령액을 바로 확인할 수 있습니다. 3억 이하 22%, 3억 초과 33% 세율 적용.',
  keywords: ['로또 세금 계산기', '로또 당첨금 세금', '로또 실수령액', '로또 세금', '복권 세금', '로또 당첨 세금 계산', '로또 세율'],
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
