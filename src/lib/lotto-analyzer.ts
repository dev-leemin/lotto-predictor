import { LottoResult, NumberStats, Prediction, AnalysisResult } from '@/types/lottery'

// 번호별 기본 통계 계산
export function calculateNumberStats(results: LottoResult[]): NumberStats[] {
  const stats: NumberStats[] = []
  const latestRound = results[results.length - 1]?.round || 0

  for (let num = 1; num <= 45; num++) {
    const appearances: number[] = []

    results.forEach(result => {
      if (result.numbers.includes(num) || result.bonus === num) {
        appearances.push(result.round)
      }
    })

    const frequency = appearances.length
    const lastAppeared = appearances.length > 0 ? appearances[appearances.length - 1] : 0
    const consecutiveMiss = latestRound - lastAppeared

    // 평균 출현 간격 계산
    let avgGap = 0
    if (appearances.length > 1) {
      const gaps = []
      for (let i = 1; i < appearances.length; i++) {
        gaps.push(appearances[i] - appearances[i - 1])
      }
      avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length
    }

    // 핫 점수: 최근 20회차 내 출현 횟수 (가중치 적용)
    const recent20 = results.slice(-20)
    let hotScore = 0
    recent20.forEach((result, idx) => {
      if (result.numbers.includes(num)) {
        hotScore += (idx + 1) / 20 // 최신일수록 높은 가중치
      }
    })

    // 콜드 점수: 미출현 기간 기반
    const coldScore = consecutiveMiss / (avgGap || 10) // 평균 간격 대비 미출현 비율

    stats.push({
      number: num,
      frequency,
      lastAppeared,
      consecutiveMiss,
      avgGap: Math.round(avgGap * 10) / 10,
      hotScore: Math.round(hotScore * 100) / 100,
      coldScore: Math.round(coldScore * 100) / 100,
    })
  }

  return stats
}

// 번호 조합 패턴 분석
function analyzePatterns(results: LottoResult[]): {
  sumRange: { min: number; max: number; avg: number }
  oddEvenRatio: { mostCommon: string; distribution: Record<string, number> }
  highLowRatio: { mostCommon: string; distribution: Record<string, number> }
  consecutivePairs: number // 연속 번호 쌍이 있는 회차 비율
} {
  const sums: number[] = []
  const oddEvenDist: Record<string, number> = {}
  const highLowDist: Record<string, number> = {}
  let consecutiveCount = 0

  results.forEach(result => {
    // 합계
    const sum = result.numbers.reduce((a, b) => a + b, 0)
    sums.push(sum)

    // 홀짝 비율
    const oddCount = result.numbers.filter(n => n % 2 === 1).length
    const oddEvenKey = `${oddCount}:${6 - oddCount}`
    oddEvenDist[oddEvenKey] = (oddEvenDist[oddEvenKey] || 0) + 1

    // 고저 비율 (1-22: 저, 23-45: 고)
    const lowCount = result.numbers.filter(n => n <= 22).length
    const highLowKey = `${lowCount}:${6 - lowCount}`
    highLowDist[highLowKey] = (highLowDist[highLowKey] || 0) + 1

    // 연속 번호
    const sorted = [...result.numbers].sort((a, b) => a - b)
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i + 1] - sorted[i] === 1) {
        consecutiveCount++
        break
      }
    }
  })

  const avgSum = sums.reduce((a, b) => a + b, 0) / sums.length

  return {
    sumRange: {
      min: Math.min(...sums),
      max: Math.max(...sums),
      avg: Math.round(avgSum),
    },
    oddEvenRatio: {
      mostCommon: Object.entries(oddEvenDist).sort((a, b) => b[1] - a[1])[0]?.[0] || '3:3',
      distribution: oddEvenDist,
    },
    highLowRatio: {
      mostCommon: Object.entries(highLowDist).sort((a, b) => b[1] - a[1])[0]?.[0] || '3:3',
      distribution: highLowDist,
    },
    consecutivePairs: Math.round((consecutiveCount / results.length) * 100),
  }
}

// 통계 기반 예측
function statisticalPrediction(stats: NumberStats[], patterns: ReturnType<typeof analyzePatterns>): Prediction {
  const candidates: { number: number; score: number; reasons: string[] }[] = []

  stats.forEach(stat => {
    let score = 0
    const reasons: string[] = []

    // 1. 핫 번호 가중치
    if (stat.hotScore > 0.5) {
      score += stat.hotScore * 30
      reasons.push('최근 자주 출현')
    }

    // 2. 출현 예정 번호 (평균 간격보다 오래 미출현)
    if (stat.coldScore > 1.2 && stat.coldScore < 3) {
      score += stat.coldScore * 20
      reasons.push('출현 예정 (평균 간격 초과)')
    }

    // 3. 전체 출현 빈도
    const avgFreq = stats.reduce((a, b) => a + b.frequency, 0) / 45
    if (stat.frequency > avgFreq) {
      score += 10
      reasons.push('평균 이상 출현 빈도')
    }

    candidates.push({ number: stat.number, score, reasons })
  })

  // 점수 기준 정렬
  candidates.sort((a, b) => b.score - a.score)

  // 상위 후보에서 패턴에 맞게 선택
  const selected: number[] = []
  const selectedReasons: string[] = []

  // 홀짝 비율 맞추기 (3:3 목표)
  let oddCount = 0
  let lowCount = 0

  for (const candidate of candidates) {
    if (selected.length >= 6) break

    const isOdd = candidate.number % 2 === 1
    const isLow = candidate.number <= 22

    // 홀짝/고저 균형 체크
    if (isOdd && oddCount >= 4) continue
    if (!isOdd && (6 - selected.length) <= (3 - oddCount)) continue
    if (isLow && lowCount >= 4) continue
    if (!isLow && (6 - selected.length) <= (3 - lowCount)) continue

    selected.push(candidate.number)
    selectedReasons.push(...candidate.reasons.slice(0, 1))

    if (isOdd) oddCount++
    if (isLow) lowCount++
  }

  // 합계 검증
  const sum = selected.reduce((a, b) => a + b, 0)
  const inRange = sum >= patterns.sumRange.avg - 30 && sum <= patterns.sumRange.avg + 30

  return {
    numbers: selected.sort((a, b) => a - b),
    confidence: inRange ? 75 : 60,
    method: 'statistical',
    reasons: [...new Set(selectedReasons)].slice(0, 4),
  }
}

// 머신러닝 스타일 예측 (선형 회귀 기반 트렌드)
function mlPrediction(results: LottoResult[], stats: NumberStats[]): Prediction {
  // 각 번호의 출현 트렌드 분석 (최근 50회차 가중 분석)
  const recent50 = results.slice(-50)
  const trendScores: { number: number; trend: number; reasons: string[] }[] = []

  for (let num = 1; num <= 45; num++) {
    let weightedSum = 0
    let totalWeight = 0

    recent50.forEach((result, idx) => {
      const weight = (idx + 1) / 50 // 최신일수록 높은 가중치
      if (result.numbers.includes(num)) {
        weightedSum += weight
      }
      totalWeight += weight
    })

    const trend = (weightedSum / totalWeight) * 100
    const stat = stats.find(s => s.number === num)!
    const reasons: string[] = []

    // 상승 트렌드
    if (trend > 15) {
      reasons.push('상승 트렌드')
    }

    // 주기성 분석 (대략적인 패턴)
    if (stat.avgGap > 0 && stat.consecutiveMiss >= stat.avgGap * 0.8) {
      reasons.push('주기적 출현 예상')
    }

    trendScores.push({
      number: num,
      trend,
      reasons,
    })
  }

  // 트렌드 + 주기성 점수로 정렬
  trendScores.sort((a, b) => {
    const scoreA = a.trend + (a.reasons.length * 10)
    const scoreB = b.trend + (b.reasons.length * 10)
    return scoreB - scoreA
  })

  // 상위 8개 중 6개 선택 (홀짝 균형)
  const selected: number[] = []
  const selectedReasons: string[] = []
  let oddCount = 0

  for (const candidate of trendScores.slice(0, 15)) {
    if (selected.length >= 6) break

    const isOdd = candidate.number % 2 === 1
    if (isOdd && oddCount >= 4) continue
    if (!isOdd && (6 - selected.length) <= (3 - oddCount)) continue

    selected.push(candidate.number)
    selectedReasons.push(...candidate.reasons)
    if (isOdd) oddCount++
  }

  return {
    numbers: selected.sort((a, b) => a - b),
    confidence: 65,
    method: 'ml',
    reasons: [...new Set(selectedReasons)].slice(0, 4),
  }
}

// 하이브리드 예측 (통계 + ML 결합)
function hybridPrediction(
  statPred: Prediction,
  mlPred: Prediction,
  stats: NumberStats[]
): Prediction {
  // 두 예측에서 공통으로 선택된 번호 우선
  const common = statPred.numbers.filter(n => mlPred.numbers.includes(n))
  const statOnly = statPred.numbers.filter(n => !mlPred.numbers.includes(n))
  const mlOnly = mlPred.numbers.filter(n => !statPred.numbers.includes(n))

  const selected = [...common]
  const allCandidates = [...statOnly, ...mlOnly]

  // 나머지는 점수 기반으로 채움
  const ranked = allCandidates.map(num => {
    const stat = stats.find(s => s.number === num)!
    return {
      number: num,
      score: stat.hotScore * 50 + stat.coldScore * 30,
    }
  }).sort((a, b) => b.score - a.score)

  let oddCount = selected.filter(n => n % 2 === 1).length

  for (const candidate of ranked) {
    if (selected.length >= 6) break

    const isOdd = candidate.number % 2 === 1
    if (isOdd && oddCount >= 4) continue
    if (!isOdd && (6 - selected.length) <= (3 - oddCount)) continue

    selected.push(candidate.number)
    if (isOdd) oddCount++
  }

  return {
    numbers: selected.sort((a, b) => a - b),
    confidence: 70 + common.length * 5, // 공통 번호가 많을수록 신뢰도 상승
    method: 'hybrid',
    reasons: [
      `통계/ML 공통 선택: ${common.length}개`,
      ...statPred.reasons.slice(0, 2),
      ...mlPred.reasons.slice(0, 1),
    ],
  }
}

// 전체 분석 실행
export function analyzeLotto(results: LottoResult[]): AnalysisResult {
  const stats = calculateNumberStats(results)
  const patterns = analyzePatterns(results)

  // 핫/콜드/출현예정 번호
  const hotNumbers = stats
    .filter(s => s.hotScore > 0.4)
    .sort((a, b) => b.hotScore - a.hotScore)
    .slice(0, 10)
    .map(s => s.number)

  const coldNumbers = stats
    .filter(s => s.consecutiveMiss > 10)
    .sort((a, b) => b.consecutiveMiss - a.consecutiveMiss)
    .slice(0, 10)
    .map(s => s.number)

  const overdueNumbers = stats
    .filter(s => s.coldScore > 1.3)
    .sort((a, b) => b.coldScore - a.coldScore)
    .slice(0, 10)
    .map(s => s.number)

  // 예측 생성
  const statPred = statisticalPrediction(stats, patterns)
  const mlPred = mlPrediction(results, stats)
  const hybridPred = hybridPrediction(statPred, mlPred, stats)

  return {
    stats,
    hotNumbers,
    coldNumbers,
    overdueNumbers,
    predictions: [hybridPred, statPred, mlPred],
    lastUpdate: new Date().toISOString(),
  }
}

// 요일 변환
function getDayOfWeek(dateString: string): string {
  const days = ['일', '월', '화', '수', '목', '금', '토']
  const date = new Date(dateString)
  return days[date.getDay()]
}

// 고급 확률/통계 기반 점수 계산 (베이지안 + 포아송 분포 근사)
function calculateAdvancedScore(
  num: number,
  results: LottoResult[],
  stats: NumberStats
): { score: number; details: string[] } {
  const details: string[] = []
  let score = 0

  const totalRounds = results.length
  const expectedFreq = totalRounds * 6 / 45 // 기대 출현 빈도

  // 1. 포아송 분포 기반 출현 확률 (λ = 기대값)
  // P(X=k) = (λ^k * e^-λ) / k!
  const lambda = expectedFreq
  const actualFreq = stats.frequency
  const poissionDeviation = (actualFreq - lambda) / Math.sqrt(lambda)

  if (poissionDeviation > 1.5) {
    score += 15
    details.push(`평균 이상 출현 (+${poissionDeviation.toFixed(1)}σ)`)
  } else if (poissionDeviation < -1.5) {
    score += 20 // 오래 안 나온 번호에 더 높은 가중치
    details.push(`출현 예정 (${Math.abs(poissionDeviation).toFixed(1)}σ 미만)`)
  }

  // 2. 베이지안 사후 확률 (최근 n회차 기반)
  const recentWindows = [10, 20, 50, 100]
  let recentScore = 0

  recentWindows.forEach(window => {
    const recentResults = results.slice(-window)
    let count = 0
    recentResults.forEach((r, idx) => {
      if (r.numbers.includes(num)) {
        // 시간 가중치 (최신일수록 높음)
        const weight = 1 + (idx / window) * 0.5
        count += weight
      }
    })
    const recentRate = count / window
    const expectedRate = 6 / 45

    if (recentRate > expectedRate * 1.3) {
      recentScore += 5 * (window / 100) // 긴 기간일수록 신뢰도 높음
    }
  })

  if (recentScore > 10) {
    score += recentScore
    details.push('최근 상승 추세')
  }

  // 3. 회귀 분석 기반 트렌드 (선형 회귀 기울기)
  const windowSize = Math.min(100, results.length)
  const recentForTrend = results.slice(-windowSize)
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0

  recentForTrend.forEach((r, idx) => {
    const x = idx
    const y = r.numbers.includes(num) ? 1 : 0
    sumX += x
    sumY += y
    sumXY += x * y
    sumX2 += x * x
  })

  const n = windowSize
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)

  if (slope > 0.005) {
    score += 15
    details.push('강한 상승 트렌드')
  } else if (slope > 0.002) {
    score += 8
    details.push('약한 상승 트렌드')
  }

  // 4. 주기성 분석 (자기상관)
  if (stats.avgGap > 0) {
    const cycleRatio = stats.consecutiveMiss / stats.avgGap
    if (cycleRatio >= 0.9 && cycleRatio <= 1.5) {
      score += 20
      details.push(`주기 도래 (${cycleRatio.toFixed(1)}배)`)
    } else if (cycleRatio > 1.5 && cycleRatio <= 2.5) {
      score += 25
      details.push(`출현 임박 (${cycleRatio.toFixed(1)}배 초과)`)
    }
  }

  // 5. 연관 분석 (같이 나오는 번호 패턴)
  const coOccurrence: Record<number, number> = {}
  results.forEach(r => {
    if (r.numbers.includes(num)) {
      r.numbers.forEach(n => {
        if (n !== num) {
          coOccurrence[n] = (coOccurrence[n] || 0) + 1
        }
      })
    }
  })

  // 최근 10회차에서 자주 같이 나온 번호가 출현했는지
  const recent10 = results.slice(-10)
  const topCoNumbers = Object.entries(coOccurrence)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([n]) => parseInt(n))

  let coOccurBonus = 0
  recent10.forEach(r => {
    topCoNumbers.forEach(coNum => {
      if (r.numbers.includes(coNum)) {
        coOccurBonus += 1
      }
    })
  })

  if (coOccurBonus > 3) {
    score += 10
    details.push('연관 번호 활성')
  }

  return { score: Math.round(score * 100) / 100, details }
}

// 확률/통계 기반 15개 추천 조합 세트 생성
function generateRecommendedSets(
  scoredNumbers: Array<{ number: number; score: number }>,
  patterns: ReturnType<typeof analyzePatterns>,
  stats: NumberStats[]
): Array<{ set: number; numbers: number[]; score: number; description: string }> {
  const sets: Array<{ set: number; numbers: number[]; score: number; description: string }> = []
  const avgSum = patterns.sumRange.avg
  const usedCombinations = new Set<string>()

  // 조합의 고유키 생성
  const getCombinationKey = (nums: number[]) => [...nums].sort((a, b) => a - b).join(',')

  // 조합 점수 계산 함수
  const calculateSetScore = (nums: number[]): { score: number; details: string[] } => {
    const details: string[] = []
    let score = 0

    // 1. 개별 번호 점수 합계 (가중 평균)
    const numberScores = nums.map(n => scoredNumbers.find(s => s.number === n)?.score || 0)
    const avgNumberScore = numberScores.reduce((a, b) => a + b, 0) / 6
    score += avgNumberScore * 0.4

    // 2. 합계 적합성 (평균에 가까울수록 높음)
    const sum = nums.reduce((a, b) => a + b, 0)
    const sumDiff = Math.abs(sum - avgSum)
    if (sumDiff <= 20) {
      score += 25
      details.push(`합계 ${sum} (적정)`)
    } else if (sumDiff <= 40) {
      score += 15
      details.push(`합계 ${sum}`)
    } else {
      score += 5
    }

    // 3. 홀짝 균형 (3:3 또는 4:2가 최적)
    const oddCount = nums.filter(n => n % 2 === 1).length
    if (oddCount === 3) {
      score += 20
      details.push('홀짝 3:3')
    } else if (oddCount === 2 || oddCount === 4) {
      score += 15
      details.push(`홀짝 ${oddCount}:${6 - oddCount}`)
    } else {
      score += 5
    }

    // 4. 고저 균형 (1-22 저, 23-45 고)
    const lowCount = nums.filter(n => n <= 22).length
    if (lowCount === 3) {
      score += 15
      details.push('고저 3:3')
    } else if (lowCount === 2 || lowCount === 4) {
      score += 10
    }

    // 5. 번호 대역 분포 (5개 대역에서 고르게)
    const bands = [0, 0, 0, 0, 0] // 1-9, 10-19, 20-29, 30-39, 40-45
    nums.forEach(n => {
      if (n <= 9) bands[0]++
      else if (n <= 19) bands[1]++
      else if (n <= 29) bands[2]++
      else if (n <= 39) bands[3]++
      else bands[4]++
    })
    const coveredBands = bands.filter(b => b > 0).length
    if (coveredBands >= 4) {
      score += 15
      details.push(`${coveredBands}개 대역 분포`)
    } else if (coveredBands === 3) {
      score += 10
    }

    // 6. 연번 체크 (1~2개 연번 있으면 보너스 - 실제 당첨에 많이 나옴)
    const sorted = [...nums].sort((a, b) => a - b)
    let consecutiveCount = 0
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i + 1] - sorted[i] === 1) consecutiveCount++
    }
    if (consecutiveCount === 1) {
      score += 10
      details.push('연번 1쌍')
    } else if (consecutiveCount === 2) {
      score += 5
    }

    return { score: Math.round(score * 10) / 10, details }
  }

  // 최적 조합 생성 함수 (탐욕 알고리즘 + 조건)
  const generateOptimalSet = (
    constraints: {
      mustInclude?: number[]
      mustExclude?: number[]
      targetOddCount?: number
      priorityWeight?: number
    }
  ): number[] | null => {
    const { mustInclude = [], mustExclude = [], targetOddCount, priorityWeight = 1 } = constraints
    const candidates = scoredNumbers
      .filter(s => !mustExclude.includes(s.number))
      .map(s => ({ ...s, adjustedScore: s.score * priorityWeight }))

    const selected = [...mustInclude]
    let oddCount = selected.filter(n => n % 2 === 1).length
    let lowCount = selected.filter(n => n <= 22).length

    // 나머지 번호 선택
    for (const candidate of candidates) {
      if (selected.length >= 6) break
      if (selected.includes(candidate.number)) continue

      const isOdd = candidate.number % 2 === 1
      const isLow = candidate.number <= 22

      // 홀짝 균형 체크
      if (targetOddCount !== undefined) {
        if (isOdd && oddCount >= targetOddCount) continue
        if (!isOdd && (6 - selected.length) <= (targetOddCount - oddCount)) continue
      } else {
        if (isOdd && oddCount >= 4) continue
        if (!isOdd && oddCount <= 1 && selected.length >= 4) continue
      }

      // 고저 균형
      if (isLow && lowCount >= 4) continue
      if (!isLow && lowCount <= 1 && selected.length >= 4) continue

      selected.push(candidate.number)
      if (isOdd) oddCount++
      if (isLow) lowCount++
    }

    if (selected.length < 6) return null

    const key = getCombinationKey(selected)
    if (usedCombinations.has(key)) return null

    usedCombinations.add(key)
    return selected.sort((a, b) => a - b)
  }

  // 1. 최고 확률 조합 (상위 점수 번호 위주)
  const set1 = generateOptimalSet({ priorityWeight: 1.5 })
  if (set1) {
    const { score, details } = calculateSetScore(set1)
    sets.push({ set: 1, numbers: set1, score, description: `최고확률 조합 (${details.slice(0, 2).join(', ')})` })
  }

  // 2~4. 홀짝 변형 조합
  for (let oddTarget = 2; oddTarget <= 4; oddTarget++) {
    const nums = generateOptimalSet({ targetOddCount: oddTarget })
    if (nums) {
      const { score, details } = calculateSetScore(nums)
      sets.push({ set: sets.length + 1, numbers: nums, score, description: `홀${oddTarget}짝${6 - oddTarget} 조합 (${details[1] || ''})` })
    }
  }

  // 5~7. 출현예정 번호 포함 조합 (coldScore 높은 순)
  const overdueNumbers = stats
    .filter(s => s.coldScore > 0.5)
    .sort((a, b) => b.coldScore - a.coldScore)
    .slice(0, 10)
    .map(s => s.number)

  for (let i = 0; i < 3 && i < overdueNumbers.length; i++) {
    const nums = generateOptimalSet({ mustInclude: [overdueNumbers[i]] })
    if (nums) {
      const { score, details } = calculateSetScore(nums)
      sets.push({ set: sets.length + 1, numbers: nums, score, description: `출현예정 ${overdueNumbers[i]}번 포함` })
    }
  }

  // 8~10. 핫 번호 조합 (최근 자주 나온 번호)
  const hotNumbers = stats
    .filter(s => s.hotScore > 0.3)
    .sort((a, b) => b.hotScore - a.hotScore)
    .slice(0, 8)
    .map(s => s.number)

  for (let i = 0; i < 3 && hotNumbers.length >= 2; i++) {
    const mustInclude = hotNumbers.slice(i * 2, i * 2 + 2)
    if (mustInclude.length < 2) break
    const nums = generateOptimalSet({ mustInclude })
    if (nums) {
      const { score, details } = calculateSetScore(nums)
      sets.push({ set: sets.length + 1, numbers: nums, score, description: `핫넘버 ${mustInclude.join(',')} 포함` })
    }
  }

  // 11~15. 다양한 균형 조합 (15개 채우기)
  const alreadyUsedNumbers = new Set<number>()
  sets.forEach(s => s.numbers.forEach(n => alreadyUsedNumbers.add(n)))

  let balanceIndex = 0
  while (sets.length < 15 && balanceIndex < 20) {
    balanceIndex++

    // 다양성을 위해 사용된 번호와 미사용 번호의 가중치 조절
    const weightFactor = balanceIndex * 0.1
    const lessUsedWeight = scoredNumbers.map(s => ({
      ...s,
      score: alreadyUsedNumbers.has(s.number)
        ? s.score * Math.max(0.3, 0.8 - weightFactor)
        : s.score * (1.2 + weightFactor * 0.5),
    }))
    lessUsedWeight.sort((a, b) => b.score - a.score)

    const selected: number[] = []
    let oddCount = 0
    let lowCount = 0

    // 홀짝 목표 변경해가며 다양한 조합 생성
    const targetOdd = 2 + (balanceIndex % 3) // 2, 3, 4 순환
    const skipCount = balanceIndex > 5 ? (balanceIndex - 5) : 0 // 상위 번호 일부 건너뛰기

    let skipped = 0
    for (const candidate of lessUsedWeight) {
      if (selected.length >= 6) break

      // 처음 몇 개 건너뛰어서 다양성 확보
      if (skipped < skipCount && !selected.includes(candidate.number)) {
        skipped++
        continue
      }

      const isOdd = candidate.number % 2 === 1
      const isLow = candidate.number <= 22

      // 홀짝 균형
      if (isOdd && oddCount >= targetOdd + 1) continue
      if (!isOdd && (6 - selected.length) <= (targetOdd - oddCount) && oddCount < targetOdd) continue

      // 고저 균형 (더 유연하게)
      if (isLow && lowCount >= 5) continue
      if (!isLow && lowCount === 0 && selected.length >= 5) continue

      selected.push(candidate.number)
      if (isOdd) oddCount++
      if (isLow) lowCount++
    }

    if (selected.length === 6) {
      const key = getCombinationKey(selected)
      if (!usedCombinations.has(key)) {
        usedCombinations.add(key)
        const nums = selected.sort((a, b) => a - b)
        const { score, details } = calculateSetScore(nums)
        sets.push({ set: sets.length + 1, numbers: nums, score, description: `균형 조합 #${sets.length - 9} (${details.slice(0, 2).join(', ')})` })
        nums.forEach(n => alreadyUsedNumbers.add(n))
      }
    }
  }

  // 점수 순 정렬 후 순위 재부여
  sets.sort((a, b) => b.score - a.score)
  return sets.slice(0, 15).map((s, idx) => ({ ...s, set: idx + 1 }))
}

// 전체 회차 분석 (15개 순위 + 15개 세트)
export function analyzeLottoFull(results: LottoResult[]): {
  rankedNumbers: Array<{
    rank: number
    number: number
    score: number
    reasons: string[]
    frequency: number
    lastAppeared: number
    consecutiveMiss: number
  }>
  recommendedSets: Array<{
    set: number
    numbers: number[]
    score: number
    description: string
  }>
  recentResults: Array<{
    round: number
    date: string
    dayOfWeek: string
    numbers: number[]
    bonus: number
  }>
  latestRound: number
  latestDate: string
  latestDayOfWeek: string
  totalRounds: number
  stats: NumberStats[]
  patterns: {
    sumRange: { min: number; max: number; avg: number }
    oddEvenMostCommon: string
    highLowMostCommon: string
    consecutivePairsPercent: number
  }
  lastUpdate: string
} {
  if (results.length === 0) {
    throw new Error('분석할 데이터가 없습니다.')
  }

  const stats = calculateNumberStats(results)
  const patterns = analyzePatterns(results)

  // 모든 번호에 대해 고급 점수 계산
  const scoredNumbers = stats.map(stat => {
    const { score, details } = calculateAdvancedScore(stat.number, results, stat)

    // 기본 통계 점수 추가
    let totalScore = score

    // 핫 점수 반영 (20%)
    totalScore += stat.hotScore * 20

    // 콜드 점수 반영 (평균 이상 미출현 시 보너스)
    if (stat.coldScore > 1.2) {
      totalScore += stat.coldScore * 15
    }

    return {
      number: stat.number,
      score: Math.round(totalScore * 100) / 100,
      reasons: details,
      frequency: stat.frequency,
      lastAppeared: stat.lastAppeared,
      consecutiveMiss: stat.consecutiveMiss,
    }
  })

  // 점수 순 정렬
  scoredNumbers.sort((a, b) => b.score - a.score)

  // 상위 15개 선택 (홀짝/고저 균형 고려한 필터링은 하지 않고 순수 점수 순위)
  const rankedNumbers = scoredNumbers.slice(0, 15).map((item, idx) => ({
    rank: idx + 1,
    ...item,
  }))

  // 15개 추천 세트 생성
  const recommendedSets = generateRecommendedSets(scoredNumbers, patterns, stats)

  // 최근 10회차 당첨 번호
  const recentResults = results.slice(-10).reverse().map(r => ({
    round: r.round,
    date: r.date,
    dayOfWeek: getDayOfWeek(r.date),
    numbers: r.numbers,
    bonus: r.bonus,
  }))

  const latestResult = results[results.length - 1]

  return {
    rankedNumbers,
    recommendedSets,
    recentResults,
    latestRound: latestResult.round,
    latestDate: latestResult.date,
    latestDayOfWeek: getDayOfWeek(latestResult.date),
    totalRounds: results.length,
    stats,
    patterns: {
      sumRange: patterns.sumRange,
      oddEvenMostCommon: patterns.oddEvenRatio.mostCommon,
      highLowMostCommon: patterns.highLowRatio.mostCommon,
      consecutivePairsPercent: patterns.consecutivePairs,
    },
    lastUpdate: new Date().toISOString(),
  }
}
