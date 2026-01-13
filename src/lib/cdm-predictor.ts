/**
 * CDM (Compound-Dirichlet-Multinomial) 예측 모델
 *
 * 논문: "Predicting Winning Lottery Numbers" (arXiv:2403.12836, 2024)
 *
 * 핵심 공식:
 * Pred(번호 j) = M × (αⱼ + nⱼ) / Σ(αⱼ + nⱼ)
 *
 * - M: 뽑는 개수 (로또 6/45의 경우 6)
 * - nⱼ: 번호 j가 과거에 출현한 총 횟수
 * - αⱼ: 사전 파라미터 (적률법: nⱼ/n, MLE 등)
 */

// 감마 함수 근사 (스털링 근사)
function gammaLn(x: number): number {
  if (x <= 0) return 0
  const coefficients = [
    76.18009172947146,
    -86.50532032941677,
    24.01409824083091,
    -1.231739572450155,
    0.001208650973866179,
    -0.000005395239384953,
  ]

  let y = x
  let tmp = x + 5.5
  tmp -= (x + 0.5) * Math.log(tmp)
  let ser = 1.000000000190015

  for (let j = 0; j < 6; j++) {
    ser += coefficients[j] / ++y
  }

  return -tmp + Math.log(2.5066282746310005 * ser / x)
}

// 오일러-마스케로니 상수
const EULER_MASCHERONI = 0.57721566490153286

// ==================== 로또 6/45 CDM 예측 ====================

export interface LottoResultData {
  round: number
  numbers: number[]
  bonus: number
}

export interface CDMPrediction {
  rank: number
  number: number
  cdmScore: number          // CDM 예측 점수
  frequency: number         // 총 출현 횟수
  lastAppeared: number      // 마지막 출현 회차
  consecutiveMiss: number   // 연속 미출현
  bayesianPosterior: number // 베이지안 사후확률
  reasons: string[]
}

export interface CDMAnalysisResult {
  rankedNumbers: CDMPrediction[]
  recommendedSets: Array<{
    set: number
    numbers: number[]
    score: number
    method: string
  }>
  modelInfo: {
    totalRounds: number
    method: string
    alphaSum: number
  }
  latestRound: number
}

// 적률법 (Method of Moments)으로 α 파라미터 추정
function estimateAlphaMM(frequencies: number[], totalRounds: number): number[] {
  return frequencies.map(freq => freq / totalRounds)
}

// 최대우도추정법 (MLE)으로 α 파라미터 추정
function estimateAlphaMLE(frequencies: number[], totalRounds: number): number[] {
  const K = frequencies.length
  const totalFreq = frequencies.reduce((a, b) => a + b, 0)

  // 상대 빈도 계산
  const f = frequencies.map(freq => freq / totalFreq)

  // α₀ 계산 (논문 공식)
  let sumFLogF = 0
  f.forEach(fi => {
    if (fi > 0) sumFLogF += fi * Math.log(fi)
  })

  const numerator = totalRounds * (K - 1) * EULER_MASCHERONI
  let sumFLogX = 0
  frequencies.forEach((freq, i) => {
    if (freq > 0 && f[i] > 0) {
      sumFLogX += f[i] * Math.log(freq)
    }
  })

  const denominator = totalRounds * sumFLogF - sumFLogX
  const alpha0 = denominator !== 0 ? Math.abs(numerator / denominator) : 1

  // 각 번호별 α 계산
  return f.map(fi => alpha0 * fi)
}

// CDM 예측 점수 계산
function calculateCDMScore(
  number: number,
  nj: number,        // 해당 번호의 출현 횟수
  alphaj: number,    // 사전 파라미터
  totalAlphaN: number, // Σ(αⱼ + nⱼ)
  M: number = 6      // 뽑는 개수
): number {
  // Pred(j) = M × (αⱼ + nⱼ) / Σ(αⱼ + nⱼ)
  return M * (alphaj + nj) / totalAlphaN
}

// 베이지안 사후확률 계산
function calculateBayesianPosterior(
  nj: number,
  alphaj: number,
  totalAlphaN: number
): number {
  // 디리클레 사후분포의 기대값: (αⱼ + nⱼ) / Σ(αⱼ + nⱼ)
  return (alphaj + nj) / totalAlphaN
}

// 로또 6/45 CDM 분석
export function analyzeLottoCDM(results: LottoResultData[]): CDMAnalysisResult {
  const K = 45 // 총 번호 개수
  const M = 6  // 뽑는 개수
  const n = results.length

  if (n === 0) {
    throw new Error('분석할 데이터가 없습니다.')
  }

  // 1. 각 번호의 출현 횟수 계산 (nⱼ)
  const frequencies: number[] = Array(K + 1).fill(0)
  const lastAppeared: number[] = Array(K + 1).fill(0)

  results.forEach(result => {
    result.numbers.forEach(num => {
      frequencies[num]++
      lastAppeared[num] = result.round
    })
  })

  // 2. α 파라미터 추정 (적률법 + MLE 혼합)
  const validFrequencies = frequencies.slice(1)
  const alphaMM = estimateAlphaMM(validFrequencies, n)
  const alphaMLE = estimateAlphaMLE(validFrequencies, n)

  // 두 방법의 평균 사용 (더 안정적)
  const alpha = alphaMM.map((mm, i) => (mm + alphaMLE[i]) / 2)

  // 3. Σ(αⱼ + nⱼ) 계산
  let totalAlphaN = 0
  for (let j = 1; j <= K; j++) {
    totalAlphaN += alpha[j - 1] + frequencies[j]
  }

  // 4. 각 번호별 CDM 점수 및 통계 계산
  const latestRound = results[results.length - 1].round
  const predictions: CDMPrediction[] = []

  for (let num = 1; num <= K; num++) {
    const nj = frequencies[num]
    const alphaj = alpha[num - 1]
    const cdmScore = calculateCDMScore(num, nj, alphaj, totalAlphaN, M)
    const bayesianPosterior = calculateBayesianPosterior(nj, alphaj, totalAlphaN)
    const consecutiveMiss = latestRound - lastAppeared[num]

    const reasons: string[] = []

    // 점수 기반 이유 분석
    const avgFreq = validFrequencies.reduce((a, b) => a + b, 0) / K
    if (nj > avgFreq * 1.1) {
      reasons.push(`평균 이상 출현 (${nj}회)`)
    }

    // 출현 예정 분석
    const avgGap = n * M / K // 평균 출현 간격
    if (consecutiveMiss > avgGap * 1.2 && consecutiveMiss < avgGap * 3) {
      reasons.push(`출현 예정 (${consecutiveMiss}회 미출현)`)
    }

    // 최근 트렌드 분석
    const recent20 = results.slice(-20)
    let recentCount = 0
    recent20.forEach(r => {
      if (r.numbers.includes(num)) recentCount++
    })
    if (recentCount >= 3) {
      reasons.push(`최근 활발 (20회차 내 ${recentCount}회)`)
    }

    predictions.push({
      rank: 0,
      number: num,
      cdmScore: Math.round(cdmScore * 10000) / 10000,
      frequency: nj,
      lastAppeared: lastAppeared[num],
      consecutiveMiss,
      bayesianPosterior: Math.round(bayesianPosterior * 10000) / 10000,
      reasons,
    })
  }

  // 5. CDM 점수 순으로 정렬
  predictions.sort((a, b) => b.cdmScore - a.cdmScore)
  predictions.forEach((p, idx) => {
    p.rank = idx + 1
  })

  // 6. 추천 세트 생성 (15개)
  const recommendedSets = generateCDMSets(predictions, results)

  return {
    rankedNumbers: predictions.slice(0, 15),
    recommendedSets,
    modelInfo: {
      totalRounds: n,
      method: 'CDM (Compound-Dirichlet-Multinomial)',
      alphaSum: alpha.reduce((a, b) => a + b, 0),
    },
    latestRound,
  }
}

// CDM 기반 15개 추천 세트 생성
function generateCDMSets(
  predictions: CDMPrediction[],
  results: LottoResultData[]
): Array<{ set: number; numbers: number[]; score: number; method: string }> {
  const sets: Array<{ set: number; numbers: number[]; score: number; method: string }> = []
  const usedCombinations = new Set<string>()

  const getCombinationKey = (nums: number[]) => [...nums].sort((a, b) => a - b).join(',')

  // 조합 점수 계산
  const calculateSetScore = (nums: number[]): number => {
    let score = 0

    // CDM 점수 합계
    nums.forEach(num => {
      const pred = predictions.find(p => p.number === num)
      if (pred) score += pred.cdmScore * 100
    })

    // 합계 적합성 (평균 138 근처)
    const sum = nums.reduce((a, b) => a + b, 0)
    if (sum >= 115 && sum <= 160) score += 20

    // 홀짝 균형
    const oddCount = nums.filter(n => n % 2 === 1).length
    if (oddCount === 3) score += 15
    else if (oddCount === 2 || oddCount === 4) score += 10

    // 고저 균형
    const lowCount = nums.filter(n => n <= 22).length
    if (lowCount === 3) score += 10

    return Math.round(score * 100) / 100
  }

  // 세트 생성 함수
  const generateSet = (
    candidates: CDMPrediction[],
    constraints: { targetOdd?: number; mustInclude?: number[] } = {}
  ): number[] | null => {
    const { targetOdd = 3, mustInclude = [] } = constraints
    const selected = [...mustInclude]
    let oddCount = selected.filter(n => n % 2 === 1).length
    let lowCount = selected.filter(n => n <= 22).length

    for (const cand of candidates) {
      if (selected.length >= 6) break
      if (selected.includes(cand.number)) continue

      const isOdd = cand.number % 2 === 1
      const isLow = cand.number <= 22

      // 홀짝 균형
      if (isOdd && oddCount >= targetOdd + 1) continue
      if (!isOdd && oddCount < targetOdd && selected.length >= 6 - (targetOdd - oddCount)) continue

      // 고저 균형
      if (isLow && lowCount >= 4) continue
      if (!isLow && lowCount <= 1 && selected.length >= 4) continue

      selected.push(cand.number)
      if (isOdd) oddCount++
      if (isLow) lowCount++
    }

    if (selected.length < 6) return null

    const key = getCombinationKey(selected)
    if (usedCombinations.has(key)) return null

    usedCombinations.add(key)
    return selected.sort((a, b) => a - b)
  }

  // 1. 순수 CDM 최고점수 조합
  const set1 = generateSet(predictions)
  if (set1) {
    sets.push({
      set: 1,
      numbers: set1,
      score: calculateSetScore(set1),
      method: 'CDM 최고확률',
    })
  }

  // 2~4. 홀짝 변형 조합
  for (let oddTarget = 2; oddTarget <= 4; oddTarget++) {
    const nums = generateSet(predictions, { targetOdd: oddTarget })
    if (nums) {
      sets.push({
        set: sets.length + 1,
        numbers: nums,
        score: calculateSetScore(nums),
        method: `CDM 홀${oddTarget}짝${6 - oddTarget}`,
      })
    }
  }

  // 5~7. 출현예정 번호 포함 (consecutiveMiss 높은 순)
  const overdueNumbers = [...predictions]
    .sort((a, b) => b.consecutiveMiss - a.consecutiveMiss)
    .slice(0, 10)

  for (let i = 0; i < 3 && i < overdueNumbers.length; i++) {
    const nums = generateSet(predictions, { mustInclude: [overdueNumbers[i].number] })
    if (nums) {
      sets.push({
        set: sets.length + 1,
        numbers: nums,
        score: calculateSetScore(nums),
        method: `출현예정 ${overdueNumbers[i].number}번 포함`,
      })
    }
  }

  // 8~10. 베이지안 사후확률 기반
  const bayesianSorted = [...predictions].sort((a, b) => b.bayesianPosterior - a.bayesianPosterior)
  for (let i = 0; i < 3; i++) {
    const topBayesian = bayesianSorted.slice(i * 2, i * 2 + 2).map(p => p.number)
    if (topBayesian.length >= 2) {
      const nums = generateSet(predictions, { mustInclude: topBayesian })
      if (nums) {
        sets.push({
          set: sets.length + 1,
          numbers: nums,
          score: calculateSetScore(nums),
          method: `베이지안 상위 ${topBayesian.join(',')}`,
        })
      }
    }
  }

  // 11~15. 다양성 조합 (덜 사용된 번호 우선)
  const usedNumbers = new Set<number>()
  sets.forEach(s => s.numbers.forEach(n => usedNumbers.add(n)))

  for (let i = 0; sets.length < 15 && i < 10; i++) {
    const reorderedPredictions = [...predictions].sort((a, b) => {
      const aUsed = usedNumbers.has(a.number) ? 1 : 0
      const bUsed = usedNumbers.has(b.number) ? 1 : 0
      if (aUsed !== bUsed) return aUsed - bUsed
      return b.cdmScore - a.cdmScore
    })

    const nums = generateSet(reorderedPredictions, { targetOdd: 2 + (i % 3) })
    if (nums) {
      sets.push({
        set: sets.length + 1,
        numbers: nums,
        score: calculateSetScore(nums),
        method: `CDM 다양성 #${sets.length - 9}`,
      })
      nums.forEach(n => usedNumbers.add(n))
    }
  }

  // 점수 순 정렬
  sets.sort((a, b) => b.score - a.score)
  return sets.slice(0, 15).map((s, idx) => ({ ...s, set: idx + 1 }))
}

// ==================== 연금복권 720+ CDM 예측 ====================

export interface PensionResultData {
  round: number
  group: number      // 조 (1~5)
  numbers: number[]  // 6자리 숫자 (각 0~9)
}

export interface PensionCDMPrediction {
  position: number   // 자릿수 (1~6)
  digit: number      // 숫자 (0~9)
  cdmScore: number
  frequency: number
  bayesianPosterior: number
}

export interface PensionCDMResult {
  groupPrediction: {
    group: number
    score: number
    frequency: number
  }[]
  digitPredictions: PensionCDMPrediction[][]  // 6자리 각각
  recommendedSets: Array<{
    set: number
    group: number
    numbers: number[]
    score: number
  }>
  latestRound: number
}

// 연금복권 CDM 분석
export function analyzePensionCDM(results: PensionResultData[]): PensionCDMResult {
  const n = results.length

  if (n === 0) {
    throw new Error('분석할 데이터가 없습니다.')
  }

  // 1. 조 분석 (1~5)
  const groupFreq: number[] = [0, 0, 0, 0, 0, 0] // index 1~5 사용
  results.forEach(r => {
    if (r.group >= 1 && r.group <= 5) {
      groupFreq[r.group]++
    }
  })

  const groupAlpha = groupFreq.slice(1).map(f => f / n)
  const groupTotalAlphaN = groupAlpha.reduce((a, b, i) => a + b + groupFreq[i + 1], 0)

  const groupPrediction = [1, 2, 3, 4, 5].map(g => ({
    group: g,
    score: 5 * (groupAlpha[g - 1] + groupFreq[g]) / groupTotalAlphaN,
    frequency: groupFreq[g],
  })).sort((a, b) => b.score - a.score)

  // 2. 각 자릿수별 숫자 분석 (0~9)
  const digitPredictions: PensionCDMPrediction[][] = []

  for (let pos = 0; pos < 6; pos++) {
    const digitFreq: number[] = Array(10).fill(0)

    results.forEach(r => {
      if (r.numbers[pos] !== undefined) {
        digitFreq[r.numbers[pos]]++
      }
    })

    const digitAlpha = digitFreq.map(f => f / n)
    const totalAlphaN = digitAlpha.reduce((a, b, i) => a + b + digitFreq[i], 0)

    const predictions: PensionCDMPrediction[] = []
    for (let digit = 0; digit <= 9; digit++) {
      predictions.push({
        position: pos + 1,
        digit,
        cdmScore: 10 * (digitAlpha[digit] + digitFreq[digit]) / totalAlphaN,
        frequency: digitFreq[digit],
        bayesianPosterior: (digitAlpha[digit] + digitFreq[digit]) / totalAlphaN,
      })
    }

    predictions.sort((a, b) => b.cdmScore - a.cdmScore)
    digitPredictions.push(predictions)
  }

  // 3. 추천 세트 생성 (15개)
  const recommendedSets: Array<{
    set: number
    group: number
    numbers: number[]
    score: number
  }> = []

  const usedCombinations = new Set<string>()

  // 각 조별로 3세트씩
  for (const gp of groupPrediction) {
    for (let variant = 0; variant < 3 && recommendedSets.length < 15; variant++) {
      const numbers: number[] = []
      let totalScore = gp.score * 10

      for (let pos = 0; pos < 6; pos++) {
        // 상위 3개 중에서 variant에 따라 선택
        const idx = Math.min(variant, digitPredictions[pos].length - 1)
        const selected = digitPredictions[pos][idx]
        numbers.push(selected.digit)
        totalScore += selected.cdmScore
      }

      const key = `${gp.group}-${numbers.join('')}`
      if (!usedCombinations.has(key)) {
        usedCombinations.add(key)
        recommendedSets.push({
          set: recommendedSets.length + 1,
          group: gp.group,
          numbers,
          score: Math.round(totalScore * 100) / 100,
        })
      }
    }
  }

  // 점수순 정렬
  recommendedSets.sort((a, b) => b.score - a.score)
  recommendedSets.forEach((s, idx) => {
    s.set = idx + 1
  })

  return {
    groupPrediction,
    digitPredictions,
    recommendedSets: recommendedSets.slice(0, 15),
    latestRound: results[results.length - 1].round,
  }
}
