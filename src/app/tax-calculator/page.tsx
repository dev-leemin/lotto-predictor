'use client'

import { useState, useMemo } from 'react'
import AdBanner from '@/components/AdBanner'

export default function TaxCalculatorPage() {
  const [inputValue, setInputValue] = useState('')

  const amount = useMemo(() => {
    const num = parseInt(inputValue.replace(/[^0-9]/g, ''), 10)
    return isNaN(num) ? 0 : num
  }, [inputValue])

  const taxResult = useMemo(() => {
    if (amount === 0) {
      return { tax22: 0, tax33: 0, totalTax: 0, netAmount: 0, effectiveRate: 0 }
    }

    // 5만원 이하 비과세
    if (amount <= 50000) {
      return { tax22: 0, tax33: 0, totalTax: 0, netAmount: amount, effectiveRate: 100 }
    }

    const THREE_HUNDRED_MILLION = 300000000 // 3억

    let tax22 = 0
    let tax33 = 0

    if (amount <= THREE_HUNDRED_MILLION) {
      tax22 = Math.floor(amount * 0.22)
      tax33 = 0
    } else {
      tax22 = Math.floor(THREE_HUNDRED_MILLION * 0.22)
      tax33 = Math.floor((amount - THREE_HUNDRED_MILLION) * 0.33)
    }

    const totalTax = tax22 + tax33
    const netAmount = amount - totalTax
    const effectiveRate = (netAmount / amount) * 100

    return { tax22, tax33, totalTax, netAmount, effectiveRate }
  }, [amount])

  const formatNumber = (num: number): string => {
    return num.toLocaleString('ko-KR')
  }

  const formatKoreanCurrency = (num: number): string => {
    if (num === 0) return '0원'
    const eok = Math.floor(num / 100000000)
    const man = Math.floor((num % 100000000) / 10000)
    const rest = num % 10000
    let result = ''
    if (eok > 0) result += `${eok}억 `
    if (man > 0) result += `${man}만 `
    if (rest > 0) result += `${rest.toLocaleString('ko-KR')}`
    return result.trim() + '원'
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    if (raw === '') {
      setInputValue('')
      return
    }
    const num = parseInt(raw, 10)
    setInputValue(num.toLocaleString('ko-KR'))
  }

  const handleQuickAmount = (value: number) => {
    setInputValue(value.toLocaleString('ko-KR'))
  }

  const quickAmounts = [
    { label: '1억', value: 100000000 },
    { label: '5억', value: 500000000 },
    { label: '10억', value: 1000000000 },
    { label: '20억', value: 2000000000 },
    { label: '50억', value: 5000000000 },
  ]

  const taxBrackets = useMemo(() => {
    if (amount <= 50000) {
      return [
        { label: '비과세', rate: '0%', color: 'bg-emerald-400', width: 100, amount: amount },
      ]
    }

    const THREE_HUNDRED_MILLION = 300000000

    if (amount <= THREE_HUNDRED_MILLION) {
      return [
        { label: '22% 구간', rate: '22%', color: 'bg-indigo-400', width: 100, amount: amount },
      ]
    }

    const ratio22 = (THREE_HUNDRED_MILLION / amount) * 100
    const ratio33 = ((amount - THREE_HUNDRED_MILLION) / amount) * 100

    return [
      { label: '22% 구간', rate: '22%', color: 'bg-indigo-400', width: ratio22, amount: THREE_HUNDRED_MILLION },
      { label: '33% 구간', rate: '33%', color: 'bg-rose-400', width: ratio33, amount: amount - THREE_HUNDRED_MILLION },
    ]
  }, [amount])

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: '로또 당첨금도 종합소득세 신고를 해야 하나요?', acceptedAnswer: { '@type': 'Answer', text: '아닙니다. 복권 당첨금은 원천징수로 납세 의무가 종결되는 분리과세 대상입니다. 별도의 종합소득세 신고가 필요 없습니다.' } },
      { '@type': 'Question', name: '연금복권과 로또의 세금 차이는?', acceptedAnswer: { '@type': 'Answer', text: '연금복권 1등(월 700만원)은 매월 22%가 원천징수됩니다. 매월 분할 지급되므로 33% 구간에 해당되지 않는 것이 특징입니다.' } },
      { '@type': 'Question', name: '당첨금을 가족에게 나눠주면?', acceptedAnswer: { '@type': 'Answer', text: '당첨금을 타인에게 증여할 경우 증여세가 별도로 부과됩니다. 배우자 6억원, 성인 자녀 5,000만원까지 면제이며 초과분에 대해 10~50% 증여세가 발생합니다.' } },
    ],
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: 'https://lotto45.kr' },
      { '@type': 'ListItem', position: 2, name: '세금 계산기', item: 'https://lotto45.kr/tax-calculator' },
    ],
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <main className="max-w-4xl mx-auto px-4 py-8 pb-24 lg:pb-8">
        {/* 브레드크럼 */}
        <nav className="text-xs text-gray-500 mb-6">
          <a href="/" className="hover:text-indigo-600">홈</a>
          <span className="mx-2">/</span>
          <span className="text-gray-900">세금 계산기</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">로또 당첨금 세금 계산기</h1>
        <p className="text-sm text-gray-500 mb-8">
          당첨금을 입력하면 세율, 세금, 실수령액을 자동으로 계산합니다. 2026년 세법 기준.
        </p>

        {/* 교육 콘텐츠 */}
        <section className="space-y-6 mb-10">
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">로또 당첨금 세금 구조 이해하기</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              한국의 복권 당첨금은 「소득세법」 제21조에 따른 <strong className="text-indigo-600">기타소득</strong>으로 분류됩니다.
              당첨금은 지급 시점에 세금이 자동 공제되는 <strong className="text-indigo-600">원천징수</strong> 방식으로 처리되며,
              별도의 종합소득세 신고가 필요 없는 분리과세 대상입니다.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              세율은 당첨금 규모에 따라 3단계로 나뉩니다. 5만원 이하(4등·5등)는 비과세,
              5만원 초과~3억원 이하는 소득세 20%에 지방소득세 2%를 합한 22%,
              3억원을 초과하는 금액에 대해서는 소득세 30%와 지방소득세 3%를 합산한 33%가 적용됩니다.
              여기서 22%, 33%는 지방소득세가 포함된 실효 세율입니다.
            </p>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">실제 계산 예시</h2>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <h3 className="text-sm font-bold text-amber-800 mb-2">1등 20억 원 당첨 시</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  3억 × 22% = 6,600만 원 + 17억 × 33% = 5억 6,100만 원<br />
                  총 세금 약 <strong className="text-red-600">6억 2,700만 원</strong> → 실수령 약 <strong className="text-indigo-600">13억 7,300만 원</strong>
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <h3 className="text-sm font-bold text-gray-700 mb-2">2등 5,000만 원 당첨 시</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  5,000만 원 × 22% = 1,100만 원 → 실수령 약 <strong className="text-indigo-600">3,900만 원</strong>
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <h3 className="text-sm font-bold text-gray-700 mb-2">3등 150만 원 당첨 시</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  150만 원 × 22% = 33만 원 → 실수령 약 <strong className="text-indigo-600">117만 원</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">자주 묻는 질문</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Q. 로또 당첨금도 종합소득세 신고를 해야 하나요?</h3>
                <p className="text-sm text-gray-600 leading-relaxed">아닙니다. 복권 당첨금은 원천징수로 납세 의무가 종결되는 분리과세 대상입니다. 지급 시 세금이 자동 공제되므로 별도의 종합소득세 신고가 필요 없습니다.</p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Q. 연금복권과 로또의 세금 차이는?</h3>
                <p className="text-sm text-gray-600 leading-relaxed">연금복권 1등(월 700만 원)은 매월 지급액에서 22%가 원천징수됩니다. 로또와 동일한 세율이 적용되지만, 매월 분할 지급되므로 각 지급분이 3억 이하여서 33% 구간에 해당되지 않는 것이 특징입니다.</p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Q. 당첨금을 가족에게 나눠주면?</h3>
                <p className="text-sm text-gray-600 leading-relaxed">당첨금을 타인에게 증여할 경우 증여세가 별도로 부과됩니다. 배우자 6억 원, 성인 자녀 5,000만 원까지 증여세 면제이며, 초과분에 대해 10~50%의 증여세가 추가로 발생합니다.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 입력 섹션 */}
        <section className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 sm:p-6 mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">W</span>
            당첨금 입력
          </h2>

          <div className="relative mb-4">
            <input
              type="text"
              inputMode="numeric"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="당첨금을 입력하세요"
              className="w-full px-4 py-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-lg sm:text-xl font-bold placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">원</span>
          </div>

          {amount > 0 && (
            <p className="text-xs text-gray-400 mb-4">
              = {formatKoreanCurrency(amount)}
            </p>
          )}

          {/* 빠른 입력 버튼 */}
          <div className="flex flex-wrap gap-2">
            {quickAmounts.map((qa) => (
              <button
                key={qa.value}
                onClick={() => handleQuickAmount(qa.value)}
                className="px-4 py-2 rounded-lg text-sm text-indigo-600 font-medium bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
              >
                {qa.label}
              </button>
            ))}
            <button
              onClick={() => { setInputValue('') }}
              className="px-4 py-2 rounded-lg text-sm text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700 transition-colors"
            >
              초기화
            </button>
          </div>
        </section>

        {/* 세율 구간 시각적 바 */}
        {amount > 0 && (
          <section className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 sm:p-6 mb-6">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600 shrink-0">%</span>
              세율 구간
            </h2>

            <div className="mb-4">
              <div className="flex rounded-lg overflow-hidden h-8">
                {taxBrackets.map((bracket, idx) => (
                  <div
                    key={idx}
                    className={`${bracket.color} flex items-center justify-center text-xs font-bold text-white transition-all duration-500`}
                    style={{ width: `${bracket.width}%`, minWidth: bracket.width > 0 ? '40px' : '0' }}
                  >
                    {bracket.rate}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {amount <= 50000 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 shrink-0" />
                    <span className="text-sm text-gray-700">비과세 (5만원 이하)</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">세금 없음</span>
                </div>
              )}
              {amount > 50000 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-50 border border-indigo-200">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-indigo-400 shrink-0" />
                    <span className="text-sm text-gray-700">3억 이하 구간 (22%)</span>
                  </div>
                  <span className="text-sm font-bold text-indigo-600">
                    {amount <= 300000000
                      ? formatKoreanCurrency(amount)
                      : formatKoreanCurrency(300000000)}
                  </span>
                </div>
              )}
              {amount > 300000000 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-rose-50 border border-rose-200">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-400 shrink-0" />
                    <span className="text-sm text-gray-700">3억 초과 구간 (33%)</span>
                  </div>
                  <span className="text-sm font-bold text-rose-600">
                    {formatKoreanCurrency(amount - 300000000)}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-xs text-gray-500 leading-relaxed">
                * 로또 당첨금 세율: 5만원 이하 비과세 / 5만원 초과 ~ 3억원 이하 22% (소득세 20% + 지방소득세 2%) / 3억원 초과 33% (소득세 30% + 지방소득세 3%)
              </p>
            </div>
          </section>
        )}

        {/* 계산 결과 */}
        {amount > 0 && (
          <section className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 sm:p-6 mb-6">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-600 shrink-0">$</span>
              계산 결과
            </h2>

            <div className="p-4 sm:p-5 rounded-xl bg-indigo-50 border border-indigo-200 mb-5">
              <p className="text-xs text-gray-500 mb-1">실수령액</p>
              <p className="text-2xl sm:text-3xl font-bold text-indigo-600">
                {formatNumber(taxResult.netAmount)}원
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {formatKoreanCurrency(taxResult.netAmount)}
              </p>
            </div>

            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">실수령 비율</span>
                <span className="text-sm font-bold text-indigo-600">{taxResult.effectiveRate.toFixed(1)}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${taxResult.effectiveRate}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-400">0%</span>
                <span className="text-xs text-gray-400">100%</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                <span className="text-sm text-gray-500">당첨금</span>
                <span className="text-sm font-bold text-gray-900">{formatNumber(amount)}원</span>
              </div>

              {amount > 50000 && (
                <>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div>
                      <span className="text-sm text-gray-500">3억 이하 구간 세금 (22%)</span>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {amount <= 300000000
                          ? `${formatNumber(amount)} x 22%`
                          : `${formatNumber(300000000)} x 22%`}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-red-500">-{formatNumber(taxResult.tax22)}원</span>
                  </div>

                  {amount > 300000000 && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                      <div>
                        <span className="text-sm text-gray-500">3억 초과 구간 세금 (33%)</span>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatNumber(amount - 300000000)} x 33%
                        </p>
                      </div>
                      <span className="text-sm font-bold text-red-500">-{formatNumber(taxResult.tax33)}원</span>
                    </div>
                  )}

                  <div className="h-px bg-gray-200" />

                  <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200">
                    <span className="text-sm font-medium text-gray-700">총 세금</span>
                    <span className="text-sm font-bold text-red-500">-{formatNumber(taxResult.totalTax)}원</span>
                  </div>
                </>
              )}

              {amount <= 50000 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="text-sm font-medium text-gray-700">세금</span>
                  <span className="text-sm font-bold text-emerald-600">0원 (비과세)</span>
                </div>
              )}

              <div className="h-px bg-gray-200" />

              <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                <span className="text-sm font-bold text-gray-900">실수령액</span>
                <span className="text-base font-bold text-indigo-600">{formatNumber(taxResult.netAmount)}원</span>
              </div>
            </div>
          </section>
        )}

        {/* 세율 기준 안내 */}
        <section className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 sm:p-6 mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-600 shrink-0">i</span>
            세율 기준 안내
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-3 text-gray-500 font-medium">당첨금 구간</th>
                  <th className="text-center py-3 px-3 text-gray-500 font-medium">소득세</th>
                  <th className="text-center py-3 px-3 text-gray-500 font-medium">지방소득세</th>
                  <th className="text-center py-3 px-3 text-gray-500 font-medium">합계 세율</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-3 text-gray-700">5만원 이하</td>
                  <td className="py-3 px-3 text-center text-emerald-600 font-bold">-</td>
                  <td className="py-3 px-3 text-center text-emerald-600 font-bold">-</td>
                  <td className="py-3 px-3 text-center text-emerald-600 font-bold">비과세</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-3 text-gray-700">5만원 초과 ~ 3억원 이하</td>
                  <td className="py-3 px-3 text-center text-indigo-600 font-bold">20%</td>
                  <td className="py-3 px-3 text-center text-indigo-600 font-bold">2%</td>
                  <td className="py-3 px-3 text-center text-indigo-600 font-bold">22%</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 text-gray-700">3억원 초과</td>
                  <td className="py-3 px-3 text-center text-rose-600 font-bold">30%</td>
                  <td className="py-3 px-3 text-center text-rose-600 font-bold">3%</td>
                  <td className="py-3 px-3 text-center text-rose-600 font-bold">33%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 관련 블로그 링크 */}
        <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 mb-6">
          <h2 className="text-sm font-bold text-gray-900 mb-2">관련 글</h2>
          <a
            href="/blog/lotto-tax-guide"
            className="flex items-center gap-3 group"
          >
            <span className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-xs text-red-600 shrink-0 font-bold">T</span>
            <div>
              <p className="text-sm text-indigo-600 group-hover:text-indigo-500 transition-colors font-medium">
                로또 당첨금 세금 완벽 가이드 - 실수령액 계산법
              </p>
              <p className="text-xs text-gray-500 mt-0.5">등수별 세율, 절세 팁, 실수령액 비교까지 총정리</p>
            </div>
          </a>
        </div>

        <div className="mt-6 sm:mt-8">
          <AdBanner slot="tax-bottom" />
        </div>

        {/* 면책 문구 */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
          <p className="text-xs text-amber-600 leading-relaxed">
            본 계산기는 참고용이며, 정확한 세금은 세무사와 상담하세요.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            세법 변경 시 실제 세율이 달라질 수 있습니다.
          </p>
        </div>
      </main>
    </div>
  )
}
