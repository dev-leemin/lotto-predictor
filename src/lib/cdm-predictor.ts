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

// CDM 기반 15개 추천 세트 생성 (순수 확률 기반)
function generateCDMSets(
  predictions: CDMPrediction[],
  results: LottoResultData[]
): Array<{ set: number; numbers: number[]; score: number; method: string }> {
  const sets: Array<{ set: number; numbers: number[]; score: number; method: string }> = []
  const usedCombinations = new Set<string>()

  const getCombinationKey = (nums: number[]) => [...nums].sort((a, b) => a - b).join(',')

  // 순수 CDM 확률 점수만 계산
  const calculatePureCDMScore = (nums: number[]): number => {
    let score = 0
    nums.forEach(num => {
      const pred = predictions.find(p => p.number === num)
      if (pred) score += pred.cdmScore
    })
    return Math.round(score * 10000) / 10000
  }

  // 세트 추가 헬퍼 (중복 체크 후 추가)
  const addSet = (numbers: number[], method: string): boolean => {
    if (numbers.length !== 6) return false
    const sorted = [...numbers].sort((a, b) => a - b)
    const key = getCombinationKey(sorted)
    if (usedCombinations.has(key)) return false
    usedCombinations.add(key)
    sets.push({
      set: sets.length + 1,
      numbers: sorted,
      score: calculatePureCDMScore(sorted),
      method,
    })
    return true
  }

  // 1. CDM TOP 1~6 (최고확률)
  addSet(predictions.slice(0, 6).map(p => p.number), 'CDM TOP 1~6 최고확률')

  // 2. CDM TOP 2~7
  addSet(predictions.slice(1, 7).map(p => p.number), 'CDM TOP 2~7')

  // 3. CDM TOP 3~8
  addSet(predictions.slice(2, 8).map(p => p.number), 'CDM TOP 3~8')

  // 4. CDM 홀수 순위 (1,3,5,7,9,11위)
  addSet([0, 2, 4, 6, 8, 10].map(i => predictions[i].number), 'CDM 홀수순위')

  // 5. CDM 짝수 순위 (2,4,6,8,10,12위)
  addSet([1, 3, 5, 7, 9, 11].map(i => predictions[i].number), 'CDM 짝수순위')

  // 6. CDM TOP 6~11
  addSet(predictions.slice(5, 11).map(p => p.number), 'CDM TOP 6~11')

  // 7. CDM TOP 10~15
  addSet(predictions.slice(9, 15).map(p => p.number), 'CDM TOP 10~15')

  // 8~10. CDM 가중 랜덤 샘플링 (더 많이 시도)
  for (let attempt = 0; attempt < 20 && sets.length < 10; attempt++) {
    const selected: number[] = []
    const available = [...predictions]

    while (selected.length < 6 && available.length > 0) {
      const totalWeight = available.reduce((sum, p) => sum + p.cdmScore, 0)
      let random = Math.random() * totalWeight

      for (let i = 0; i < available.length; i++) {
        random -= available[i].cdmScore
        if (random <= 0) {
          selected.push(available[i].number)
          available.splice(i, 1)
          break
        }
      }
    }
    addSet(selected, `CDM 확률가중 #${sets.length - 6}`)
  }

  // 11~12. 베이지안 사후확률 기반
  const bayesianSorted = [...predictions].sort((a, b) => b.bayesianPosterior - a.bayesianPosterior)
  addSet(bayesianSorted.slice(0, 6).map(p => p.number), '베이지안 TOP 1~6')
  addSet(bayesianSorted.slice(3, 9).map(p => p.number), '베이지안 TOP 4~9')

  // 13~14. 최근 트렌드 반영 (최근 50회차)
  const recent50 = results.slice(-50)
  const recentFreq: Map<number, number> = new Map()
  for (let i = 1; i <= 45; i++) recentFreq.set(i, 0)

  recent50.forEach(r => {
    r.numbers.forEach(num => {
      recentFreq.set(num, (recentFreq.get(num) || 0) + 1)
    })
  })

  const recentSorted = [...predictions].sort((a, b) => {
    const aRecent = recentFreq.get(a.number) || 0
    const bRecent = recentFreq.get(b.number) || 0
    const aScore = aRecent * 0.4 + a.cdmScore * 100 * 0.6
    const bScore = bRecent * 0.4 + b.cdmScore * 100 * 0.6
    return bScore - aScore
  })

  addSet(recentSorted.slice(0, 6).map(p => p.number), '최근트렌드+CDM #1')
  addSet(recentSorted.slice(2, 8).map(p => p.number), '최근트렌드+CDM #2')

  // 15. 미출현 번호 우선 (연속 미출현 높은 번호 + CDM)
  const missSorted = [...predictions].sort((a, b) => {
    // 미출현 가중치 + CDM 점수 결합
    const aScore = a.consecutiveMiss * 0.3 + a.cdmScore * 100 * 0.7
    const bScore = b.consecutiveMiss * 0.3 + b.cdmScore * 100 * 0.7
    return bScore - aScore
  })
  addSet(missSorted.slice(0, 6).map(p => p.number), '미출현+CDM')

  // 부족하면 추가 랜덤 조합 생성
  for (let attempt = 0; attempt < 50 && sets.length < 15; attempt++) {
    const selected: number[] = []
    const pool = predictions.slice(0, 20) // TOP 20에서 선택

    while (selected.length < 6) {
      const idx = Math.floor(Math.random() * pool.length)
      const num = pool[idx].number
      if (!selected.includes(num)) {
        selected.push(num)
      }
    }
    addSet(selected, `CDM 혼합 #${sets.length - 13}`)
  }

  // CDM 점수 순 정렬
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
    method?: string
  }>
  latestRound: number
}

// 연금복권 CDM 분석 (순수 확률 기반)
export function analyzePensionCDM(results: PensionResultData[]): PensionCDMResult {
  const n = results.length

  if (n === 0) {
    throw new Error('분석할 데이터가 없습니다.')
  }

  // 1. 조 분석 (1~5) - CDM 모델 적용
  const groupFreq: number[] = [0, 0, 0, 0, 0, 0] // index 1~5 사용
  results.forEach(r => {
    if (r.group >= 1 && r.group <= 5) {
      groupFreq[r.group]++
    }
  })

  // CDM α 파라미터 추정 (적률법)
  const groupAlpha = groupFreq.slice(1).map(f => f / n)
  const groupTotalAlphaN = groupAlpha.reduce((a, b, i) => a + b + groupFreq[i + 1], 0)

  const groupPrediction = [1, 2, 3, 4, 5].map(g => ({
    group: g,
    // CDM 공식: Pred(j) = M × (αⱼ + nⱼ) / Σ(αⱼ + nⱼ)
    score: 5 * (groupAlpha[g - 1] + groupFreq[g]) / groupTotalAlphaN,
    frequency: groupFreq[g],
  })).sort((a, b) => b.score - a.score)

  // 2. 각 자릿수별 숫자 분석 (0~9) - CDM 모델 적용
  const digitPredictions: PensionCDMPrediction[][] = []

  for (let pos = 0; pos < 6; pos++) {
    const digitFreq: number[] = Array(10).fill(0)

    results.forEach(r => {
      if (r.numbers[pos] !== undefined) {
        digitFreq[r.numbers[pos]]++
      }
    })

    // CDM α 파라미터 추정
    const digitAlpha = digitFreq.map(f => f / n)
    const totalAlphaN = digitAlpha.reduce((a, b, i) => a + b + digitFreq[i], 0)

    const predictions: PensionCDMPrediction[] = []
    for (let digit = 0; digit <= 9; digit++) {
      predictions.push({
        position: pos + 1,
        digit,
        // CDM 공식 적용
        cdmScore: 10 * (digitAlpha[digit] + digitFreq[digit]) / totalAlphaN,
        frequency: digitFreq[digit],
        bayesianPosterior: (digitAlpha[digit] + digitFreq[digit]) / totalAlphaN,
      })
    }

    predictions.sort((a, b) => b.cdmScore - a.cdmScore)
    digitPredictions.push(predictions)
  }

  // 3. 추천 세트 생성 (15개) - 조 상관없이 6자리 번호만 추천
  // 연금복권은 조가 달라도 뒤 6자리만 맞으면 2등 이하 당첨 가능
  const recommendedSets: Array<{
    set: number
    group: number  // 참고용 (CDM 최고확률 조)
    numbers: number[]
    score: number
    method?: string
  }> = []

  const usedCombinations = new Set<string>()

  // 순수 CDM 점수 계산 (6자리 번호만)
  const calculatePureCDMScore = (numbers: number[]): number => {
    let score = 0
    numbers.forEach((digit, pos) => {
      const pred = digitPredictions[pos].find(p => p.digit === digit)
      if (pred) score += pred.cdmScore
    })
    return Math.round(score * 10000) / 10000
  }

  // CDM 최고확률 조 (참고용)
  const bestGroup = groupPrediction[0].group

  // 1. CDM TOP1 조합 (각 자리 최고확률)
  const top1Numbers = digitPredictions.map(dp => dp[0].digit)
  usedCombinations.add(top1Numbers.join(''))
  recommendedSets.push({
    set: 1,
    group: bestGroup,
    numbers: top1Numbers,
    score: calculatePureCDMScore(top1Numbers),
    method: 'CDM TOP1 최고확률',
  })

  // 2~5. CDM TOP 순위 조합
  for (let rank = 1; rank <= 4 && recommendedSets.length < 5; rank++) {
    const numbers: number[] = []
    for (let pos = 0; pos < 6; pos++) {
      // 각 자리별로 rank번째 높은 확률 선택
      const idx = Math.min(rank, digitPredictions[pos].length - 1)
      numbers.push(digitPredictions[pos][idx].digit)
    }

    const key = numbers.join('')
    if (!usedCombinations.has(key)) {
      usedCombinations.add(key)
      recommendedSets.push({
        set: recommendedSets.length + 1,
        group: bestGroup,
        numbers,
        score: calculatePureCDMScore(numbers),
        method: `CDM TOP${rank + 1}`,
      })
    }
  }

  // 6~10. CDM 가중 랜덤 샘플링
  for (let variant = 0; variant < 10 && recommendedSets.length < 10; variant++) {
    const numbers: number[] = []

    for (let pos = 0; pos < 6; pos++) {
      const available = [...digitPredictions[pos]]
      const totalWeight = available.reduce((sum, p) => sum + p.cdmScore, 0)
      let random = Math.random() * totalWeight

      for (const pred of available) {
        random -= pred.cdmScore
        if (random <= 0) {
          numbers.push(pred.digit)
          break
        }
      }

      if (numbers.length <= pos) {
        numbers.push(available[0].digit)
      }
    }

    const key = numbers.join('')
    if (!usedCombinations.has(key)) {
      usedCombinations.add(key)
      recommendedSets.push({
        set: recommendedSets.length + 1,
        group: bestGroup,
        numbers,
        score: calculatePureCDMScore(numbers),
        method: `CDM 확률가중 #${recommendedSets.length - 4}`,
      })
    }
  }

  // 11~15. 베이지안 사후확률 기반 조합
  for (let variant = 0; variant < 10 && recommendedSets.length < 15; variant++) {
    const numbers: number[] = []

    for (let pos = 0; pos < 6; pos++) {
      const bayesianSorted = [...digitPredictions[pos]].sort(
        (a, b) => b.bayesianPosterior - a.bayesianPosterior
      )
      // 각 자리마다 다른 순위 조합
      const idx = (variant + pos) % bayesianSorted.length
      numbers.push(bayesianSorted[idx].digit)
    }

    const key = numbers.join('')
    if (!usedCombinations.has(key)) {
      usedCombinations.add(key)
      recommendedSets.push({
        set: recommendedSets.length + 1,
        group: bestGroup,
        numbers,
        score: calculatePureCDMScore(numbers),
        method: `베이지안 #${recommendedSets.length - 9}`,
      })
    }
  }

  // CDM 점수순 정렬
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
