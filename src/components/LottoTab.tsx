'use client'

import { RefObject, useState } from 'react'
import { LottoFullAnalysis } from '@/types/lotto'
import { getBallColor } from '@/lib/lotto-utils'

interface LottoTabProps {
  data: LottoFullAnalysis
  selectedRound: number | null
  roundInput: string
  setRoundInput: (v: string) => void
  fetchData: (round?: number | null) => void
  isLoading: boolean
  randomSets: number[][]
  isRolling: boolean
  generateRandom: () => void
  expanded: Record<string, boolean>
  toggleSection: (key: string) => void
  isSectionOpen: (key: string) => boolean
  sectionRefs: {
    recent: RefObject<HTMLDivElement | null>
    top15: RefObject<HTMLDivElement | null>
    ensemble: RefObject<HTMLDivElement | null>
    sets: RefObject<HTMLDivElement | null>
  }
  countdown: { days: number; hours: number; minutes: number; seconds: number }
  excludeNumbers: number[]
  setExcludeNumbers: (v: number[]) => void
  includeNumbers: number[]
  setIncludeNumbers: (v: number[]) => void
}

export default function LottoTab({
  data,
  selectedRound,
  roundInput,
  setRoundInput,
  fetchData,
  isLoading,
  randomSets,
  isRolling,
  generateRandom,
  toggleSection,
  isSectionOpen,
  sectionRefs,
  countdown,
  excludeNumbers,
  setExcludeNumbers,
  includeNumbers,
  setIncludeNumbers,
}: LottoTabProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)

  const copySet = (set: number[], idx: number) => {
    navigator.clipboard.writeText(set.join(', ')).then(() => {
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 1500)
    })
  }

  const copyAllSets = (sets: number[][]) => {
    const text = sets.map((s, i) => `${String.fromCharCode(65 + i)}: ${s.join(', ')}`).join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 1500)
    })
  }

  const shareNumbers = async (sets: number[][]) => {
    const text = `Lotto45 스마트 랜덤 번호\n${sets.map((s, i) => `${String.fromCharCode(65 + i)}: ${s.join(', ')}`).join('\n')}\n\nhttps://lotto45.kr`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Lotto45 번호 추천', text })
      } catch { /* user cancelled */ }
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedAll(true)
        setTimeout(() => setCopiedAll(false), 1500)
      })
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* 회차 선택기 */}
      <div className="p-3 sm:p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <span className="text-xs sm:text-sm text-gray-500">회차 조회</span>
          <input
            type="number"
            value={roundInput || data.nextRound}
            onChange={(e) => setRoundInput(e.target.value)}
            className="w-24 sm:w-28 px-2.5 py-1.5 sm:py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 text-center text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={() => {
              const round = parseInt(roundInput || String(data.nextRound))
              if (round && round > 10 && round <= data.nextRound) {
                fetchData(round)
              }
            }}
            disabled={isLoading}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs sm:text-sm font-medium text-white transition-colors disabled:opacity-50"
          >
            조회
          </button>
          {selectedRound && (
            <button
              onClick={() => {
                setRoundInput('')
                fetchData(null)
              }}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs sm:text-sm font-medium text-gray-700 transition-colors"
            >
              최신으로
            </button>
          )}
        </div>
        {selectedRound && (
          <p className="text-center text-xs text-indigo-600 mt-2">
            {selectedRound}회차 시점 예측 결과 조회 중
          </p>
        )}
      </div>

      {/* 회차 정보 + 스마트 랜덤 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <div className={`text-center p-4 sm:p-6 rounded-2xl border ${
          data.isHistorical
            ? 'bg-blue-50 border-blue-200'
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <p className="text-xs sm:text-sm text-gray-500 mb-1">
            {data.isHistorical ? '조회 회차' : '다음 추첨'}
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            제 {data.nextRound}회
          </p>
          <p className="text-xs sm:text-sm text-gray-500">
            {data.isHistorical
              ? `${data.latestRound}회차까지 데이터로 예측`
              : `최근: ${data.latestRound}회 (${data.latestDate} ${data.latestDayOfWeek})`}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {data.totalRounds}회차 분석
            {data.cached && <span className="ml-1 text-emerald-600">(캐시)</span>}
          </p>

          {/* 추첨 카운트다운 */}
          {!data.isHistorical && (
            <div className="mt-4 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
              <p className="text-xs text-indigo-600 font-medium mb-2">다음 추첨까지</p>
              <div className="grid grid-cols-4 gap-1.5">
                <div className="text-center">
                  <p className="text-lg sm:text-xl font-bold text-indigo-700">{countdown.days}</p>
                  <p className="text-xs text-indigo-400">일</p>
                </div>
                <div className="text-center">
                  <p className="text-lg sm:text-xl font-bold text-indigo-700">{countdown.hours}</p>
                  <p className="text-xs text-indigo-400">시</p>
                </div>
                <div className="text-center">
                  <p className="text-lg sm:text-xl font-bold text-indigo-700">{countdown.minutes}</p>
                  <p className="text-xs text-indigo-400">분</p>
                </div>
                <div className="text-center">
                  <p className="text-lg sm:text-xl font-bold text-indigo-700">{countdown.seconds}</p>
                  <p className="text-xs text-indigo-400">초</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">매주 토요일 오후 8시 35분 MBC 생방송</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="p-2 rounded-lg bg-gray-50 text-center">
              <p className="text-xs text-gray-500">평균 합계</p>
              <p className="text-sm font-bold text-gray-900">{data.patterns.sumRange.avg}</p>
            </div>
            <div className="p-2 rounded-lg bg-gray-50 text-center">
              <p className="text-xs text-gray-500">최다 홀짝</p>
              <p className="text-sm font-bold text-gray-900">{data.patterns.oddEvenMostCommon}</p>
            </div>
            <div className="p-2 rounded-lg bg-gray-50 text-center">
              <p className="text-xs text-gray-500">최다 고저</p>
              <p className="text-sm font-bold text-gray-900">{data.patterns.highLowMostCommon}</p>
            </div>
            <div className="p-2 rounded-lg bg-gray-50 text-center">
              <p className="text-xs text-gray-500">연번 확률</p>
              <p className="text-sm font-bold text-gray-900">{data.patterns.consecutivePairsPercent}%</p>
            </div>
          </div>
        </div>

        {/* 스마트 랜덤 생성기 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">스마트 랜덤 번호</h2>
            <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">5게임</span>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            홀짝·고저·합계·번호대 균형 랜덤
          </p>

          <div className="flex justify-center mb-4">
            <button
              onClick={generateRandom}
              disabled={isRolling}
              className="px-6 sm:px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-sm sm:text-base font-bold text-white transition-all disabled:opacity-50 active:scale-95"
            >
              {isRolling ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  뽑는 중...
                </span>
              ) : randomSets.length > 0 ? '다시 뽑기' : '번호 뽑기'}
            </button>
          </div>

          {randomSets.length > 0 && (
            <div className="space-y-2">
              {randomSets.map((set, gameIdx) => (
                <div
                  key={gameIdx}
                  className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-white border border-gray-200"
                >
                  <span className="text-xs font-bold text-amber-600 w-5">{String.fromCharCode(65 + gameIdx)}</span>
                  <div className="flex gap-1.5 sm:gap-2 flex-wrap justify-center flex-1">
                    {set.map((num, idx) => {
                      const c = getBallColor(num)
                      return (
                        <span
                          key={idx}
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-sm"
                          style={{ backgroundColor: c.bg, color: c.text }}
                        >
                          {num}
                        </span>
                      )
                    })}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); copySet(set, gameIdx) }}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
                    title="번호 복사"
                  >
                    {copiedIdx === gameIdx ? (
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    )}
                  </button>
                </div>
              ))}
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-400">
                  홀짝 2:4~4:2 / 고저 2:4~4:2 / 합계 100~180
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => copyAllSets(randomSets)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-white border border-gray-200 transition-colors"
                  >
                    {copiedAll ? (
                      <>
                        <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        복사됨
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        복사
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => shareNumbers(randomSets)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-white border border-gray-200 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                    공유
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 번호 필터 (포함/제외) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
        <button
          onClick={() => toggleSection('numberFilter')}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">번호 필터</h2>
            {(includeNumbers.length > 0 || excludeNumbers.length > 0) && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                {includeNumbers.length > 0 ? `포함 ${includeNumbers.length}` : ''}
                {includeNumbers.length > 0 && excludeNumbers.length > 0 ? ' · ' : ''}
                {excludeNumbers.length > 0 ? `제외 ${excludeNumbers.length}` : ''}
              </span>
            )}
          </div>
          <span className="text-indigo-500 text-xs">{isSectionOpen('numberFilter') ? '접기' : '펼치기'}</span>
        </button>

        {isSectionOpen('numberFilter') && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-3">
              번호를 클릭하여 포함(초록)/제외(빨강) 설정 후 &quot;번호 뽑기&quot;를 누르세요. 포함 번호는 최대 5개까지 선택 가능합니다.
            </p>
            <div className="grid grid-cols-9 gap-1.5 sm:gap-2 mb-3">
              {Array.from({ length: 45 }, (_, i) => i + 1).map(num => {
                const isIncluded = includeNumbers.includes(num)
                const isExcluded = excludeNumbers.includes(num)
                const c = getBallColor(num)
                return (
                  <button
                    key={num}
                    onClick={() => {
                      if (isIncluded) {
                        setIncludeNumbers(includeNumbers.filter(n => n !== num))
                        setExcludeNumbers([...excludeNumbers, num])
                      } else if (isExcluded) {
                        setExcludeNumbers(excludeNumbers.filter(n => n !== num))
                      } else {
                        if (includeNumbers.length < 5) {
                          setIncludeNumbers([...includeNumbers, num])
                        } else {
                          setExcludeNumbers([...excludeNumbers, num])
                        }
                      }
                    }}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isIncluded
                        ? 'ring-2 ring-emerald-500 ring-offset-1 scale-110'
                        : isExcluded
                        ? 'ring-2 ring-red-400 ring-offset-1 opacity-40 line-through'
                        : 'hover:scale-105'
                    }`}
                    style={{
                      backgroundColor: isExcluded ? '#f3f4f6' : c.bg,
                      color: isExcluded ? '#9ca3af' : c.text
                    }}
                  >
                    {num}
                  </button>
                )
              })}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" /> 포함
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-red-400" /> 제외
                </span>
              </div>
              {(includeNumbers.length > 0 || excludeNumbers.length > 0) && (
                <button
                  onClick={() => { setIncludeNumbers([]); setExcludeNumbers([]) }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  초기화
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 실제 당첨번호 비교 */}
      {data.matchInfo && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
          <button
            onClick={() => toggleSection('matchDetail')}
            className="w-full flex items-center justify-between mb-3"
          >
            <h2 className="text-base sm:text-lg font-bold text-emerald-700">
              {data.matchInfo.targetRound}회 실제 당첨번호
            </h2>
            <span className="text-indigo-500 text-xs">{isSectionOpen('matchDetail') ? '접기' : '상세보기'}</span>
          </button>
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">실제 당첨번호 ({data.matchInfo.actualDate})</p>
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
              {data.matchInfo.actualNumbers.map((num, idx) => {
                const c = getBallColor(num)
                return (
                  <span
                    key={idx}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-sm"
                    style={{ backgroundColor: c.bg, color: c.text }}
                  >
                    {num}
                  </span>
                )
              })}
              <span className="mx-0.5 text-gray-400">+</span>
              {(() => {
                const c = getBallColor(data.matchInfo!.actualBonus)
                return (
                  <span
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-sm opacity-60"
                    style={{ backgroundColor: c.bg, color: c.text }}
                  >
                    {data.matchInfo!.actualBonus}
                  </span>
                )
              })()}
            </div>
          </div>

          {/* 요약 카드 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">TOP 15 적중</p>
              <p className="text-xl sm:text-2xl font-bold text-emerald-600">
                {data.matchInfo.top15Matched}개
              </p>
              {data.matchInfo.top15MatchedNumbers.length > 0 && (
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {data.matchInfo.top15MatchedNumbers.map((num, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 bg-emerald-100 rounded text-emerald-700 text-xs font-medium">
                      {num}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="p-3 rounded-xl bg-white border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">세트 최고 적중</p>
              <p className="text-xl sm:text-2xl font-bold text-amber-600">
                {data.matchInfo.bestSetMatch}개
              </p>
            </div>
          </div>

          {/* 세트별 상세 (접기/펼치기) */}
          {isSectionOpen('matchDetail') && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">세트별 적중</p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {data.matchInfo.setMatches.slice(0, 5).map((set) => (
                  <div
                    key={set.set}
                    className={`flex items-center justify-between p-2 sm:p-2.5 rounded-lg ${
                      set.matched >= 4 ? 'bg-emerald-100' : set.matched >= 3 ? 'bg-amber-100' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-xs text-gray-500 w-8">{set.set}세트</span>
                      <div className="flex gap-0.5 sm:gap-1">
                        {set.numbers.map((num, idx) => (
                          <span
                            key={idx}
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                              set.matchedNumbers.includes(num)
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gray-200 text-gray-500'
                            }`}
                          >
                            {num}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className={`text-xs font-bold ${
                      set.matched >= 4 ? 'text-emerald-600' : set.matched >= 3 ? 'text-amber-600' : 'text-gray-400'
                    }`}>
                      {set.matched}개
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 최근 당첨 번호 */}
      <div ref={sectionRefs.recent} className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-sm scroll-mt-20">
        <button
          onClick={() => toggleSection('recent')}
          className="w-full flex items-center justify-between mb-3"
        >
          <h2 className="text-base sm:text-lg font-bold text-gray-900">최근 당첨 번호</h2>
          <span className="text-indigo-500 text-xs">{isSectionOpen('recent') ? '접기' : '펼치기'}</span>
        </button>
        <div className="space-y-2">
          {data.recentResults.slice(0, isSectionOpen('recent') ? 5 : 2).map((result) => (
            <div key={result.round} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-gray-50">
              <div className="min-w-[3.5rem] sm:min-w-[4.5rem]">
                <p className="text-xs sm:text-sm font-bold text-gray-900">{result.round}회</p>
                <p className="text-xs text-gray-400">{result.date.slice(5)}</p>
              </div>
              <div className="flex gap-1 sm:gap-1.5 flex-wrap flex-1 justify-center">
                {result.numbers.map((num, idx) => {
                  const c = getBallColor(num)
                  return (
                    <span
                      key={idx}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm"
                      style={{ backgroundColor: c.bg, color: c.text }}
                    >
                      {num}
                    </span>
                  )
                })}
                <span className="text-gray-400 flex items-center text-xs">+</span>
                {(() => {
                  const c = getBallColor(result.bonus)
                  return (
                    <span
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm opacity-60"
                      style={{ backgroundColor: c.bg, color: c.text }}
                    >
                      {result.bonus}
                    </span>
                  )
                })()}
              </div>
            </div>
          ))}
        </div>
        {!isSectionOpen('recent') && (
          <button
            onClick={() => toggleSection('recent')}
            className="w-full mt-2 py-2 text-xs text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            +{data.recentResults.length - 2}개 더보기
          </button>
        )}
      </div>

      {/* 추천 번호 TOP 15 */}
      <div ref={sectionRefs.top15} className="p-4 sm:p-5 rounded-2xl bg-indigo-50 border border-indigo-200 scroll-mt-20">
        <button
          onClick={() => toggleSection('top15')}
          className="w-full flex items-center justify-between"
        >
          <div>
            <h2 className="text-base sm:text-lg font-bold mb-1 text-left text-gray-900">AI 추천 번호 TOP 15</h2>
            <p className="text-xs text-gray-500 text-left">
              통계·확률·트렌드 종합 순위
            </p>
          </div>
          <span className="text-indigo-500 text-xs shrink-0 ml-2">{isSectionOpen('top15') ? '접기' : '6개만'}</span>
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 mt-4">
          {(isSectionOpen('top15') ? data.rankedNumbers : data.rankedNumbers.slice(0, 6)).map((item) => {
            const c = getBallColor(item.number)
            return (
              <div
                key={item.number}
                className={`p-3 sm:p-3.5 rounded-xl border transition-all ${
                  item.rank <= 3
                    ? 'bg-white border-indigo-300 shadow-sm'
                    : item.rank <= 6
                    ? 'bg-white border-indigo-200'
                    : 'bg-white/80 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-base sm:text-lg font-bold shadow-sm shrink-0"
                    style={{ backgroundColor: c.bg, color: c.text }}
                  >
                    {item.number}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        item.rank <= 3 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {item.rank}위
                      </span>
                      <span className="text-xs text-gray-400 font-mono">CDM {(item.cdmScore ?? item.score ?? 0).toFixed(3)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">출현 {item.frequency}회</span>
                      <span className="text-xs text-gray-400">미출현 {item.consecutiveMiss}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {!isSectionOpen('top15') && data.rankedNumbers.length > 6 && (
          <button
            onClick={() => toggleSection('top15')}
            className="w-full mt-3 py-2 text-xs text-gray-500 hover:text-gray-700 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
          >
            +{data.rankedNumbers.length - 6}개 더보기
          </button>
        )}
      </div>

      {/* 앙상블 분석 */}
      {data.ensembleSets && data.ensembleSets.length > 0 && (
        <div ref={sectionRefs.ensemble} className="p-4 sm:p-5 rounded-2xl bg-violet-50 border border-violet-200 scroll-mt-20">
          <button
            onClick={() => toggleSection('ensemble')}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">AI 앙상블 분석</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-300 font-medium">NEW</span>
            </div>
            <span className="text-indigo-500 text-xs shrink-0 ml-2">{isSectionOpen('ensemble') ? '접기' : '펼치기'}</span>
          </button>
          <p className="text-xs text-gray-500 mt-1 mb-4">
            CDM {((data.ensembleWeights?.cdm || 0.4) * 100).toFixed(0)}% + Markov {((data.ensembleWeights?.markov || 0.3) * 100).toFixed(0)}% + Monte Carlo {((data.ensembleWeights?.mc || 0.3) * 100).toFixed(0)}% 가중 합산
          </p>

          {isSectionOpen('ensemble') && (
            <>
              {/* 앙상블 TOP 15 랭킹 */}
              {data.ensembleRanking && data.ensembleRanking.length > 0 && (
                <div className="mb-5">
                  <button
                    onClick={() => toggleSection('ensembleRank')}
                    className="w-full flex items-center justify-between mb-3"
                  >
                    <h3 className="text-sm font-bold text-gray-700">앙상블 번호 랭킹 TOP 15</h3>
                    <span className="text-indigo-500 text-xs">{isSectionOpen('ensembleRank') ? '접기' : '펼치기'}</span>
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {(isSectionOpen('ensembleRank') ? data.ensembleRanking : data.ensembleRanking.slice(0, 3)).map((item) => {
                      const c = getBallColor(item.number)
                      return (
                        <div
                          key={item.number}
                          className={`p-2.5 sm:p-3 rounded-xl border ${
                            item.rank <= 3
                              ? 'bg-white border-violet-300 shadow-sm'
                              : item.rank <= 6
                              ? 'bg-white border-violet-200'
                              : 'bg-white/80 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-bold shadow-sm shrink-0"
                              style={{ backgroundColor: c.bg, color: c.text }}
                            >
                              {item.number}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                  item.rank <= 3 ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-500'
                                }`}>
                                  {item.rank}위
                                </span>
                                <span className="text-xs text-violet-600 font-mono">{item.ensembleScore.toFixed(3)}</span>
                              </div>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-gray-400 w-5">CDM</span>
                                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${item.cdmScore * 100}%` }} />
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-gray-400 w-5">MK</span>
                                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${item.markovScore * 100}%` }} />
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-gray-400 w-5">MC</span>
                                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-violet-400 rounded-full" style={{ width: `${item.mcScore * 100}%` }} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {!isSectionOpen('ensembleRank') && data.ensembleRanking.length > 3 && (
                    <button
                      onClick={() => toggleSection('ensembleRank')}
                      className="w-full mt-2 py-2 text-xs text-gray-500 hover:text-gray-700 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                    >
                      +{data.ensembleRanking.length - 3}개 더보기
                    </button>
                  )}
                </div>
              )}

              {/* 앙상블 추천 5세트 */}
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-700 mb-3">앙상블 추천 5세트</h3>
                <div className="space-y-2.5">
                  {data.ensembleSets.map((set) => (
                    <div
                      key={set.set}
                      className={`p-3 sm:p-3.5 rounded-xl border ${
                        set.set <= 2
                          ? 'bg-white border-violet-300'
                          : 'bg-white/80 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                            set.set <= 2 ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {set.set}
                          </span>
                          <span className="text-xs text-gray-500">{set.method}</span>
                        </div>
                        <span className="text-xs font-bold text-violet-600 font-mono">{set.score.toFixed(2)}</span>
                      </div>
                      <div className="flex gap-1.5 sm:gap-2 justify-center">
                        {set.numbers.map((num, idx) => {
                          const c = getBallColor(num)
                          return (
                            <span
                              key={idx}
                              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-sm"
                              style={{ backgroundColor: c.bg, color: c.text }}
                            >
                              {num}
                            </span>
                          )
                        })}
                      </div>
                      <p className="text-center text-xs text-gray-400 mt-1.5">
                        합계 {set.numbers.reduce((a, b) => a + b, 0)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Markov + Monte Carlo 세트 */}
              <details className="group">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1">
                  <span className="group-open:rotate-90 transition-transform">&#9654;</span>
                  Markov / Monte Carlo 개별 세트 보기
                </summary>
                <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {data.markovSets && data.markovSets.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-indigo-600 mb-2">Markov Chain ({data.markovSets.length}세트)</h4>
                      <div className="space-y-2">
                        {data.markovSets.map((set) => (
                          <div key={set.set} className="p-2.5 rounded-lg bg-white border border-indigo-100">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-gray-500">{set.set}. {set.method}</span>
                              <span className="text-xs text-indigo-600 font-mono">{set.score.toFixed(2)}</span>
                            </div>
                            <div className="flex gap-1.5 justify-center">
                              {set.numbers.map((num, idx) => {
                                const c = getBallColor(num)
                                return (
                                  <span
                                    key={idx}
                                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-sm"
                                    style={{ backgroundColor: c.bg, color: c.text }}
                                  >
                                    {num}
                                  </span>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {data.monteCarloSets && data.monteCarloSets.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-violet-600 mb-2">Monte Carlo ({data.monteCarloSets.length}세트)</h4>
                      <div className="space-y-2">
                        {data.monteCarloSets.map((set) => (
                          <div key={set.set} className="p-2.5 rounded-lg bg-white border border-violet-100">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-gray-500">{set.set}. {set.method}</span>
                              <span className="text-xs text-violet-600 font-mono">{set.score.toFixed(2)}</span>
                            </div>
                            <div className="flex gap-1.5 justify-center">
                              {set.numbers.map((num, idx) => {
                                const c = getBallColor(num)
                                return (
                                  <span
                                    key={idx}
                                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-sm"
                                    style={{ backgroundColor: c.bg, color: c.text }}
                                  >
                                    {num}
                                  </span>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </details>
            </>
          )}
        </div>
      )}

      {/* AI 15세트 + 백테스트 10세트 */}
      <div ref={sectionRefs.sets} className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 scroll-mt-20">

      {/* AI 추천 15세트 */}
      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
        <button
          onClick={() => toggleSection('cdmSets')}
          className="w-full flex items-center justify-between"
        >
          <div>
            <h2 className="text-base sm:text-lg font-bold mb-1 text-left text-gray-900">AI 추천 15세트</h2>
            <p className="text-xs text-gray-500 text-left">
              확률/통계 기반 최적 조합
            </p>
          </div>
          <span className="text-indigo-500 text-xs shrink-0 ml-2">{isSectionOpen('cdmSets') ? '접기' : '3개만'}</span>
        </button>

        <div className="space-y-2.5 mt-4">
          {(isSectionOpen('cdmSets') ? data.recommendedSets : data.recommendedSets?.slice(0, 3))?.map((set) => (
            <div
              key={set.set}
              className={`p-3 sm:p-3.5 rounded-xl border ${
                set.set <= 3
                  ? 'bg-white border-emerald-300'
                  : set.set <= 6
                  ? 'bg-white border-emerald-200'
                  : 'bg-white/80 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                    set.set <= 3 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {set.set}
                  </span>
                  <span className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-none">{set.description || set.method}</span>
                </div>
                <span className={`text-xs font-bold ${
                  set.score >= 80 ? 'text-emerald-600' : set.score >= 60 ? 'text-amber-600' : 'text-gray-400'
                }`}>
                  {set.score.toFixed(1)}
                </span>
              </div>

              <div className="flex gap-1.5 sm:gap-2 justify-center">
                {set.numbers.map((num, idx) => {
                  const c = getBallColor(num)
                  return (
                    <span
                      key={idx}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-sm"
                      style={{ backgroundColor: c.bg, color: c.text }}
                    >
                      {num}
                    </span>
                  )
                })}
              </div>

              <p className="text-center text-xs text-gray-400 mt-1.5">
                합계 {set.numbers.reduce((a, b) => a + b, 0)}
              </p>
            </div>
          ))}
        </div>
        {!isSectionOpen('cdmSets') && (data.recommendedSets?.length || 0) > 3 && (
          <button
            onClick={() => toggleSection('cdmSets')}
            className="w-full mt-3 py-2 text-xs text-gray-500 hover:text-gray-700 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
          >
            +{(data.recommendedSets?.length || 0) - 3}세트 더보기
          </button>
        )}
      </div>

      {/* 백테스트 기반 추천 10세트 */}
      {data.backtestSets && data.backtestSets.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200">
          <button
            onClick={() => toggleSection('backtest')}
            className="w-full flex items-center justify-between"
          >
            <div>
              <h2 className="text-base sm:text-lg font-bold mb-1 text-left text-gray-900">백테스트 검증 10세트</h2>
              <p className="text-xs text-gray-500 text-left">
                {data.totalRounds}회 역추적 검증 — 실제 2~3개 적중 공식
              </p>
            </div>
            <span className="text-indigo-500 text-xs shrink-0 ml-2">{isSectionOpen('backtest') ? '접기' : '3개만'}</span>
          </button>

          {data.consensusNumbers && data.consensusNumbers.length > 0 && (
            <div className="mb-4 mt-3 p-3 rounded-xl bg-white border border-gray-200">
              <p className="text-xs text-gray-500 mb-2">20개 공식 핵심 번호</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {data.consensusNumbers.slice(0, 6).map((item, idx) => {
                  const c = getBallColor(item.number)
                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <span
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-sm ring-2 ring-amber-400"
                        style={{ backgroundColor: c.bg, color: c.text }}
                      >
                        {item.number}
                      </span>
                      <span className="text-xs text-amber-600 mt-0.5">{item.count}회</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="space-y-2.5 mt-3">
            {(isSectionOpen('backtest') ? data.backtestSets : data.backtestSets.slice(0, 3)).map((set) => (
              <div
                key={set.set}
                className={`p-3 sm:p-3.5 rounded-xl border ${
                  set.set <= 3
                    ? 'bg-white border-amber-300'
                    : 'bg-white/80 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                      set.set <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {set.set}
                    </span>
                    <span className="text-xs text-gray-500 truncate max-w-[100px] sm:max-w-none">{set.method}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 hidden sm:inline">
                      전체 {set.hitRate}% / 최근 {set.recentHitRate}%
                    </span>
                    <span className={`text-xs font-bold ${
                      set.score >= 30 ? 'text-indigo-600' : set.score >= 20 ? 'text-indigo-500' : 'text-gray-400'
                    }`}>
                      {set.score.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1.5 sm:gap-2 justify-center">
                  {set.numbers.map((num, idx) => {
                    const c = getBallColor(num)
                    return (
                      <span
                        key={idx}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-sm"
                        style={{ backgroundColor: c.bg, color: c.text }}
                      >
                        {num}
                      </span>
                    )
                  })}
                </div>

                <div className="flex justify-between mt-1.5">
                  <span className="text-xs text-gray-400 sm:hidden">
                    전체 {set.hitRate}% / 최근 {set.recentHitRate}%
                  </span>
                  <span className="text-xs text-gray-400 ml-auto">
                    합계 {set.numbers.reduce((a, b) => a + b, 0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {!isSectionOpen('backtest') && data.backtestSets.length > 3 && (
            <button
              onClick={() => toggleSection('backtest')}
              className="w-full mt-3 py-2 text-xs text-gray-500 hover:text-gray-700 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
            >
              +{data.backtestSets.length - 3}세트 더보기
            </button>
          )}
        </div>
      )}
      </div>

    </div>
  )
}
