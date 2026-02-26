'use client'

import { useState, useEffect, useCallback } from 'react'
import { LottoBalls } from '@/components/LottoBall'
import { PensionNumber } from '@/components/PensionNumber'
import AdBanner from '@/components/AdBanner'

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

interface BacktestSet {
  set: number
  numbers: number[]
  score: number
  method: string
  hitRate: number
  recentHitRate: number
}

interface ConsensusNumber {
  number: number
  count: number
}

interface LottoMatchInfo {
  targetRound: number
  actualNumbers: number[]
  actualBonus: number
  actualDate: string
  top15Matched: number
  top15MatchedNumbers: number[]
  setMatches: Array<{
    set: number
    method: string
    numbers: number[]
    matched: number
    matchedNumbers: number[]
  }>
  bestSetMatch: number
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
  matchInfo?: LottoMatchInfo
  isHistorical?: boolean
  backtestSets?: BacktestSet[]
  consensusNumbers?: ConsensusNumber[]
}

interface PensionAnalysis {
  predictions: Array<{
    group: number
    numbers: number[]
    confidence: number
    reasons: string[]
    cdmScore?: number
  }>
  hotByPosition: Array<{ position: number; hotNumbers: number[] }>
  coldByPosition: Array<{ position: number; coldNumbers: number[] }>
  groupStats?: Array<{ group: number; score: number; frequency: number; probability: number }>
  recommendedSets?: Array<{
    set: number
    group: number
    numbers: number[]
    score: number
    method?: string
    numberString?: string
  }>
  digitPredictions?: Array<{
    position: number
    top3: Array<{ digit: number; cdmScore: number; frequency: number }>
  }>
  recentResults?: Array<{
    round: number
    date: string
    group: number
    numbers: number[]
  }>
  nextRound: number
  latestRound: number
  lastUpdate: string
  method?: string
  totalResults?: number
  matchInfo?: {
    targetRound: number
    actualGroup: number
    actualNumbers: number[]
    actualDate: string
    setMatches: Array<{
      set: number
      method: string
      numbers: number[]
      matchedDigits: number
      matchedPositions: number[]
      consecutiveFromEnd: number
      prize: string
    }>
    bestConsecutiveMatch: number
  }
  isHistorical?: boolean
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

  // 회차 선택 상태
  const [selectedLottoRound, setSelectedLottoRound] = useState<number | null>(null)
  const [selectedPensionRound, setSelectedPensionRound] = useState<number | null>(null)
  const [lottoRoundInput, setLottoRoundInput] = useState<string>('')
  const [pensionRoundInput, setPensionRoundInput] = useState<string>('')

  // 스마트 랜덤 생성기
  const [randomSets, setRandomSets] = useState<number[][]>([])
  const [isRolling, setIsRolling] = useState(false)

  const generateSmartRandom = useCallback(() => {
    setIsRolling(true)

    const getBand = (n: number) => {
      if (n <= 9) return 0
      if (n <= 19) return 1
      if (n <= 29) return 2
      if (n <= 39) return 3
      return 4
    }

    const isValid = (nums: number[]): boolean => {
      const sorted = [...nums].sort((a, b) => a - b)
      // 홀짝 비율 2:4 ~ 4:2
      const oddCount = sorted.filter(n => n % 2 === 1).length
      if (oddCount < 2 || oddCount > 4) return false
      // 고저 비율 2:4 ~ 4:2
      const lowCount = sorted.filter(n => n <= 22).length
      if (lowCount < 2 || lowCount > 4) return false
      // 합계 100~180
      const sum = sorted.reduce((a, b) => a + b, 0)
      if (sum < 100 || sum > 180) return false
      // 최소 3개 번호대
      const bands = new Set(sorted.map(getBand))
      if (bands.size < 3) return false
      // 연번 최대 1쌍
      let consecutivePairs = 0
      for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i + 1] - sorted[i] === 1) consecutivePairs++
      }
      if (consecutivePairs > 1) return false
      return true
    }

    const generateOne = (): number[] => {
      for (let attempt = 0; attempt < 1000; attempt++) {
        const pool = Array.from({ length: 45 }, (_, i) => i + 1)
        const picked: number[] = []
        for (let i = 0; i < 6; i++) {
          const idx = Math.floor(Math.random() * pool.length)
          picked.push(pool[idx])
          pool.splice(idx, 1)
        }
        if (isValid(picked)) return picked.sort((a, b) => a - b)
      }
      // fallback
      return [3, 11, 22, 28, 35, 43]
    }

    // 애니메이션 지연
    setTimeout(() => {
      const sets: number[][] = []
      for (let i = 0; i < 5; i++) {
        sets.push(generateOne())
      }
      setRandomSets(sets)
      setIsRolling(false)
    }, 600)
  }, [])

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

  const fetchLottoData = async (round?: number | null) => {
    const startTime = Date.now()
    setLoadingState({
      isLoading: true,
      progress: 0,
      status: round ? `${round}회차 예측 조회 중...` : '초기화 중...',
      startTime,
      elapsedTime: 0,
    })
    setError(null)

    // 프로그레스 시뮬레이션 시작
    simulateProgress()

    try {
      const url = round ? `/api/lotto?round=${round}` : '/api/lotto'
      const res = await fetch(url)
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
        setSelectedLottoRound(round || null)
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

  const fetchPensionData = async (round?: number | null) => {
    const startTime = Date.now()
    setLoadingState({
      isLoading: true,
      progress: 0,
      status: round ? `${round}회차 예측 조회 중...` : '연금복권 데이터 수집 중...',
      startTime,
      elapsedTime: 0,
    })
    setError(null)

    try {
      const url = round ? `/api/pension?round=${round}` : '/api/pension'
      const res = await fetch(url)
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
        setSelectedPensionRound(round || null)
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
            {/* 회차 선택기 */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="text-sm text-gray-400">특정 회차 조회:</span>
                <input
                  type="number"
                  value={lottoRoundInput}
                  onChange={(e) => setLottoRoundInput(e.target.value)}
                  placeholder={`예: ${lottoData.latestRound - 10}`}
                  className="w-28 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-center focus:outline-none focus:border-yellow-500"
                />
                <button
                  onClick={() => {
                    const round = parseInt(lottoRoundInput)
                    if (round && round > 10 && round <= lottoData.latestRound) {
                      fetchLottoData(round)
                    }
                  }}
                  disabled={!lottoRoundInput || loadingState.isLoading}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  조회
                </button>
                {selectedLottoRound && (
                  <button
                    onClick={() => {
                      setLottoRoundInput('')
                      fetchLottoData(null)
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    최신으로
                  </button>
                )}
              </div>
              {selectedLottoRound && (
                <p className="text-center text-xs text-yellow-400 mt-2">
                  {selectedLottoRound}회차 시점 예측 결과 조회 중
                </p>
              )}
            </div>

            {/* 회차 정보 */}
            <div className={`text-center p-6 rounded-2xl border ${
              lottoData.isHistorical
                ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30'
                : 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30'
            }`}>
              <p className="text-sm text-gray-400 mb-1">
                {lottoData.isHistorical ? '조회 회차' : '다음 추첨'}
              </p>
              <p className="text-3xl font-bold text-white mb-2">
                제 {lottoData.nextRound}회
              </p>
              <p className="text-gray-400">
                {lottoData.isHistorical
                  ? `${lottoData.latestRound}회차까지 데이터로 예측`
                  : `최근 추첨: ${lottoData.latestRound}회 (${lottoData.latestDate} ${lottoData.latestDayOfWeek}요일)`}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                총 {lottoData.totalRounds}회차 데이터 분석 완료
                {lottoData.cached && <span className="ml-2 text-green-400">(캐시)</span>}
              </p>
            </div>

            {/* 스마트 랜덤 생성기 */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/30">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold">스마트 랜덤 번호 뽑기</h2>
                <span className="text-xs text-gray-500 bg-white/10 px-2 py-1 rounded">5,000원</span>
              </div>
              <p className="text-sm text-gray-400 mb-5">
                홀짝, 고저, 합계, 번호대 균형을 맞춘 랜덤 번호 5게임
              </p>

              <div className="flex justify-center mb-5">
                <button
                  onClick={generateSmartRandom}
                  disabled={isRolling}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 rounded-xl text-base font-bold text-white shadow-lg transition-all disabled:opacity-50 active:scale-95"
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
                <div className="space-y-3">
                  {randomSets.map((set, gameIdx) => (
                    <div
                      key={gameIdx}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                    >
                      <span className="text-sm font-bold text-orange-400 w-6">{String.fromCharCode(65 + gameIdx)}</span>
                      <div className="flex gap-2 flex-wrap justify-center flex-1">
                        {set.map((num, idx) => (
                          <span
                            key={idx}
                            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br ${getBallColor(num)} flex items-center justify-center text-sm sm:text-base font-bold text-white shadow-lg`}
                          >
                            {num}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 w-12 text-right">
                        {set.reduce((a, b) => a + b, 0)}
                      </span>
                    </div>
                  ))}
                  <p className="text-center text-xs text-gray-600 mt-2">
                    홀짝 2:4~4:2 / 고저 2:4~4:2 / 합계 100~180 / 3개+ 번호대
                  </p>
                </div>
              )}
            </div>

            {/* 광고 슬롯 1 */}
            <AdBanner slot="after-random" />

            {/* 실제 당첨번호 비교 (과거 회차 조회 시) */}
            {lottoData.matchInfo && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
                <h2 className="text-xl font-bold mb-4 text-green-400">
                  {lottoData.matchInfo.targetRound}회 실제 당첨번호 비교
                </h2>
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">실제 당첨번호 ({lottoData.matchInfo.actualDate})</p>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {lottoData.matchInfo.actualNumbers.map((num, idx) => (
                      <span
                        key={idx}
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${getBallColor(num)} flex items-center justify-center text-sm font-bold text-white shadow-lg`}
                      >
                        {num}
                      </span>
                    ))}
                    <span className="mx-1 text-gray-500">+</span>
                    <span className={`w-10 h-10 rounded-full bg-gradient-to-br ${getBallColor(lottoData.matchInfo.actualBonus)} flex items-center justify-center text-sm font-bold text-white shadow-lg opacity-60`}>
                      {lottoData.matchInfo.actualBonus}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-sm text-gray-400 mb-2">TOP 15 추천번호 적중</p>
                    <p className="text-3xl font-bold text-green-400">
                      {lottoData.matchInfo.top15Matched}개 / 6개
                    </p>
                    {lottoData.matchInfo.top15MatchedNumbers.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {lottoData.matchInfo.top15MatchedNumbers.map((num, idx) => (
                          <span key={idx} className="px-2 py-1 bg-green-500/30 rounded text-green-300 text-sm">
                            {num}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-sm text-gray-400 mb-2">추천세트 최고 적중</p>
                    <p className="text-3xl font-bold text-yellow-400">
                      {lottoData.matchInfo.bestSetMatch}개 / 6개
                    </p>
                  </div>
                </div>

                {/* 세트별 적중 결과 */}
                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-2">세트별 적중 결과</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {lottoData.matchInfo.setMatches.slice(0, 5).map((set) => (
                      <div
                        key={set.set}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          set.matched >= 4 ? 'bg-green-500/20' : set.matched >= 3 ? 'bg-yellow-500/20' : 'bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{set.set}세트</span>
                          <div className="flex gap-1">
                            {set.numbers.map((num, idx) => (
                              <span
                                key={idx}
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                  set.matchedNumbers.includes(num)
                                    ? 'bg-green-500 text-white'
                                    : 'bg-white/10 text-gray-400'
                                }`}
                              >
                                {num}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className={`font-bold ${
                          set.matched >= 4 ? 'text-green-400' : set.matched >= 3 ? 'text-yellow-400' : 'text-gray-400'
                        }`}>
                          {set.matched}개 적중
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

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

            {/* 광고 슬롯 2 */}
            <AdBanner slot="after-recommended" />

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

            {/* 백테스트 기반 추천 10세트 */}
            {lottoData.backtestSets && lottoData.backtestSets.length > 0 && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
                <h2 className="text-xl font-bold mb-2">백테스트 검증 추천 10세트</h2>
                <p className="text-sm text-gray-400 mb-4">
                  {lottoData.totalRounds}회차 전체를 역추적 검증하여 실제로 2~3개씩 맞춘 공식들입니다
                </p>

                {/* 컨센서스 번호 */}
                {lottoData.consensusNumbers && lottoData.consensusNumbers.length > 0 && (
                  <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-gray-400 mb-3">20개 공식 중 다수가 선택한 핵심 번호</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {lottoData.consensusNumbers.slice(0, 6).map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <span
                            className={`w-11 h-11 rounded-full bg-gradient-to-br ${getBallColor(item.number)} flex items-center justify-center text-base font-bold text-white shadow-lg ring-2 ring-yellow-400/50`}
                          >
                            {item.number}
                          </span>
                          <span className="text-xs text-yellow-400 mt-1">{item.count}회</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {lottoData.backtestSets.map((set) => (
                    <div
                      key={set.set}
                      className={`p-4 rounded-xl border transition-all ${
                        set.set <= 3
                          ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold px-2 py-0.5 rounded ${
                            set.set <= 3 ? 'bg-blue-500/30 text-blue-300' : 'bg-white/10 text-gray-400'
                          }`}>
                            {set.set}순위
                          </span>
                          <span className="text-xs text-gray-500">{set.method}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">
                            전체 {set.hitRate}% / 최근 {set.recentHitRate}%
                          </span>
                          <span className={`text-sm font-bold ${
                            set.score >= 30 ? 'text-blue-400' : set.score >= 20 ? 'text-cyan-400' : 'text-gray-400'
                          }`}>
                            {set.score.toFixed(1)}점
                          </span>
                        </div>
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
            )}

            {/* 광고 슬롯 3 */}
            <AdBanner slot="page-bottom" />
          </div>
        )}

        {/* 연금복권 결과 */}
        {!loadingState.isLoading && !error && tab === 'pension' && pensionData && (
          <div className="space-y-6">
            {/* 회차 선택기 */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="text-sm text-gray-400">특정 회차 조회:</span>
                <input
                  type="number"
                  value={pensionRoundInput}
                  onChange={(e) => setPensionRoundInput(e.target.value)}
                  placeholder={`예: ${pensionData.latestRound - 10}`}
                  className="w-28 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-center focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={() => {
                    const round = parseInt(pensionRoundInput)
                    if (round && round > 10 && round <= pensionData.latestRound) {
                      fetchPensionData(round)
                    }
                  }}
                  disabled={!pensionRoundInput || loadingState.isLoading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  조회
                </button>
                {selectedPensionRound && (
                  <button
                    onClick={() => {
                      setPensionRoundInput('')
                      fetchPensionData(null)
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    최신으로
                  </button>
                )}
              </div>
              {selectedPensionRound && (
                <p className="text-center text-xs text-purple-400 mt-2">
                  {selectedPensionRound}회차 시점 예측 결과 조회 중
                </p>
              )}
            </div>

            {/* 회차 정보 */}
            <div className={`text-center p-6 rounded-2xl border ${
              pensionData.isHistorical
                ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30'
                : 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30'
            }`}>
              <p className="text-sm text-gray-400 mb-1">
                {pensionData.isHistorical ? '조회 회차' : '다음 추첨'}
              </p>
              <p className="text-3xl font-bold text-white mb-2">
                제 {pensionData.nextRound}회
              </p>
              <p className="text-gray-400">
                {pensionData.isHistorical
                  ? `${pensionData.latestRound}회차까지 데이터로 예측`
                  : `${pensionData.latestRound}회차까지 ${pensionData.totalResults || pensionData.latestRound}개 데이터 분석`}
              </p>
              <p className="text-xs text-purple-400 mt-2">
                {pensionData.method || 'CDM 분석'}
              </p>
            </div>

            {/* 실제 당첨번호 비교 (과거 회차 조회 시) */}
            {pensionData.matchInfo && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
                <h2 className="text-xl font-bold mb-4 text-green-400">
                  {pensionData.matchInfo.targetRound}회 실제 당첨번호 비교
                </h2>
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">실제 당첨번호 ({pensionData.matchInfo.actualDate})</p>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <span className="w-10 h-10 rounded-lg bg-amber-500/30 flex items-center justify-center font-bold text-amber-300">
                      {pensionData.matchInfo.actualGroup}조
                    </span>
                    {pensionData.matchInfo.actualNumbers.map((num, idx) => (
                      <span
                        key={idx}
                        className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center text-lg font-bold text-white"
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 mb-4">
                  <p className="text-sm text-gray-400 mb-2">뒤 6자리 최고 연속 적중</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    {pensionData.matchInfo.bestConsecutiveMatch}자리 연속
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    (뒤에서부터 연속으로 맞춘 자릿수)
                  </p>
                </div>

                {/* 세트별 적중 결과 */}
                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-2">세트별 적중 결과 (뒤 6자리 기준)</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {pensionData.matchInfo.setMatches.slice(0, 8).map((set) => (
                      <div
                        key={set.set}
                        className={`p-3 rounded-lg ${
                          set.consecutiveFromEnd >= 4 ? 'bg-green-500/20 border border-green-500/40' :
                          set.consecutiveFromEnd >= 2 ? 'bg-yellow-500/20 border border-yellow-500/40' :
                          'bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">{set.set}세트 ({set.method})</span>
                          <span className={`text-sm font-bold ${
                            set.consecutiveFromEnd >= 4 ? 'text-green-400' :
                            set.consecutiveFromEnd >= 2 ? 'text-yellow-400' :
                            'text-gray-400'
                          }`}>
                            {set.prize}
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          {set.numbers.map((num, idx) => (
                            <span
                              key={idx}
                              className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold ${
                                set.matchedPositions.includes(idx + 1)
                                  ? 'bg-green-500 text-white'
                                  : 'bg-white/10 text-gray-400'
                              }`}
                            >
                              {num}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-center text-gray-500 mt-1">
                          {set.matchedDigits}자리 일치 (연속 {set.consecutiveFromEnd}자리)
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 최근 당첨 번호 */}
            {pensionData.recentResults && pensionData.recentResults.length > 0 && (
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h2 className="text-xl font-bold mb-4">최근 당첨 번호</h2>
                <div className="space-y-3">
                  {pensionData.recentResults.map((result) => (
                    <div key={result.round} className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
                      <div className="w-24">
                        <p className="font-bold text-white">{result.round}회</p>
                        <p className="text-xs text-gray-500">{result.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded bg-purple-500/30 flex items-center justify-center font-bold text-purple-300">
                          {result.group}조
                        </span>
                        <div className="flex gap-1">
                          {result.numbers.map((n, idx) => (
                            <span
                              key={idx}
                              className="w-8 h-8 rounded bg-gradient-to-br from-pink-500/30 to-purple-500/30 flex items-center justify-center font-bold text-white"
                            >
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CDM 기반 TOP 3 예측 */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
              <h2 className="text-xl font-bold mb-2">CDM 기반 1등 예측 TOP 3</h2>
              <p className="text-sm text-gray-400 mb-6">
                논문(arXiv:2403.12836) 기반 순수 확률 예측
              </p>

              <div className="space-y-4">
                {pensionData.predictions.map((pred, idx) => (
                  <div
                    key={idx}
                    className={`
                      p-5 rounded-xl border backdrop-blur-sm transition-all hover:scale-[1.01]
                      ${idx === 0
                        ? 'bg-gradient-to-r from-yellow-500/15 to-orange-500/15 border-yellow-500/40'
                        : idx === 1
                        ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30'
                        : 'bg-white/5 border-white/10'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                          ${idx === 0 ? 'bg-yellow-500/30 text-yellow-300' :
                            idx === 1 ? 'bg-purple-500/30 text-purple-300' :
                            'bg-white/10 text-gray-400'}
                        `}>
                          {idx + 1}
                        </span>
                        <span className="text-sm text-gray-400">{pred.reasons[0]}</span>
                      </div>
                      {pred.cdmScore && (
                        <span className="text-sm font-mono text-green-400">
                          CDM: {pred.cdmScore.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <PensionNumber numbers={pred.numbers} showGroup={false} />
                  </div>
                ))}
              </div>
            </div>

            {/* 조별 CDM 분석 */}
            {pensionData.groupStats && (
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="font-bold text-lg mb-4">조(Group) CDM 분석</h3>
                <div className="grid grid-cols-5 gap-2">
                  {pensionData.groupStats.map((g) => (
                    <div
                      key={g.group}
                      className={`p-3 rounded-lg text-center transition-all ${
                        g.group === pensionData.groupStats![0].group
                          ? 'bg-purple-500/20 border border-purple-500/40'
                          : 'bg-white/5'
                      }`}
                    >
                      <p className="text-2xl font-bold text-white">{g.group}조</p>
                      <p className="text-xs text-gray-400">{g.frequency}회</p>
                      <p className="text-sm text-purple-400 font-medium">{g.probability}%</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 자릿수별 CDM TOP3 */}
            {pensionData.digitPredictions && (
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="font-bold text-lg mb-4">자릿수별 CDM TOP3</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {pensionData.digitPredictions.map((pos) => (
                    <div key={pos.position} className="p-4 rounded-xl bg-white/5">
                      <p className="text-sm text-gray-400 mb-3">{pos.position}번째 자리</p>
                      <div className="flex gap-2">
                        {pos.top3.map((item, i) => (
                          <div key={item.digit} className="text-center">
                            <span className={`
                              w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold mb-1
                              ${i === 0 ? 'bg-yellow-500/30 text-yellow-300' :
                                i === 1 ? 'bg-gray-500/30 text-gray-300' :
                                'bg-orange-900/30 text-orange-300'}
                            `}>
                              {item.digit}
                            </span>
                            <p className="text-[10px] text-gray-500">{item.cdmScore}점</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 추천 15세트 */}
            {pensionData.recommendedSets && pensionData.recommendedSets.length > 3 && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
                <h3 className="font-bold text-lg mb-2">CDM 추천 세트</h3>
                <p className="text-sm text-gray-400 mb-4">
                  다양한 CDM 전략 기반 조합
                </p>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {pensionData.recommendedSets.slice(3).map((set) => (
                    <div
                      key={set.set}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-6">{set.set}.</span>
                        <span className="font-mono text-white">{set.numbers.join('')}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">{set.method}</span>
                        <span className="text-sm text-green-400 font-medium">{set.score.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 자릿수별 핫/콜드 번호 */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="font-bold text-lg mb-4">자릿수별 핫/콜드 번호</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {pensionData.hotByPosition.map((pos, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/5">
                    <p className="text-sm text-gray-400 mb-2">{pos.position}번째 자리</p>
                    <div className="flex gap-4">
                      <div>
                        <p className="text-xs text-red-400 mb-1">핫</p>
                        <div className="flex gap-1">
                          {pos.hotNumbers.map((n, i) => (
                            <span key={`hot-${n}-${i}`} className="w-6 h-6 rounded bg-red-500/30 flex items-center justify-center text-xs font-bold">
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-blue-400 mb-1">콜드</p>
                        <div className="flex gap-1">
                          {pensionData.coldByPosition[idx]?.coldNumbers.map((n, i) => (
                            <span key={`cold-${n}-${i}`} className="w-6 h-6 rounded bg-blue-500/30 flex items-center justify-center text-xs font-bold">
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
