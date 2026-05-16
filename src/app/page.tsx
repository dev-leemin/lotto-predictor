'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { LottoFullAnalysis, PensionAnalysis, LoadingState } from '@/types/lotto'
import { formatTime } from '@/lib/lotto-utils'
import LottoTab from '@/components/LottoTab'
import PensionTab from '@/components/PensionTab'

type Tab = 'lotto' | 'pension'

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

  // 회차 선택
  const [selectedLottoRound, setSelectedLottoRound] = useState<number | null>(null)
  const [selectedPensionRound, setSelectedPensionRound] = useState<number | null>(null)
  const [lottoRoundInput, setLottoRoundInput] = useState<string>('')
  const [pensionRoundInput, setPensionRoundInput] = useState<string>('')

  // 다음 추첨 카운트다운
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const getNextDrawDate = () => {
      const now = new Date()
      const day = now.getDay()
      let daysUntilSat = (6 - day + 7) % 7
      if (daysUntilSat === 0) {
        const drawTime = new Date(now)
        drawTime.setHours(20, 35, 0, 0)
        if (now >= drawTime) daysUntilSat = 7
      }
      const nextDraw = new Date(now)
      nextDraw.setDate(now.getDate() + daysUntilSat)
      nextDraw.setHours(20, 35, 0, 0)
      return nextDraw
    }

    const updateCountdown = () => {
      const now = new Date()
      const target = getNextDrawDate()
      const diff = target.getTime() - now.getTime()
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  // 스마트 랜덤 (로또)
  const [randomSets, setRandomSets] = useState<number[][]>([])
  const [isRolling, setIsRolling] = useState(false)
  const [excludeNumbers, setExcludeNumbers] = useState<number[]>([])
  const [includeNumbers, setIncludeNumbers] = useState<number[]>([])

  // 스마트 랜덤 (연금복권)
  const [pensionRandomSets, setPensionRandomSets] = useState<Array<{ group: number; numbers: number[] }>>([])
  const [isPensionRolling, setIsPensionRolling] = useState(false)

  // 섹션 접기/펼치기
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const toggleSection = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))
  const isSectionOpen = (key: string) => !!expanded[key]

  // 섹션 참조
  const sectionRefs = {
    recent: useRef<HTMLDivElement>(null),
    top15: useRef<HTMLDivElement>(null),
    ensemble: useRef<HTMLDivElement>(null),
    sets: useRef<HTMLDivElement>(null),
  }

  // --- 스마트 랜덤 생성 ---
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
      const oddCount = sorted.filter(n => n % 2 === 1).length
      if (oddCount < 2 || oddCount > 4) return false
      const lowCount = sorted.filter(n => n <= 22).length
      if (lowCount < 2 || lowCount > 4) return false
      const sum = sorted.reduce((a, b) => a + b, 0)
      if (sum < 100 || sum > 180) return false
      const bands = new Set(sorted.map(getBand))
      if (bands.size < 3) return false
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
          .filter(n => !excludeNumbers.includes(n))
        const picked: number[] = [...includeNumbers.filter(n => !excludeNumbers.includes(n))]
        const remaining = pool.filter(n => !picked.includes(n))
        while (picked.length < 6 && remaining.length > 0) {
          const idx = Math.floor(Math.random() * remaining.length)
          picked.push(remaining[idx])
          remaining.splice(idx, 1)
        }
        if (picked.length === 6 && isValid(picked)) return picked.sort((a, b) => a - b)
      }
      const pool = Array.from({ length: 45 }, (_, i) => i + 1)
        .filter(n => !excludeNumbers.includes(n))
      const picked: number[] = [...includeNumbers.filter(n => !excludeNumbers.includes(n))]
      const remaining = pool.filter(n => !picked.includes(n))
      while (picked.length < 6 && remaining.length > 0) {
        const idx = Math.floor(Math.random() * remaining.length)
        picked.push(remaining[idx])
        remaining.splice(idx, 1)
      }
      return picked.sort((a, b) => a - b)
    }

    const sets: number[][] = []
    for (let i = 0; i < 5; i++) {
      sets.push(generateOne())
    }
    setRandomSets(sets)
    setIsRolling(false)
  }, [excludeNumbers, includeNumbers])

  const generatePensionRandom = useCallback(() => {
    setIsPensionRolling(true)

    const generateOne = (): { group: number; numbers: number[] } => {
      const group = Math.floor(Math.random() * 5) + 1
      const numbers: number[] = []
      for (let i = 0; i < 6; i++) {
        numbers.push(Math.floor(Math.random() * 10))
      }
      const unique = new Set(numbers)
      if (unique.size === 1) {
        numbers[Math.floor(Math.random() * 6)] = (numbers[0] + 1 + Math.floor(Math.random() * 9)) % 10
      }
      return { group, numbers }
    }

    const sets: Array<{ group: number; numbers: number[] }> = []
    for (let i = 0; i < 5; i++) {
      sets.push(generateOne())
    }
    setPensionRandomSets(sets)
    setIsPensionRolling(false)
  }, [])

  // --- 로딩 타이머 ---
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (loadingState.isLoading && loadingState.startTime > 0) {
      interval = setInterval(() => {
        const elapsed = (Date.now() - loadingState.startTime) / 1000
        setLoadingState(prev => ({ ...prev, elapsedTime: elapsed }))
      }, 500)
    }
    return () => clearInterval(interval)
  }, [loadingState.isLoading, loadingState.startTime])

  const remainingTime = Math.max(0, VERCEL_TIMEOUT - loadingState.elapsedTime)
  const isTimeWarning = remainingTime < 15 && remainingTime > 0
  const isTimeCritical = remainingTime < 5 && remainingTime > 0

  const simulateProgress = useCallback(() => {
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
          if (prev.progress >= 100) return prev
          return { ...prev, progress: stage.progress, status: stage.status }
        })
        currentIndex++
        setTimeout(runStage, stage.duration)
      }
    }
    runStage()
  }, [])

  // --- 데이터 fetch ---
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
        setLoadingState({ isLoading: false, progress: 0, status: '', startTime: 0, elapsedTime: 0 })
      }, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
      setLoadingState({ isLoading: false, progress: 0, status: '', startTime: 0, elapsedTime: 0 })
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
        setLoadingState({ isLoading: false, progress: 0, status: '', startTime: 0, elapsedTime: 0 })
      }, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
      setLoadingState({ isLoading: false, progress: 0, status: '', startTime: 0, elapsedTime: 0 })
    }
  }

  const fetchData = () => {
    if (tab === 'lotto') fetchLottoData()
    else fetchPensionData()
  }

  useEffect(() => {
    if ((tab === 'lotto' && !lottoData) || (tab === 'pension' && !pensionData)) {
      fetchData()
    }
  }, [tab])

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 pb-28 lg:pb-8">
      {/* 구조화 데이터 - HowTo */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": "Lotto45로 로또 번호 AI 분석받는 방법",
          "description": "Lotto45에서 AI 통계 분석을 활용하여 로또 6/45 번호를 추천받고, 스마트 랜덤 번호를 생성하는 방법을 단계별로 안내합니다.",
          "totalTime": "PT2M",
          "tool": [
            { "@type": "HowToTool", "name": "웹 브라우저 (PC 또는 모바일)" }
          ],
          "step": [
            {
              "@type": "HowToStep",
              "position": 1,
              "name": "Lotto45 접속 및 분석 시작",
              "text": "lotto45.kr에 접속하면 자동으로 최신 200회차 로또 데이터를 수집하고 CDM, Markov Chain, Monte Carlo 3가지 AI 모델로 분석을 시작합니다.",
              "url": "https://lotto45.kr"
            },
            {
              "@type": "HowToStep",
              "position": 2,
              "name": "AI 추천 번호 확인",
              "text": "분석이 완료되면 AI 추천 TOP 15 번호, 앙상블 분석 5세트, CDM 추천 15세트, 백테스트 검증 10세트 등 다양한 추천 결과를 확인합니다."
            },
            {
              "@type": "HowToStep",
              "position": 3,
              "name": "스마트 랜덤 번호 생성",
              "text": "스마트 랜덤 번호 섹션에서 '번호 뽑기' 버튼을 눌러 홀짝 비율, 고저 균형, 합계 범위, 번호대 분포가 균형 잡힌 5세트의 번호를 즉시 생성합니다."
            },
            {
              "@type": "HowToStep",
              "position": 4,
              "name": "번호 복사 및 활용",
              "text": "생성된 번호 옆의 복사 버튼을 눌러 클립보드에 복사한 후, 동행복권 사이트에서 수동 번호 입력 시 활용하거나 메모로 저장합니다."
            }
          ]
        })}}
      />

      {/* 구조화 데이터 - FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "AI 분석으로 로또 당첨 확률이 올라가나요?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "로또 6/45는 매 회차 독립적인 무작위 추첨입니다. 과거 데이터 분석은 통계적 경향을 파악하는 데 도움이 되지만, 특정 번호가 나올 확률을 변화시키지는 않습니다. Lotto45는 통계 기반 참고 도구로 활용하시기 바랍니다."
              }
            },
            {
              "@type": "Question",
              "name": "Lotto45의 분석에 사용되는 데이터는 어디서 가져오나요?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "동행복권 공식 사이트의 역대 당첨번호 데이터를 사용합니다. 매주 추첨 후 자동으로 최신 데이터가 업데이트되며, 최근 200회차를 기준으로 분석합니다."
              }
            },
            {
              "@type": "Question",
              "name": "연금복권 720+도 분석할 수 있나요?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "네, 상단 탭에서 연금복권 720+를 선택하면 연금복권 전용 분석 결과를 확인할 수 있습니다. 조별 분석, 자릿수별 출현 빈도 등 연금복권에 특화된 분석을 제공합니다."
              }
            },
            {
              "@type": "Question",
              "name": "Lotto45는 무료인가요?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Lotto45의 모든 기능은 완전 무료입니다. 회원가입 없이 바로 이용할 수 있으며, 번호 추천, 통계 분석, 세금 계산기, 확률 계산기, 번호 검증기 등 모든 도구를 제한 없이 사용할 수 있습니다."
              }
            },
            {
              "@type": "Question",
              "name": "로또 6/45의 1등 당첨 확률은 얼마인가요?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "로또 6/45의 1등 당첨 확률은 8,145,060분의 1(약 0.0000123%)입니다. 이는 45개 번호 중 6개를 맞추는 조합(C(45,6))으로 계산됩니다. 2등은 보너스 번호를 포함해 1,357,510분의 1, 3등은 35,724분의 1입니다."
              }
            },
            {
              "@type": "Question",
              "name": "로또 당첨금에 세금이 얼마나 부과되나요?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "5만원 이하는 비과세, 5만원 초과~3억원 이하는 22%(소득세 20% + 주민세 2%), 3억원 초과분은 33%(소득세 30% + 주민세 3%)가 원천징수됩니다. 예를 들어 10억원 당첨 시 실수령액은 약 7억 1,500만원입니다."
              }
            }
          ]
        })}}
      />

      {/* 히어로 - 간결한 소개 */}
      <section className="mb-5 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          이번 주 로또 번호, AI가 분석해 드립니다
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          CDM + Markov Chain + Monte Carlo 앙상블 분석 | 역대 {lottoData ? `${lottoData.totalRounds}` : '1,200'}회차 데이터 기반
        </p>
      </section>

      {/* 탭 바 + 새로고침 */}
      <div className="flex items-center justify-between mb-6">
        <div className="inline-flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setTab('lotto')}
            className={`px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-bold transition-all ${
              tab === 'lotto'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            로또 6/45
          </button>
          <button
            onClick={() => setTab('pension')}
            className={`px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-bold transition-all ${
              tab === 'pension'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            연금복권 720+
          </button>
        </div>
        <button
          onClick={fetchData}
          disabled={loadingState.isLoading}
          className="px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs sm:text-sm font-medium text-white transition-colors disabled:opacity-50"
        >
          {loadingState.isLoading ? '분석 중...' : '새로 분석'}
        </button>
      </div>

      {/* 로딩 */}
      {loadingState.isLoading && (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-5">
            <div className="absolute inset-0 border-2 border-gray-200 rounded-full" />
            <div
              className="absolute inset-0 border-2 border-transparent border-t-indigo-500 rounded-full animate-spin"
              style={{ animationDuration: '1s' }}
            />
            <div className="absolute inset-2 border-2 border-transparent border-t-violet-400 rounded-full animate-spin"
              style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg sm:text-xl font-bold text-indigo-600">{loadingState.progress}%</span>
            </div>
          </div>

          <div className="w-full max-w-xs sm:max-w-md mb-4">
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${loadingState.progress}%` }}
              />
            </div>
          </div>

          <p className="text-base sm:text-lg font-medium text-gray-900 mb-1">{loadingState.status}</p>
          <p className="text-xs sm:text-sm text-gray-500 mb-4">
            {tab === 'lotto' ? '최근 200회차 데이터를 분석합니다' : '연금복권 데이터를 분석합니다'}
          </p>

          <div className="grid grid-cols-2 gap-3 w-full max-w-xs sm:max-w-sm mt-2">
            <div className="text-center p-2.5 sm:p-3 rounded-lg bg-white border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">경과 시간</p>
              <p className="text-base sm:text-lg font-bold text-indigo-600">
                {formatTime(loadingState.elapsedTime)}
              </p>
            </div>
            <div className={`text-center p-2.5 sm:p-3 rounded-lg ${
              isTimeCritical ? 'bg-red-50 border border-red-200' :
              isTimeWarning ? 'bg-amber-50 border border-amber-200' :
              'bg-white border border-gray-200 shadow-sm'
            }`}>
              <p className="text-xs text-gray-500 mb-1">타임아웃까지</p>
              <p className={`text-base sm:text-lg font-bold ${
                isTimeCritical ? 'text-red-600 animate-pulse' :
                isTimeWarning ? 'text-amber-600' :
                'text-emerald-600'
              }`}>
                {formatTime(remainingTime)}
              </p>
            </div>
          </div>

          {isTimeWarning && (
            <p className={`text-xs sm:text-sm mt-3 ${isTimeCritical ? 'text-red-600' : 'text-amber-600'}`}>
              {isTimeCritical
                ? '타임아웃 임박! 잠시 후 다시 시도해주세요.'
                : '서버 응답이 지연되고 있습니다...'}
            </p>
          )}
        </div>
      )}

      {/* 에러 */}
      {error && !loadingState.isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 text-center">
          <p className="text-red-600 text-sm sm:text-base">{error}</p>
          <button
            onClick={fetchData}
            className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm text-red-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 로또 탭 */}
      {!loadingState.isLoading && !error && tab === 'lotto' && lottoData && (
        <LottoTab
          data={lottoData}
          selectedRound={selectedLottoRound}
          roundInput={lottoRoundInput}
          setRoundInput={setLottoRoundInput}
          fetchData={fetchLottoData}
          isLoading={loadingState.isLoading}
          randomSets={randomSets}
          isRolling={isRolling}
          generateRandom={generateSmartRandom}
          expanded={expanded}
          toggleSection={toggleSection}
          isSectionOpen={isSectionOpen}
          sectionRefs={sectionRefs}
          countdown={countdown}
          excludeNumbers={excludeNumbers}
          setExcludeNumbers={setExcludeNumbers}
          includeNumbers={includeNumbers}
          setIncludeNumbers={setIncludeNumbers}
        />
      )}

      {/* 연금복권 탭 */}
      {!loadingState.isLoading && !error && tab === 'pension' && pensionData && (
        <PensionTab
          data={pensionData}
          selectedRound={selectedPensionRound}
          roundInput={pensionRoundInput}
          setRoundInput={setPensionRoundInput}
          fetchData={fetchPensionData}
          isLoading={loadingState.isLoading}
          randomSets={pensionRandomSets}
          isRolling={isPensionRolling}
          generateRandom={generatePensionRandom}
        />
      )}

      {/* 한국 로또 6/45 기본 안내 */}
      <section className="mt-8 sm:mt-10">
        <div className="p-5 sm:p-7 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-4">
            한국 로또 6/45 기본 안내
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-2">추첨 방식</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                로또 6/45는 1부터 45까지의 숫자 중 6개의 당첨번호와 1개의 보너스 번호를 추첨하는 복권입니다.
                매주 토요일 오후 8시 35분에 MBC에서 생방송으로 추첨이 진행되며,
                동행복권에서 운영합니다. 1게임당 1,000원이며 한 장에 최대 5게임까지 구매할 수 있습니다.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-2">당첨 등수</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                1등은 6개 번호 모두 일치(확률 1/8,145,060), 2등은 5개 + 보너스 번호 일치(1/1,357,510),
                3등은 5개 일치(1/35,724), 4등은 4개 일치(1/733, 고정 5만원),
                5등은 3개 일치(1/45, 고정 5천원)입니다.
                1~3등 당첨금은 총 판매액의 비율로 배분되므로 매 회차 달라집니다.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-2">구매 방법</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                전국 로또 판매점에서 직접 구매하거나, 동행복권 공식 사이트(dhlottery.co.kr)에서
                온라인 구매가 가능합니다. 온라인 구매는 만 19세 이상, 본인 인증 후 이용할 수 있으며
                매주 토요일 오후 8시에 판매가 마감됩니다. 자동, 수동, 반자동 선택이 가능합니다.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-2">당첨금 수령</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                5등(5천원)은 모든 판매점에서 즉시 수령, 4등(5만원)은 판매점 또는 농협 지점에서 수령 가능합니다.
                3등 이상은 농협은행 본점에서 신분증 지참 후 수령하며, 1등은 법률 자문을 받은 후 수령하는 것이 좋습니다.
                당첨금 지급 기한은 추첨일로부터 1년입니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI 분석 방법 소개 */}
      <section className="mt-6 sm:mt-8">
        <div className="p-5 sm:p-7 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-4">
            Lotto45의 AI 분석은 어떻게 작동하나요?
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-5">
            Lotto45는 역대 로또 당첨 데이터를 기반으로 3가지 독립적인 통계 모델을 실행하고,
            그 결과를 종합하는 <strong>앙상블(Ensemble) 분석</strong> 방식을 사용합니다.
            단일 모델의 편향을 줄이고, 다각도에서 번호를 평가하여 보다 균형 잡힌 추천 번호를 제공합니다.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white text-xs font-bold">1</span>
                <h3 className="text-sm font-bold text-indigo-900">CDM 확률 모델</h3>
              </div>
              <p className="text-xs sm:text-sm text-indigo-700 leading-relaxed">
                조건부 확률 분포(Conditional Distribution Model)를 활용하여 각 번호의 출현 빈도, 최근 등장 주기, 연번 패턴을 종합 분석합니다.
                최근 20회차에 가중치를 두어 트렌드를 반영합니다.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-violet-50 border border-violet-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-violet-600 text-white text-xs font-bold">2</span>
                <h3 className="text-sm font-bold text-violet-900">Markov Chain</h3>
              </div>
              <p className="text-xs sm:text-sm text-violet-700 leading-relaxed">
                마르코프 체인은 이전 회차 당첨번호를 &quot;상태&quot;로 보고, 다음 상태로 전이될 확률을 계산합니다.
                번호 간 동반 출현 관계와 연속적인 패턴 변화를 포착하는 데 효과적입니다.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-600 text-white text-xs font-bold">3</span>
                <h3 className="text-sm font-bold text-emerald-900">Monte Carlo</h3>
              </div>
              <p className="text-xs sm:text-sm text-emerald-700 leading-relaxed">
                몬테카를로 시뮬레이션은 수천 회의 가상 추첨을 실행하여 통계적으로 유의미한 번호 조합을 도출합니다.
                각 번호의 기대 빈도와 실제 빈도 차이를 기반으로 유망 번호를 선별합니다.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-800 mb-2">앙상블 분석이란?</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              3개 모델의 결과를 가중 평균으로 결합합니다. 각 모델이 독립적으로 높은 점수를 부여한 번호일수록
              최종 추천 순위가 올라갑니다. 이 방식은 머신러닝에서 널리 사용되는 기법으로,
              단일 모델 대비 예측 안정성이 높은 것이 특징입니다.
              다만 로또는 완전 무작위 추첨이므로 과거 데이터 기반 분석이 미래 결과를 보장하지는 않습니다.
            </p>
          </div>
        </div>
      </section>

      {/* 당첨번호 선택 전략 */}
      <section className="mt-6 sm:mt-8">
        <div className="p-5 sm:p-7 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-4">
            통계로 보는 당첨번호 선택 전략
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-5">
            로또는 완전한 무작위 추첨이지만, 역대 1,200회 이상의 당첨 데이터를 분석하면 흥미로운 통계적 패턴을 발견할 수 있습니다.
            이러한 패턴은 미래를 예측하지는 못하지만, 번호 조합의 &quot;균형&quot;을 잡는 데 참고할 수 있습니다.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-2">홀짝 비율</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                역대 당첨번호의 홀짝 비율을 분석하면, 가장 흔한 조합은 홀수 3개 + 짝수 3개(약 33%)입니다.
                극단적인 조합(6:0 또는 0:6)은 전체의 1% 미만으로 매우 드뭅니다.
                2:4 또는 4:2 조합도 각각 약 25%로 자주 등장합니다.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-2">합계 범위</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                6개 당첨번호의 합계는 이론적으로 21(1+2+3+4+5+6)부터 255(40+41+42+43+44+45)까지 가능합니다.
                하지만 실제 당첨번호의 합계는 100~175 구간에 약 70%가 집중되어 있으며,
                평균값은 약 138입니다. 이 범위를 벗어나는 조합은 상대적으로 드뭅니다.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-2">연속 번호(연번)</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                당첨번호에 연속된 숫자(예: 7-8, 23-24)가 1쌍 이상 포함된 경우는 전체의 약 60%입니다.
                즉, 연번이 포함되는 것이 오히려 &quot;정상&quot;입니다. 다만 3개 이상 연속(예: 5-6-7)은 약 5%로 드뭅니다.
                연번을 완전히 배제하면 오히려 당첨 패턴에서 벗어나게 됩니다.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-2">번호대 분포</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                45개 번호를 5개 구간(1~9, 10~19, 20~29, 30~39, 40~45)으로 나누면,
                당첨번호는 보통 3~4개 구간에 걸쳐 분포합니다. 하나의 구간에서 3개 이상 나오는 경우는 약 15%,
                5개 구간 모두에서 나오는 경우는 약 8%입니다.
                한 구간에 편중된 번호 선택은 통계적으로 불리합니다.
              </p>
            </div>
          </div>
          <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
              <strong>주의:</strong> 위 통계는 과거 데이터의 관찰 결과이며, 미래 추첨 결과를 예측하거나 보장하지 않습니다.
              로또의 각 추첨은 독립 사건이므로 과거 패턴이 반복될 이유가 없습니다.
              통계 데이터는 &quot;어떤 조합이 균형 잡혀 있는지&quot; 판단하는 참고 자료로만 활용하세요.
            </p>
          </div>
        </div>
      </section>

      {/* 이용 가이드 */}
      <section className="mt-6 sm:mt-8">
        <div className="p-5 sm:p-7 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-4">
            Lotto45 이용 가이드
          </h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">1</span>
              <div>
                <h3 className="text-sm font-bold text-gray-800">분석 시작하기</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  페이지 상단의 &quot;새로 분석&quot; 버튼을 누르면 최신 200회차 데이터를 수집하고 3개 AI 모델로 분석을 시작합니다.
                  로또 6/45와 연금복권 720+ 탭을 전환하며 각각의 분석 결과를 확인할 수 있습니다.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">2</span>
              <div>
                <h3 className="text-sm font-bold text-gray-800">분석 결과 확인</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  분석이 완료되면 최근 당첨번호, 번호별 출현 빈도 상위 15개, 모델별 추천 번호, 앙상블 종합 추천 등을 확인할 수 있습니다.
                  각 섹션을 펼치거나 접어서 원하는 정보만 볼 수 있습니다.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">3</span>
              <div>
                <h3 className="text-sm font-bold text-gray-800">스마트 랜덤 번호 생성</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  완전 랜덤이 아닌, 통계적으로 유의미한 조건(홀짝 비율, 고저 균형, 합계 범위, 번호대 분포)을
                  충족하는 번호만 생성합니다. 역대 당첨번호의 패턴을 분석한 결과를 반영한 스마트 랜덤 기능입니다.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">4</span>
              <div>
                <h3 className="text-sm font-bold text-gray-800">과거 회차 분석</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  특정 회차를 입력하면 해당 시점의 데이터로 분석을 재실행합니다.
                  과거 분석 결과와 실제 당첨번호를 비교해 모델의 정확도를 직접 확인해 볼 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 자주 묻는 질문 */}
      <section className="mt-6 sm:mt-8">
        <div className="p-5 sm:p-7 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-4">자주 묻는 질문</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Q. AI 분석으로 정말 당첨 확률이 올라가나요?</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                로또 6/45는 매 회차 독립적인 무작위 추첨입니다. 과거 데이터 분석은 통계적 경향을 파악하는 데 도움이 되지만,
                특정 번호가 나올 확률을 변화시키지는 않습니다. Lotto45는 통계 기반 참고 도구로 활용하시기 바랍니다.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">Q. 분석에 사용되는 데이터는 어디서 가져오나요?</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                동행복권 공식 사이트의 역대 당첨번호 데이터를 사용합니다. 매주 추첨 후 자동으로 최신 데이터가 업데이트되며,
                최근 200회차를 기준으로 분석합니다.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">Q. 연금복권 720+도 분석할 수 있나요?</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                네, 상단 탭에서 &quot;연금복권 720+&quot;를 선택하면 연금복권 전용 분석 결과를 확인할 수 있습니다.
                조별 분석, 자릿수별 출현 빈도 등 연금복권에 특화된 분석을 제공합니다.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">Q. 무료인가요?</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                Lotto45의 모든 기능은 완전 무료입니다. 회원가입 없이 바로 이용할 수 있으며,
                번호 추천, 통계 분석, 세금 계산기, 확률 계산기, 번호 검증기 등 모든 도구를 제한 없이 사용할 수 있습니다.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">Q. 로또 1등에 당첨되면 세금은 얼마인가요?</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                5만원 이하는 비과세, 5만원 초과~3억원 이하는 22%(소득세 20% + 주민세 2%),
                3억원 초과분은 33%(소득세 30% + 주민세 3%)가 원천징수됩니다.
                예를 들어 10억원에 당첨되면 실수령액은 약 7억 1,500만원입니다.
                자세한 계산은 <a href="/tax-calculator" className="text-indigo-600 underline">세금 계산기</a>를 이용해보세요.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">Q. 로또 당첨금 수령 기한이 있나요?</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                추첨일로부터 1년 이내에 수령해야 합니다. 기한이 지나면 당첨금은 복권기금으로 귀속됩니다.
                고액 당첨 시에는 서두르지 말고 법률 및 세무 전문가 상담을 받은 후 수령하는 것을 권장합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 블로그 미리보기 */}
      <div className="mt-6 sm:mt-8">
        <div className="p-4 sm:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">로또 정보 블로그</h2>
            <a href="/blog" className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors font-medium">
              전체보기 &rarr;
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a href="/blog/lotto-winner-guide" className="group p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 transition-all">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-indigo-100 text-indigo-700 border-indigo-200">당첨 가이드</span>
              <h3 className="text-sm font-bold text-gray-900 mt-2 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">로또 1등 당첨 후 꼭 해야 할 7가지</h3>
              <p className="text-xs text-gray-400">7분 읽기</p>
            </a>
            <a href="/blog/lotto-probability" className="group p-3 rounded-xl bg-gray-50 hover:bg-violet-50 border border-gray-200 hover:border-violet-200 transition-all">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-violet-100 text-violet-700 border-violet-200">확률 분석</span>
              <h3 className="text-sm font-bold text-gray-900 mt-2 mb-1 group-hover:text-violet-600 transition-colors line-clamp-2">로또 확률 완전 정복: 1등부터 5등까지</h3>
              <p className="text-xs text-gray-400">9분 읽기</p>
            </a>
            <a href="/blog/lotto-tax-guide" className="group p-3 rounded-xl bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-all">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-red-100 text-red-700 border-red-200">세금 가이드</span>
              <h3 className="text-sm font-bold text-gray-900 mt-2 mb-1 group-hover:text-red-600 transition-colors line-clamp-2">로또 당첨금 세금 계산법 (2025년 기준)</h3>
              <p className="text-xs text-gray-400">7분 읽기</p>
            </a>
          </div>
        </div>
      </div>

      {/* 책임감 있는 게임 안내 */}
      <div className="mt-6 sm:mt-8">
        <div className="p-3 sm:p-4 rounded-xl bg-red-50 border border-red-200 text-center">
          <p className="text-xs sm:text-sm font-bold text-red-600 mb-1">책임감 있는 게임</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            로또는 무작위 추첨이며 과거 데이터는 미래를 보장하지 않습니다.
            통계 분석 도구이며 당첨을 보장하지 않습니다. 18세 미만 이용 불가.
          </p>
          <p className="text-xs text-amber-600 mt-1.5">
            도박 중독 상담: 1336 | 정신건강 위기: 1577-0199
          </p>
        </div>
      </div>
    </div>
  )
}