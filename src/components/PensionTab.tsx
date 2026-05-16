'use client'

import { useState } from 'react'
import { PensionAnalysis } from '@/types/lotto'
import { PensionNumber } from '@/components/PensionNumber'

interface PensionTabProps {
  data: PensionAnalysis
  selectedRound: number | null
  roundInput: string
  setRoundInput: (v: string) => void
  fetchData: (round?: number | null) => void
  isLoading: boolean
  randomSets: Array<{ group: number; numbers: number[] }>
  isRolling: boolean
  generateRandom: () => void
}

export default function PensionTab({
  data,
  selectedRound,
  roundInput,
  setRoundInput,
  fetchData,
  isLoading,
  randomSets,
  isRolling,
  generateRandom,
}: PensionTabProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)

  const copySet = (set: { group: number; numbers: number[] }, idx: number) => {
    const text = `${set.group}조 ${set.numbers.join('')}`
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 1500)
    })
  }

  const copyAllSets = (sets: Array<{ group: number; numbers: number[] }>) => {
    const text = sets.map((s, i) => `${String.fromCharCode(65 + i)}: ${s.group}조 ${s.numbers.join('')}`).join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 1500)
    })
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
            className="w-24 sm:w-28 px-2.5 py-1.5 sm:py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 text-center text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
          <button
            onClick={() => {
              const round = parseInt(roundInput || String(data.nextRound))
              if (round && round > 10 && round <= data.nextRound) {
                fetchData(round)
              }
            }}
            disabled={isLoading}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-xs sm:text-sm font-medium text-white transition-colors disabled:opacity-50"
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
          <p className="text-center text-xs text-violet-600 mt-2">
            {selectedRound}회차 시점 예측 결과 조회 중
          </p>
        )}
      </div>

      {/* 회차 정보 + 스마트 랜덤 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <div className={`text-center p-4 sm:p-6 rounded-2xl border ${
          data.isHistorical
            ? 'bg-blue-50 border-blue-200'
            : 'bg-violet-50 border-violet-200'
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
              : `${data.latestRound}회차까지 ${data.totalResults || data.latestRound}개 데이터 분석`}
          </p>
          <p className="text-xs text-violet-600 mt-1">
            {data.method || 'CDM 분석'}
          </p>
        </div>

        {/* 연금복권 스마트 랜덤 생성기 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-violet-50 border border-violet-200">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">랜덤 번호 뽑기</h2>
            <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">5게임</span>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            조(1~5) + 6자리 숫자 랜덤 생성
          </p>

          <div className="flex justify-center mb-4">
            <button
              onClick={generateRandom}
              disabled={isRolling}
              className="px-6 sm:px-8 py-2.5 bg-violet-600 hover:bg-violet-700 rounded-xl text-sm sm:text-base font-bold text-white transition-all disabled:opacity-50 active:scale-95"
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
                  <span className="text-xs font-bold text-violet-600 w-5">{String.fromCharCode(65 + gameIdx)}</span>
                  <div className="flex items-center gap-1 sm:gap-1.5 flex-1 justify-center">
                    <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold text-white" style={{ backgroundColor: '#F59E0B' }}>
                      {set.group}조
                    </span>
                    {set.numbers.map((num, idx) => (
                      <span
                        key={idx}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-sm sm:text-base font-bold text-white" style={{ backgroundColor: '#8B5CF6' }}
                      >
                        {num}
                      </span>
                    ))}
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
              <div className="flex justify-end mt-2">
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
                      전체 복사
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* 실제 당첨번호 비교 */}
      {data.matchInfo && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
          <h2 className="text-base sm:text-lg font-bold mb-3 text-emerald-700">
            {data.matchInfo.targetRound}회 실제 당첨번호
          </h2>
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">실제 당첨번호 ({data.matchInfo.actualDate})</p>
            <div className="flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap">
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold text-white" style={{ backgroundColor: '#F59E0B' }}>
                {data.matchInfo.actualGroup}조
              </span>
              {data.matchInfo.actualNumbers.map((num, idx) => (
                <span
                  key={idx}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-sm sm:text-base font-bold text-white" style={{ backgroundColor: '#8B5CF6' }}
                >
                  {num}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-gray-200 mb-3">
            <p className="text-xs text-gray-500 mb-1">뒤 6자리 최고 연속 적중</p>
            <p className="text-xl sm:text-2xl font-bold text-amber-600">
              {data.matchInfo.bestConsecutiveMatch}자리
            </p>
          </div>

          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2">세트별 적중 (뒤 6자리)</p>
            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {data.matchInfo.setMatches.slice(0, 8).map((set) => (
                <div
                  key={set.set}
                  className={`p-2.5 rounded-lg ${
                    set.consecutiveFromEnd >= 4 ? 'bg-emerald-100 border border-emerald-300' :
                    set.consecutiveFromEnd >= 2 ? 'bg-amber-100 border border-amber-300' :
                    'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-500">{set.set}세트 ({set.method})</span>
                    <span className={`text-xs font-bold ${
                      set.consecutiveFromEnd >= 4 ? 'text-emerald-600' :
                      set.consecutiveFromEnd >= 2 ? 'text-amber-600' :
                      'text-gray-400'
                    }`}>
                      {set.prize}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                    {set.numbers.map((num, idx) => (
                      <span
                        key={idx}
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded flex items-center justify-center text-xs font-bold ${
                          set.matchedPositions.includes(idx + 1)
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-center text-gray-400 mt-1">
                    {set.matchedDigits}자리 일치 (연속 {set.consecutiveFromEnd})
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 최근 당첨 번호 */}
      {data.recentResults && data.recentResults.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <h2 className="text-base sm:text-lg font-bold mb-3 text-gray-900">최근 당첨 번호</h2>
          <div className="space-y-2">
            {data.recentResults.map((result) => (
              <div key={result.round} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-gray-50">
                <div className="min-w-[3.5rem] sm:min-w-[4.5rem]">
                  <p className="text-xs sm:text-sm font-bold text-gray-900">{result.round}회</p>
                  <p className="text-xs text-gray-400">{result.date}</p>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 flex-1 justify-center">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: '#F59E0B' }}>
                    {result.group}조
                  </span>
                  {result.numbers.map((n, idx) => (
                    <span
                      key={idx}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-xs sm:text-sm font-bold text-white" style={{ backgroundColor: '#8B5CF6' }}
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CDM TOP 3 + 조별 분석 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200">
          <h2 className="text-base sm:text-lg font-bold mb-1 text-gray-900">CDM 1등 예측 TOP 3</h2>
          <p className="text-xs text-gray-500 mb-4">
            논문(arXiv:2403.12836) 기반 확률 예측
          </p>

          <div className="space-y-3">
            {data.predictions.map((pred, idx) => (
              <div
                key={idx}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                  idx === 0
                    ? 'bg-white border-amber-300'
                    : idx === 1
                    ? 'bg-white border-violet-200'
                    : 'bg-white/80 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-amber-100 text-amber-700' :
                      idx === 1 ? 'bg-violet-100 text-violet-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="text-xs text-gray-500">{pred.reasons[0]}</span>
                  </div>
                  {pred.cdmScore && (
                    <span className="text-xs font-mono text-emerald-600">
                      {pred.cdmScore.toFixed(2)}
                    </span>
                  )}
                </div>

                <PensionNumber numbers={pred.numbers} showGroup={false} />
              </div>
            ))}
          </div>
        </div>

        {data.groupStats && (
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <h3 className="text-base sm:text-lg font-bold mb-3 text-gray-900">조(Group) CDM 분석</h3>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {data.groupStats.map((g) => (
                <div
                  key={g.group}
                  className={`p-2 sm:p-3 rounded-lg text-center ${
                    g.group === data.groupStats![0].group
                      ? 'bg-violet-100 border border-violet-300'
                      : 'bg-gray-50'
                  }`}
                >
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{g.group}조</p>
                  <p className="text-xs text-gray-500">{g.frequency}회</p>
                  <p className="text-xs sm:text-sm text-violet-600 font-medium">{g.probability}%</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 자릿수별 CDM TOP3 + 핫/콜드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {data.digitPredictions && (
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <h3 className="text-base sm:text-lg font-bold mb-3 text-gray-900">자릿수별 CDM TOP3</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {data.digitPredictions.map((pos) => (
                <div key={pos.position} className="p-3 rounded-xl bg-gray-50">
                  <p className="text-xs text-gray-500 mb-2">{pos.position}번째 자리</p>
                  <div className="flex gap-1.5 sm:gap-2">
                    {pos.top3.map((item, i) => (
                      <div key={item.digit} className="text-center">
                        <span className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-sm sm:text-base font-bold mb-0.5 ${
                          i === 0 ? 'bg-amber-100 text-amber-700' :
                          i === 1 ? 'bg-gray-200 text-gray-600' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {item.digit}
                        </span>
                        <p className="text-xs text-gray-400">{item.cdmScore}점</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <h3 className="text-base sm:text-lg font-bold mb-3 text-gray-900">핫/콜드 번호</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {data.hotByPosition.map((pos, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-gray-50">
                <p className="text-xs text-gray-500 mb-2">{pos.position}번째</p>
                <div className="flex gap-3">
                  <div>
                    <p className="text-xs text-red-500 mb-1">핫</p>
                    <div className="flex gap-0.5">
                      {pos.hotNumbers.map((n, i) => (
                        <span key={`hot-${n}-${i}`} className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-blue-500 mb-1">콜드</p>
                    <div className="flex gap-0.5">
                      {data.coldByPosition[idx]?.coldNumbers.map((n, i) => (
                        <span key={`cold-${n}-${i}`} className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 추천 15세트 */}
      {data.recommendedSets && data.recommendedSets.length > 3 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
          <h3 className="text-base sm:text-lg font-bold mb-1 text-gray-900">CDM 추천 세트</h3>
          <p className="text-xs text-gray-500 mb-3">
            다양한 CDM 전략 기반 조합
          </p>
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {data.recommendedSets.slice(3).map((set) => (
              <div
                key={set.set}
                className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 transition-colors"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xs text-gray-400 w-5">{set.set}.</span>
                  <span className="font-mono text-sm sm:text-base text-gray-900">{set.numbers.join('')}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xs text-gray-400 truncate max-w-[80px] sm:max-w-none">{set.method}</span>
                  <span className="text-xs sm:text-sm text-emerald-600 font-medium">{set.score.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
