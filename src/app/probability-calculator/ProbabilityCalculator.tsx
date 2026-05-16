'use client'

import { useState, useMemo } from 'react'

const TOTAL_COMBINATIONS = 8_145_060
const TICKET_PRICE = 1000

const PRIZES = [
  { rank: 1, label: '1등', match: '6개 일치', cases: 1, avgPrize: 2_000_000_000, textColor: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', barColor: 'bg-amber-400' },
  { rank: 2, label: '2등', match: '5개+보너스', cases: 6, avgPrize: 50_000_000, textColor: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', barColor: 'bg-gray-400' },
  { rank: 3, label: '3등', match: '5개 일치', cases: 228, avgPrize: 1_500_000, textColor: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', barColor: 'bg-orange-400' },
  { rank: 4, label: '4등', match: '4개 일치', cases: 11_115, avgPrize: 50_000, textColor: 'text-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200', barColor: 'bg-indigo-400' },
  { rank: 5, label: '5등', match: '3개 일치', cases: 182_780, avgPrize: 5_000, textColor: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', barColor: 'bg-emerald-400' },
]

const QUICK_AMOUNTS = [1, 5, 10, 50, 100]

function calcProbability(casesPerTicket: number, tickets: number): number {
  const p = casesPerTicket / TOTAL_COMBINATIONS
  return 1 - Math.pow(1 - p, tickets)
}

function formatProbability(prob: number): string {
  if (prob < 0.000001) return prob.toExponential(2)
  if (prob < 0.0001) return (prob * 100).toFixed(6) + '%'
  if (prob < 0.01) return (prob * 100).toFixed(4) + '%'
  if (prob < 1) return (prob * 100).toFixed(2) + '%'
  return '100%'
}

function formatFraction(cases: number, tickets: number): string {
  if (tickets === 1) {
    const denom = Math.round(TOTAL_COMBINATIONS / cases)
    return `1/${denom.toLocaleString()}`
  }
  const prob = calcProbability(cases, tickets)
  if (prob === 0) return '-'
  const oneIn = Math.round(1 / prob)
  if (oneIn <= 1) return '~1/1'
  return `~1/${oneIn.toLocaleString()}`
}

function formatMoney(value: number): string {
  if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(1)}억원`
  if (value >= 10_000) return `${(value / 10_000).toFixed(0)}만원`
  return `${value.toLocaleString()}원`
}

function formatYears(years: number): string {
  if (years >= 1_000_000) return `${(years / 1_000_000).toFixed(0)}백만년`
  if (years >= 10_000) return `${(years / 10_000).toFixed(0)}만년`
  if (years >= 1_000) return `${(years / 1_000).toFixed(1)}천년`
  if (years >= 1) return `${years.toFixed(0)}년`
  const months = years * 12
  if (months >= 1) return `${months.toFixed(0)}개월`
  const weeks = years * 52
  return `${weeks.toFixed(0)}주`
}

export default function ProbabilityCalculator() {
  const [tickets, setTickets] = useState(1)

  const calculations = useMemo(() => {
    const results = PRIZES.map((prize) => {
      const prob = calcProbability(prize.cases, tickets)
      return {
        ...prize,
        probability: prob,
        formattedProb: formatProbability(prob),
        fraction: formatFraction(prize.cases, tickets),
      }
    })

    const totalCost = tickets * TICKET_PRICE
    const expectedValue = PRIZES.reduce((sum, prize) => {
      const prob = calcProbability(prize.cases, tickets)
      return sum + prob * prize.avgPrize
    }, 0)
    const expectedReturn = ((expectedValue / totalCost) * 100)
    const netProfit = expectedValue - totalCost

    const weeksFor1st = TOTAL_COMBINATIONS / tickets
    const yearsFor1st = weeksFor1st / 52

    return { results, totalCost, expectedValue, expectedReturn, netProfit, yearsFor1st }
  }, [tickets])

  return (
    <>
      {/* 구매 장수 입력 */}
      <section className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 sm:p-6 mb-6">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">1</span>
          구매 장수 설정
        </h2>

        {/* 빠른 입력 버튼 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_AMOUNTS.map((amount) => (
            <button
              key={amount}
              onClick={() => setTickets(amount)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tickets === amount
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/15'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {amount}장
            </button>
          ))}
        </div>

        {/* 슬라이더 + 숫자 입력 */}
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={100}
            value={tickets}
            onChange={(e) => setTickets(Number(e.target.value))}
            className="flex-1 h-2 rounded-full appearance-none cursor-pointer accent-indigo-600"
            style={{
              background: `linear-gradient(to right, #4F46E5 ${((tickets - 1) / 99) * 100}%, #E5E7EB ${((tickets - 1) / 99) * 100}%)`,
            }}
          />
          <div className="relative">
            <input
              type="number"
              min={1}
              max={100}
              value={tickets}
              onChange={(e) => {
                const val = Math.min(100, Math.max(1, Number(e.target.value) || 1))
                setTickets(val)
              }}
              className="w-20 px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 text-center text-sm font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">장</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
          <span>1장</span>
          <span className="text-indigo-600 font-medium">
            구매 금액: {(tickets * TICKET_PRICE).toLocaleString()}원
          </span>
          <span>100장</span>
        </div>
      </section>

      {/* 등수별 당첨 확률 */}
      <section className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 sm:p-6 mb-6">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-600">2</span>
          등수별 당첨 확률
          <span className="ml-auto text-xs text-gray-500 font-normal">{tickets}장 구매 시</span>
        </h2>

        <div className="space-y-4">
          {calculations.results.map((item) => {
            const logProb = Math.log10(item.probability + 1e-15)
            const logMin = Math.log10(1e-8)
            const logMax = Math.log10(1)
            const barWidth = Math.max(0.5, Math.min(100, ((logProb - logMin) / (logMax - logMin)) * 100))

            return (
              <div key={item.rank} className={`p-4 rounded-xl ${item.bgColor} border ${item.borderColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${item.textColor}`}>{item.label}</span>
                    <span className="text-xs text-gray-500">{item.match}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-mono font-bold text-gray-900">{item.formattedProb}</span>
                    <span className="text-xs text-gray-400 ml-2">({item.fraction})</span>
                  </div>
                </div>
                {/* 프로그레스 바 */}
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.barColor} transition-all duration-500 ease-out`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-xs text-gray-400">
                  <span>기본 확률: {formatFraction(item.cases, 1)}</span>
                  <span>평균 당첨금: {formatMoney(item.avgPrize)}</span>
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-4 text-xs text-gray-400 leading-relaxed">
          * 확률 공식: P = 1 - (1 - p)^n (n장 구매 시 최소 1번 이상 당첨될 확률)
        </p>
      </section>

      {/* 기대값 분석 */}
      <section className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 sm:p-6 mb-6">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600">3</span>
          기대값 분석
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center">
            <p className="text-xs text-gray-500 mb-1">구매 금액</p>
            <p className="text-sm sm:text-base font-bold text-gray-900">{calculations.totalCost.toLocaleString()}원</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center">
            <p className="text-xs text-gray-500 mb-1">기대 수익</p>
            <p className="text-sm sm:text-base font-bold text-indigo-600">{formatMoney(calculations.expectedValue)}</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center">
            <p className="text-xs text-gray-500 mb-1">순 기대 손익</p>
            <p className={`text-sm sm:text-base font-bold ${calculations.netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {calculations.netProfit >= 0 ? '+' : ''}{formatMoney(calculations.netProfit)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center">
            <p className="text-xs text-gray-500 mb-1">기대 수익률</p>
            <p className={`text-sm sm:text-base font-bold ${calculations.expectedReturn >= 100 ? 'text-emerald-600' : 'text-red-500'}`}>
              {calculations.expectedReturn.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* 등수별 기대값 내역 */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-gray-500 font-medium text-xs">등수</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium text-xs">당첨 확률</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium text-xs">평균 당첨금</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium text-xs">기대값 기여</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {calculations.results.map((item) => {
                const contribution = item.probability * item.avgPrize
                return (
                  <tr key={item.rank} className="border-b border-gray-100">
                    <td className={`py-2 px-3 font-bold ${item.textColor}`}>{item.label}</td>
                    <td className="py-2 px-3 text-right font-mono text-xs">{item.formattedProb}</td>
                    <td className="py-2 px-3 text-right text-xs">{formatMoney(item.avgPrize)}</td>
                    <td className="py-2 px-3 text-right font-mono text-xs text-indigo-600">{formatMoney(contribution)}</td>
                  </tr>
                )
              })}
              <tr className="border-t border-gray-300">
                <td className="py-2 px-3 font-bold text-gray-900" colSpan={3}>합계 기대값</td>
                <td className="py-2 px-3 text-right font-mono font-bold text-indigo-600">{formatMoney(calculations.expectedValue)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-xs text-red-600 leading-relaxed">
            기대 수익률이 100% 미만이면 평균적으로 손해입니다. 로또의 기대 수익률은 약 {calculations.expectedReturn.toFixed(1)}%로,
            1,000원당 약 {Math.round(calculations.expectedValue / tickets)}원의 기대값을 가집니다.
          </p>
        </div>
      </section>

      {/* 직관적 통계 */}
      <section className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 sm:p-6 mb-6">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-600">4</span>
          직관적 통계
        </h2>

        <div className="p-5 rounded-xl bg-indigo-50 border border-indigo-200 text-center mb-4">
          <p className="text-xs text-gray-500 mb-2">매주 {tickets}장씩 구매하면</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            평균 <span className="text-indigo-600">{formatYears(calculations.yearsFor1st)}</span>에 한 번
          </p>
          <p className="text-sm text-gray-500">1등에 당첨됩니다</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">1등 확률 비교</p>
            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">벼락 맞을 확률</span>
                <span className="text-amber-600 font-mono">~1/1,000,000</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">로또 1등 ({tickets}장)</span>
                <span className="text-indigo-600 font-mono">{formatFraction(1, tickets)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">교통사고 확률 (연간)</span>
                <span className="text-rose-600 font-mono">~1/5,000</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">등수별 평균 대기 기간 (매주 {tickets}장)</p>
            <div className="space-y-2 mt-2">
              {calculations.results.map((item) => {
                const weeksForRank = TOTAL_COMBINATIONS / (item.cases * tickets)
                const yearsForRank = weeksForRank / 52
                return (
                  <div key={item.rank} className="flex items-center justify-between text-xs">
                    <span className={item.textColor}>{item.label}</span>
                    <span className="text-gray-700 font-mono">{formatYears(yearsForRank)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
