/**
 * Markov Chain 예측 모델
 *
 * 핵심 원리: 번호 간 전이 확률
 * "이번 회차에 i가 나왔을 때, 다음 회차에 j가 나올 확률"을 계산
 *
 * 전이 행렬 T[i][j] = (i→j 전이 횟수) / (i 출현 횟수)
 * Markov 점수 = 최근 회차 번호들로부터의 평균 전이 확률
 */

import { LottoResultData } from './cdm-predictor'

export interface MarkovScore {
  number: number
  score: number           // 정규화된 Markov 점수
  rawScore: number        // 원시 전이 확률 합
  topTransitions: number[] // 이 번호로 전이가 높은 출발 번호 (최대 3개)
}

export interface MarkovResult {
  scores: MarkovScore[]
  sets: Array<{
    set: number
    numbers: number[]
    score: number
    method: string
  }>
}

export function analyzeMarkovChain(results: LottoResultData[]): MarkovResult {
  const N = 45

  // 1. 전이 행렬 구축 (45×45)
  // transition[i][j] = i가 나온 회차 다음 회차에 j가 나온 횟수
  const transition: number[][] = Array.from({ length: N + 1 }, () => new Array(N + 1).fill(0))
  const fromCount: number[] = new Array(N + 1).fill(0) // 각 번호의 출발 횟수

  for (let r = 0; r < results.length - 1; r++) {
    const currentNumbers = results[r].numbers
    const nextNumbers = results[r + 1].numbers

    for (const from of currentNumbers) {
      fromCount[from]++
      for (const to of nextNumbers) {
        transition[from][to]++
      }
    }
  }

  // 2. 전이 확률 행렬 정규화
  const transProb: number[][] = Array.from({ length: N + 1 }, () => new Array(N + 1).fill(0))
  for (let i = 1; i <= N; i++) {
    if (fromCount[i] > 0) {
      for (let j = 1; j <= N; j++) {
        transProb[i][j] = transition[i][j] / fromCount[i]
      }
    }
  }

  // 3. 최근 회차 번호들로부터의 Markov 점수 계산
  // 최근 3회차를 가중치로 사용 (최근일수록 높은 가중치)
  const recentRounds = results.slice(-3)
  const weights = [0.5, 0.3, 0.2] // 최근 → 과거

  const rawScores: number[] = new Array(N + 1).fill(0)
  const topTransMap: Map<number, number[]> = new Map()

  for (let j = 1; j <= N; j++) {
    const transitionsFrom: { from: number; prob: number }[] = []

    for (let w = 0; w < recentRounds.length; w++) {
      const roundNumbers = recentRounds[recentRounds.length - 1 - w].numbers
      const weight = weights[w]

      for (const from of roundNumbers) {
        const prob = transProb[from][j]
        rawScores[j] += prob * weight
        if (prob > 0) {
          transitionsFrom.push({ from, prob })
        }
      }
    }

    // 상위 전이 출발 번호 3개
    transitionsFrom.sort((a, b) => b.prob - a.prob)
    topTransMap.set(j, transitionsFrom.slice(0, 3).map(t => t.from))
  }

  // 4. 점수 정규화 (0~1)
  const maxRaw = Math.max(...rawScores.slice(1))
  const minRaw = Math.min(...rawScores.slice(1).filter(s => s > 0))
  const range = maxRaw - minRaw || 1

  const scores: MarkovScore[] = []
  for (let j = 1; j <= N; j++) {
    scores.push({
      number: j,
      score: (rawScores[j] - minRaw) / range,
      rawScore: rawScores[j],
      topTransitions: topTransMap.get(j) || [],
    })
  }

  scores.sort((a, b) => b.score - a.score)

  // 5. 추천 세트 생성 (5세트)
  const sets: MarkovResult['sets'] = []

  // 세트 1: Markov TOP 6
  sets.push({
    set: 1,
    numbers: scores.slice(0, 6).map(s => s.number).sort((a, b) => a - b),
    score: scores.slice(0, 6).reduce((sum, s) => sum + s.score, 0),
    method: 'Markov TOP 6',
  })

  // 세트 2: Markov TOP 7~12
  sets.push({
    set: 2,
    numbers: scores.slice(6, 12).map(s => s.number).sort((a, b) => a - b),
    score: scores.slice(6, 12).reduce((sum, s) => sum + s.score, 0),
    method: 'Markov 차순위 6',
  })

  // 세트 3~5: 가중 랜덤 샘플링
  for (let s = 3; s <= 5; s++) {
    const selected = weightedSample(scores, 6)
    sets.push({
      set: s,
      numbers: selected.sort((a, b) => a - b),
      score: selected.reduce((sum, n) => {
        const sc = scores.find(x => x.number === n)
        return sum + (sc?.score || 0)
      }, 0),
      method: `Markov 가중샘플 ${s - 2}`,
    })
  }

  return { scores, sets }
}

// Markov 점수 기반 가중 랜덤 샘플링
function weightedSample(scores: MarkovScore[], count: number): number[] {
  const totalWeight = scores.reduce((sum, s) => sum + s.score, 0)
  const selected: number[] = []
  const available = [...scores]

  for (let i = 0; i < count && available.length > 0; i++) {
    let rand = Math.random() * totalWeight
    let picked = available[0]

    for (const s of available) {
      rand -= s.score
      if (rand <= 0) {
        picked = s
        break
      }
    }

    selected.push(picked.number)
    const idx = available.indexOf(picked)
    available.splice(idx, 1)
  }

  return selected
}