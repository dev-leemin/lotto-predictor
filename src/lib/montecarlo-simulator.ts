/**
 * Monte Carlo 시뮬레이션
 *
 * 핵심 원리: CDM + Markov 점수를 확률 분포로 변환하여
 * 50,000회 시뮬레이션 실행 후 번호별 출현 빈도 추출
 *
 * 이론적 확률이 아닌 실제 시뮬레이션 결과이므로
 * CDM/Markov와 다른 관점의 검증 역할
 */

export interface MCScore {
  number: number
  score: number       // 정규화 점수 (0~1)
  frequency: number   // 시뮬레이션 출현 횟수
  percentage: number  // 출현 비율 (%)
}

export interface MCResult {
  scores: MCScore[]
  sets: Array<{
    set: number
    numbers: number[]
    score: number
    method: string
  }>
  totalSimulations: number
}

export function runMonteCarloSimulation(
  cdmScores: { number: number; score: number }[],
  markovScores: { number: number; score: number }[],
  simulations: number = 50000
): MCResult {
  const N = 45
  const DRAW_COUNT = 6

  // 1. CDM + Markov 점수를 합산하여 확률 분포 생성
  const weights = new Array(N + 1).fill(0)

  for (let i = 1; i <= N; i++) {
    const cdm = cdmScores.find(s => s.number === i)?.score || 0
    const markov = markovScores.find(s => s.number === i)?.score || 0
    // CDM 50% + Markov 50%로 시뮬레이션 가중치
    weights[i] = (cdm * 0.5 + markov * 0.5) || 0.01 // 최소값 보장
  }

  // 누적 분포 함수 (CDF) 구축
  const totalWeight = weights.slice(1).reduce((a, b) => a + b, 0)
  const probabilities = weights.map(w => w / totalWeight)

  // 2. 시뮬레이션 실행
  const frequency = new Array(N + 1).fill(0)
  const pairFrequency: Map<string, number> = new Map()
  const comboTracker: Map<string, number> = new Map()

  for (let sim = 0; sim < simulations; sim++) {
    const drawn = weightedDraw(probabilities, DRAW_COUNT)
    drawn.sort((a, b) => a - b)

    // 번호별 출현 빈도
    for (const num of drawn) {
      frequency[num]++
    }

    // 번호 쌍 빈도 (상위 조합 추출용)
    for (let i = 0; i < drawn.length; i++) {
      for (let j = i + 1; j < drawn.length; j++) {
        const key = `${drawn[i]}-${drawn[j]}`
        pairFrequency.set(key, (pairFrequency.get(key) || 0) + 1)
      }
    }

    // 상위 조합 추적 (처음 10000번만 — 메모리 절약)
    if (sim < 10000) {
      const comboKey = drawn.join(',')
      comboTracker.set(comboKey, (comboTracker.get(comboKey) || 0) + 1)
    }
  }

  // 3. 점수 계산
  const maxFreq = Math.max(...frequency.slice(1))
  const minFreq = Math.min(...frequency.slice(1))
  const freqRange = maxFreq - minFreq || 1

  const scores: MCScore[] = []
  for (let i = 1; i <= N; i++) {
    scores.push({
      number: i,
      score: (frequency[i] - minFreq) / freqRange,
      frequency: frequency[i],
      percentage: (frequency[i] / simulations) * 100,
    })
  }

  scores.sort((a, b) => b.score - a.score)

  // 4. 추천 세트 생성 (5세트)
  const sets: MCResult['sets'] = []

  // 세트 1: MC 최고 빈도 6개
  sets.push({
    set: 1,
    numbers: scores.slice(0, 6).map(s => s.number).sort((a, b) => a - b),
    score: scores.slice(0, 6).reduce((sum, s) => sum + s.score, 0),
    method: 'MC 최고빈도 TOP 6',
  })

  // 세트 2: MC 차순위 6개
  sets.push({
    set: 2,
    numbers: scores.slice(6, 12).map(s => s.number).sort((a, b) => a - b),
    score: scores.slice(6, 12).reduce((sum, s) => sum + s.score, 0),
    method: 'MC 차순위 6',
  })

  // 세트 3: 가장 자주 등장한 쌍 기반 조합
  const topPairs = [...pairFrequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)

  const pairNumbers = new Set<number>()
  for (const [pair] of topPairs) {
    const [a, b] = pair.split('-').map(Number)
    pairNumbers.add(a)
    pairNumbers.add(b)
    if (pairNumbers.size >= 6) break
  }
  const pairSet = [...pairNumbers].slice(0, 6).sort((a, b) => a - b)
  if (pairSet.length === 6) {
    sets.push({
      set: 3,
      numbers: pairSet,
      score: pairSet.reduce((sum, n) => {
        const sc = scores.find(x => x.number === n)
        return sum + (sc?.score || 0)
      }, 0),
      method: 'MC 고빈도 쌍 조합',
    })
  }

  // 세트 4~5: 시뮬레이션 가중 샘플링
  for (let s = sets.length + 1; s <= 5; s++) {
    const drawn = weightedDraw(probabilities, DRAW_COUNT)
    drawn.sort((a, b) => a - b)
    sets.push({
      set: s,
      numbers: drawn,
      score: drawn.reduce((sum, n) => {
        const sc = scores.find(x => x.number === n)
        return sum + (sc?.score || 0)
      }, 0),
      method: `MC 확률분포 샘플 ${s - 3}`,
    })
  }

  return { scores, sets, totalSimulations: simulations }
}

// 가중치 기반 비복원 추출
function weightedDraw(probabilities: number[], count: number): number[] {
  const selected: number[] = []
  const available = probabilities.map((p, i) => ({ num: i, prob: p })).filter(x => x.num > 0)

  for (let i = 0; i < count; i++) {
    const totalProb = available.reduce((sum, x) => sum + x.prob, 0)
    let rand = Math.random() * totalProb
    let picked = available[0]

    for (const item of available) {
      rand -= item.prob
      if (rand <= 0) {
        picked = item
        break
      }
    }

    selected.push(picked.num)
    const idx = available.indexOf(picked)
    available.splice(idx, 1)
  }

  return selected
}