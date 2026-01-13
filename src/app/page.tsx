'use client'

import { useState, useEffect, useCallback } from 'react'
import { LottoBalls } from '@/components/LottoBall'
import { PensionNumber } from '@/components/PensionNumber'

type Tab = 'lotto' | 'pension'

interface RankedNumber {
  rank: number
  number: number
  score?: number
  cdmScore?: number
  reasons: string[]
  frequency: number
  lastAppeared: number
  consecutiveMiss: number
  bayesianPosterior?: number
}

interface RecentResult {
  round: number
  date: string
  dayOfWeek: string
  numbers: number[]
  bonus: number
}

interface RecommendedSet {
  set: number
  numbers: number[]
  score: number
  description?: string
  method?: string
}

interface LottoFullAnalysis {
  rankedNumbers: RankedNumber[]
  recommendedSets: RecommendedSet[]
  recentResults: RecentResult[]
  latestRound: number
  latestDate: string
  latestDayOfWeek: string
  totalRounds: number
  patterns: {
    sumRange: { min: number; max: number; avg: number }
    oddEvenMostCommon: string
    highLowMostCommon: string
    consecutivePairsPercent: number
  }
  nextRound: number
  cached: boolean
  lastUpdate: string
}

interface PensionAnalysis {
  predictions: Array<{
    group: number
    numbers: number[]
    confidence: number
    reasons: string[]
  }>
  hotByPosition: Array<{ position: number; hotNumbers: number[] }>
  coldByPosition: Array<{ position: number; coldNumbers: number[] }>
  nextRound: number
  latestRound: number
  lastUpdate: string
}

interface LoadingState {
  isLoading: boolean
  progress: number
  status: string
  startTime: number
  elapsedTime: number
}

// 로또 공 색상 결정
function getBallColor(num: number): string {
  if (num <= 10) return 'from-yellow-400 to-yellow-600'
  if (num <= 20) return 'from-blue-400 to-blue-600'
  if (num <= 30) return 'from-red-400 to-red-600'
  if (num <= 40) return 'from-gray-400 to-gray-600'
  return 'from-green-400 to-green-600'
}

// 시간 포맷 함수
function formatTime(seconds: number): string {
  if (seconds < 0) seconds = 0
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  if (mins > 0) {
    return `${mins}분 ${secs}초`
  }
  return `${secs}초`
}

// Vercel 서버리스 함수 타임아웃 (초) - Free 플랜 기준
const VERCEL_TIMEOUT = 15

export default function Home() {
  const [tab, setTab] = useState<Tab>('lotto')
  const [lottoData, setLottoData] = useState<LottoFullAnalysis | null>(null)
  const [pensionData, setPensionData] = useState<PensionAnalysis | null>(null)
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    status: '',
    startTime: 0,
    elapsedTime: 0,
  })
  const [error, setError] = useState<string | null>(null)

  // 경과 시간 업데이트
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (loadingState.isLoading && loadingState.startTime > 0) {
      interval = setInterval(() => {
        const elapsed = (Date.now() - loadingState.startTime) / 1000
        setLoadingState(prev => ({
          ...prev,
          elapsedTime: elapsed,
        }))
      }, 500)
    }
    return () => clearInterval(interval)
  }, [loadingState.isLoading, loadingState.startTime])

  // 남은 시간 계산 (타임아웃 기준)
  const remainingTime = Math.max(0, VERCEL_TIMEOUT - loadingState.elapsedTime)
  const isTimeWarning = remainingTime < 15 && remainingTime > 0
  const isTimeCritical = remainingTime < 5 && remainingTime > 0

  const simulateProgress = useCallback(() => {
    // 최근 200회차만 분석 (Vercel 10초 제한 고려)
    const stages = [
      { progress: 10, status: '서버 연결 중...', duration: 300 },
      { progress: 20, status: '최신 회차 확인 중...', duration: 500 },
      { progress: 40, status: '최근 200회차 데이터 수집 중...', duration: 2000 },
      { progress: 60, status: '통계 분석 중 (빈도, 패턴)...', duration: 1500 },
      { progress: 75, status: '확률 계산 중 (포아송 분포)...', duration: 1500 },
      { progress: 85, status: '트렌드/주기성 분석 중...', duration: 1500 },
      { progress: 95, status: '최종 순위 산출 중...', duration: 2000 },
      { progress: 99, status: '서버 응답 대기 중...', duration: 5000 },
    ]

    let currentIndex = 0

    const runStage = () => {
      if (currentIndex < stages.length) {
        const stage = stages[currentIndex]
        setLoadingState(prev => {
          // 이미 100%면 더 이상 업데이트하지 않음
          if (prev.progress >= 100) return prev
          return {
            ...prev,
            progress: stage.progress,
            status: stage.status,
          }
        })
        currentIndex++
        setTimeout(runStage, stage.duration)
      }
    }

    runStage()
  }, [])

  const fetchLottoData = async () => {
    const startTime = Date.now()
    setLoadingState({
      isLoading: true,
      progress: 0,
      status: '초기화 중...',
      startTime,
      elapsedTime: 0,
    })
    setError(null)

    // 프로그레스 시뮬레이션 시작
    simulateProgress()

    try {
      const res = await fetch('/api/lotto')
      if (!res.ok) throw new Error('로또 데이터를 가져오는데 실패했습니다.')
      const data = await res.json()

      const totalTime = (Date.now() - startTime) / 1000
      setLoadingState(prev => ({
        ...prev,
        progress: 100,
        status: `완료! (${formatTime(totalTime)})`,
        elapsedTime: totalTime,
      }))

      setTimeout(() => {
        setLottoData(data)
        setLoadingState({
          isLoading: false,
          progress: 0,
          status: '',
          startTime: 0,
          elapsedTime: 0,
        })
      }, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
      setLoadingState({
        isLoading: false,
        progress: 0,
        status: '',
        startTime: 0,
        elapsedTime: 0,
      })
    }
  }

  const fetchPensionData = async () => {
    const startTime = Date.now()
    setLoadingState({
      isLoading: true,
      progress: 0,
      status: '연금복권 데이터 수집 중...',
      startTime,
      elapsedTime: 0,
    })
    setError(null)

    try {
      const res = await fetch('/api/pension')
      if (!res.ok) throw new Error('연금복권 데이터를 가져오는데 실패했습니다.')
      const data = await res.json()

      const totalTime = (Date.now() - startTime) / 1000
      setLoadingState(prev => ({
        ...prev,
        progress: 100,
        status: `완료! (${formatTime(totalTime)})`,
        elapsedTime: totalTime,
      }))

      setTimeout(() => {
        setPensionData(data)
        setLoadingState({
          isLoading: false,
          progress: 0,
          status: '',
          startTime: 0,
          elapsedTime: 0,
        })
      }, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
      setLoadingState({
        isLoading: false,
        progress: 0,
        status: '',
        startTime: 0,
        elapsedTime: 0,
      })
    }
  }

  const fetchData = () => {
    if (tab === 'lotto') {
      fetchLottoData()
    } else {
      fetchPensionData()
    }
  }

  useEffect(() => {
    if ((tab === 'lotto' && !lottoData) || (tab === 'pension' && !pensionData)) {
      fetchData()
    }
  }, [tab])

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      {/* 배경 효과 */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      {/* 헤더 */}
      <header className="border-b border-white/10 backdrop-blur-xl sticky top-0 z-50 bg-[#0f0f1a]/80">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold gradient-text">
              로또 예측기
            </h1>
            <button
              onClick={fetchData}
              disabled={loadingState.isLoading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loadingState.isLoading ? '분석 중...' : '새로고침'}
            </button>
          </div>

          {/* 탭 */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setTab('lotto')}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                tab === 'lotto'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              로또 6/45
            </button>
            <button
              onClick={() => setTab('pension')}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                tab === 'pension'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              연금복권 720+
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 로딩 상태 */}
        {loadingState.isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            {/* 스피너 */}
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full" />
              <div
                className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"
                style={{ animationDuration: '1s' }}
              />
              <div className="absolute inset-2 border-4 border-transparent border-t-pink-500 rounded-full animate-spin"
                style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-white">{loadingState.progress}%</span>
              </div>
            </div>

            {/* 프로그레스 바 */}
            <div className="w-full max-w-md mb-4">
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${loadingState.progress}%` }}
                />
              </div>
            </div>

            {/* 상태 메시지 */}
            <p className="text-lg font-medium text-white mb-2">{loadingState.status}</p>
            <p className="text-sm text-gray-500 mb-4">
              {tab === 'lotto' ? '최근 200회차 데이터를 분석합니다' : '연금복권 데이터를 분석합니다'}
            </p>

            {/* 시간 정보 */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-2">
              <div className="text-center p-3 rounded-lg bg-white/5">
                <p className="text-xs text-gray-500 mb-1">경과 시간</p>
                <p className="text-lg font-bold text-blue-400">
                  {formatTime(loadingState.elapsedTime)}
                </p>
              </div>
              <div className={`text-center p-3 rounded-lg ${
                isTimeCritical ? 'bg-red-500/20 border border-red-500/50' :
                isTimeWarning ? 'bg-yellow-500/20 border border-yellow-500/50' :
                'bg-white/5'
              }`}>
                <p className="text-xs text-gray-500 mb-1">타임아웃까지</p>
                <p className={`text-lg font-bold ${
                  isTimeCritical ? 'text-red-400 animate-pulse' :
                  isTimeWarning ? 'text-yellow-400' :
                  'text-green-400'
                }`}>
                  {formatTime(remainingTime)}
                </p>
              </div>
            </div>

            {/* 타임아웃 경고 */}
            {isTimeWarning && (
              <p className={`text-sm mt-3 ${isTimeCritical ? 'text-red-400' : 'text-yellow-400'}`}>
                {isTimeCritical
                  ? '타임아웃 임박! 잠시 후 다시 시도해주세요.'
                  : '서버 응답이 지연되고 있습니다...'}
              </p>
            )}
          </div>
        )}

        {error && !loadingState.isLoading && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchData}
              className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 로또 결과 */}
        {!loadingState.isLoading && !error && tab === 'lotto' && lottoData && (
          <div className="space-y-8">
            {/* 회차 정보 */}
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
              <p className="text-sm text-gray-400 mb-1">다음 추첨</p>
              <p className="text-3xl font-bold text-white mb-2">
                제 {lottoData.nextRound}회
              </p>
              <p className="text-gray-400">
                최근 추첨: {lottoData.latestRound}회 ({lottoData.latestDate} {lottoData.latestDayOfWeek}요일)
              </p>
              <p className="text-sm text-gray-500 mt-1">
                총 {lottoData.totalRounds}회차 데이터 분석 완료
                {lottoData.cached && <span className="ml-2 text-green-400">(캐시)</span>}
              </p>
            </div>

            {/* 최근 당첨 번호 */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h2 className="text-xl font-bold mb-4">최근 당첨 번호</h2>
              <div className="space-y-3">
                {lottoData.recentResults.slice(0, 5).map((result) => (
                  <div key={result.round} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <div className="w-20 text-sm">
                      <p className="font-bold text-white">{result.round}회</p>
                      <p className="text-xs text-gray-500">{result.date.slice(5)} ({result.dayOfWeek})</p>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      {result.numbers.map((num, idx) => (
                        <span
                          key={idx}
                          className={`w-8 h-8 rounded-full bg-gradient-to-br ${getBallColor(num)} flex items-center justify-center text-sm font-bold text-white shadow-lg`}
                        >
                          {num}
                        </span>
                      ))}
                      <span className="mx-1 text-gray-500">+</span>
                      <span className={`w-8 h-8 rounded-full bg-gradient-to-br ${getBallColor(result.bonus)} flex items-center justify-center text-sm font-bold text-white shadow-lg opacity-60`}>
                        {result.bonus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 추천 번호 15개 순위 */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
              <h2 className="text-xl font-bold mb-2">AI 추천 번호 TOP 15</h2>
              <p className="text-sm text-gray-400 mb-6">
                통계, 확률, 트렌드 분석을 종합한 순위입니다
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {lottoData.rankedNumbers.map((item) => (
                  <div
                    key={item.number}
                    className={`p-4 rounded-xl border transition-all hover:scale-105 ${
                      item.rank <= 3
                        ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/40'
                        : item.rank <= 6
                        ? 'bg-gradient-to-br from-purple-500/15 to-pink-500/15 border-purple-500/30'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        item.rank <= 3 ? 'bg-yellow-500/30 text-yellow-300' : 'bg-white/10 text-gray-400'
                      }`}>
                        {item.rank}위
                      </span>
                      <span className="text-xs text-gray-500">CDM: {(item.cdmScore ?? item.score ?? 0).toFixed(4)}</span>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      <span className={`w-12 h-12 rounded-full bg-gradient-to-br ${getBallColor(item.number)} flex items-center justify-center text-xl font-bold text-white shadow-lg`}>
                        {item.number}
                      </span>
                      <div className="text-xs text-gray-400">
                        <p>출현: {item.frequency}회</p>
                        <p>미출현: {item.consecutiveMiss}회</p>
                      </div>
                    </div>

                    {item.reasons.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.reasons.slice(0, 2).map((reason, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-gray-400">
                            {reason}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>

            {/* AI 추천 15세트 */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
              <h2 className="text-xl font-bold mb-2">AI 추천 15세트</h2>
              <p className="text-sm text-gray-400 mb-6">
                확률/통계 분석으로 생성된 최적의 번호 조합입니다
              </p>

              <div className="space-y-3">
                {lottoData.recommendedSets?.map((set) => (
                  <div
                    key={set.set}
                    className={`p-4 rounded-xl border transition-all ${
                      set.set <= 3
                        ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30'
                        : set.set <= 6
                        ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold px-2 py-0.5 rounded ${
                          set.set <= 3 ? 'bg-yellow-500/30 text-yellow-300' : 'bg-white/10 text-gray-400'
                        }`}>
                          {set.set}순위
                        </span>
                        <span className="text-xs text-gray-500">{set.description || set.method}</span>
                      </div>
                      <span className={`text-sm font-bold ${
                        set.score >= 80 ? 'text-green-400' : set.score >= 60 ? 'text-yellow-400' : 'text-gray-400'
                      }`}>
                        {set.score.toFixed(1)}점
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center">
                      {set.numbers.map((num, idx) => (
                        <span
                          key={idx}
                          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br ${getBallColor(num)} flex items-center justify-center text-sm sm:text-base font-bold text-white shadow-lg`}
                        >
                          {num}
                        </span>
                      ))}
                    </div>

                    <p className="text-center text-xs text-gray-500 mt-2">
                      합계: {set.numbers.reduce((a, b) => a + b, 0)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 패턴 분석 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                <p className="text-xs text-gray-500 mb-1">평균 합계</p>
                <p className="text-xl font-bold text-white">{lottoData.patterns.sumRange.avg}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                <p className="text-xs text-gray-500 mb-1">최다 홀짝</p>
                <p className="text-xl font-bold text-white">{lottoData.patterns.oddEvenMostCommon}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                <p className="text-xs text-gray-500 mb-1">최다 고저</p>
                <p className="text-xl font-bold text-white">{lottoData.patterns.highLowMostCommon}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                <p className="text-xs text-gray-500 mb-1">연번 확률</p>
                <p className="text-xl font-bold text-white">{lottoData.patterns.consecutivePairsPercent}%</p>
              </div>
            </div>
          </div>
        )}

        {/* 연금복권 결과 */}
        {!loadingState.isLoading && !error && tab === 'pension' && pensionData && (
          <div className="space-y-6">
            {/* 회차 정보 */}
            <div className="text-center mb-8">
              <p className="text-gray-400">
                다음 회차: <span className="text-white font-bold">{pensionData.nextRound}회</span>
              </p>
              <p className="text-sm text-gray-500">
                최근 {pensionData.latestRound}회차까지 분석 완료
              </p>
            </div>

            {/* 예측 결과 */}
            <div className="space-y-4">
              {pensionData.predictions.map((pred, idx) => (
                <div
                  key={idx}
                  className={`
                    p-6 rounded-2xl border backdrop-blur-sm card-hover
                    ${idx === 0
                      ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30'
                      : 'bg-white/5 border-white/10'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className={`
                        px-3 py-1 rounded-full text-sm font-medium
                        ${idx === 0 ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-gray-400'}
                      `}>
                        {idx === 0 ? '추천 1순위' : `추천 ${idx + 1}순위`}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">신뢰도</p>
                      <p className={`text-2xl font-bold ${
                        pred.confidence >= 70 ? 'text-green-400' :
                        pred.confidence >= 50 ? 'text-yellow-400' : 'text-gray-400'
                      }`}>
                        {pred.confidence}%
                      </p>
                    </div>
                  </div>

                  <PensionNumber group={pred.group} numbers={pred.numbers} />

                  {pred.reasons.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {pred.reasons.map((reason, i) => (
                        <span key={i} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400">
                          {reason}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 자릿수별 통계 */}
            <div className="mt-8">
              <h3 className="font-bold text-lg mb-4">자릿수별 핫/콜드 번호</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {pensionData.hotByPosition.map((pos, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-sm text-gray-400 mb-2">{pos.position}번째 자리</p>
                    <div className="flex gap-2">
                      <div>
                        <p className="text-xs text-red-400 mb-1">핫</p>
                        <div className="flex gap-1">
                          {pos.hotNumbers.map((n) => (
                            <span key={n} className="w-6 h-6 rounded bg-red-500/30 flex items-center justify-center text-xs font-bold">
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-blue-400 mb-1">콜드</p>
                        <div className="flex gap-1">
                          {pensionData.coldByPosition[idx]?.coldNumbers.map((n) => (
                            <span key={n} className="w-6 h-6 rounded bg-blue-500/30 flex items-center justify-center text-xs font-bold">
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
        )}
      </main>

      {/* 면책 조항 */}
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-xs text-gray-500">
          본 서비스는 과거 데이터를 기반으로 한 통계적 분석입니다.
          <br />
          실제 당첨을 보장하지 않으며, 도박 중독에 주의하세요.
        </p>
        <p className="text-xs text-gray-600 mt-2">
          마지막 업데이트: {lottoData?.lastUpdate || pensionData?.lastUpdate
            ? new Date(lottoData?.lastUpdate || pensionData?.lastUpdate || '').toLocaleString('ko-KR')
            : '-'}
        </p>
      </footer>
    </div>
  )
}
