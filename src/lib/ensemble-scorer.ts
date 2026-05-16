/**
 * 앙상블 스코어러
 *
 * CDM (40%) + Markov (30%) + Monte Carlo (30%) 가중 합산
 *
 * 각 모델의 점수를 0~1로 정규화한 뒤 가중 합산하여
 * 다각도 분석 기반의 최종 번호 랭킹 생성
 */

export interface EnsembleRank {
  number: number
  ensembleScore: number  // 가중 합산 점수 (0~1)
  cdmScore: number       // CDM 정규화 점수
  markovScore: number    // Markov 정규화 점수
  mcScore: number        // Monte Carlo 정규화 점수
  rank: number
}

export interface EnsembleResult {
  ranking: EnsembleRank[]   // 45개 번호 전체 랭킹
  sets: Array<{
    set: number
    numbers: number[]
    score: number
    method: string
  }>
  weights: { cdm: number; markov: number; mc: number }
}

const WEIGHTS = {
  cdm: 0.4,
  markov: 0.3,
  mc: 0.3,
}

export function calculateEnsemble(
  cdmScores: { number: number; score: number }[],
  markovScores: { number: number; score: number }[],
  mcScores: { number: number; score: number }[],
): EnsembleResult {
  const N = 45

  // 1. 각 모델 점수를 Map으로 변환
  const cdmMap = new Map(cdmScores.map(s => [s.number, s.score]))
  const markovMap = new Map(markovScores.map(s => [s.number, s.score]))
  const mcMap = new Map(mcScores.map(s => [s.number, s.score]))

  // 2. CDM 점수 정규화 (CDM은 원래 0~1이 아닐 수 있음)
  const cdmValues = Array.from(cdmMap.values())
  const cdmMax = Math.max(...cdmValues)
  const cdmMin = Math.min(...cdmValues)
  const cdmRange = cdmMax - cdmMin || 1

  // 3. 앙상블 점수 계산
  const ranking: EnsembleRank[] = []

  for (let i = 1; i <= N; i++) {
    const rawCdm = cdmMap.get(i) || 0
    const normalizedCdm = (rawCdm - cdmMin) / cdmRange
    const markov = markovMap.get(i) || 0 // 이미 0~1
    const mc = mcMap.get(i) || 0         // 이미 0~1

    const ensembleScore =
      normalizedCdm * WEIGHTS.cdm +
      markov * WEIGHTS.markov +
      mc * WEIGHTS.mc

    ranking.push({
      number: i,
      ensembleScore,
      cdmScore: normalizedCdm,
      markovScore: markov,
      mcScore: mc,
      rank: 0,
    })
  }

  // 점수 순 정렬 + 랭크 부여
  ranking.sort((a, b) => b.ensembleScore - a.ensembleScore)
  ranking.forEach((r, idx) => { r.rank = idx + 1 })

  // 4. 추천 세트 생성 (5세트)
  const sets: EnsembleResult['sets'] = []

  // 세트 1: 앙상블 TOP 6
  sets.push({
    set: 1,
    numbers: ranking.slice(0, 6).map(r => r.number).sort((a, b) => a - b),
    score: ranking.slice(0, 6).reduce((sum, r) => sum + r.ensembleScore, 0),
    method: '앙상블 TOP 6',
  })

  // 세트 2: 앙상블 7~12
  sets.push({
    set: 2,
    numbers: ranking.slice(6, 12).map(r => r.number).sort((a, b) => a - b),
    score: ranking.slice(6, 12).reduce((sum, r) => sum + r.ensembleScore, 0),
    method: '앙상블 차순위',
  })

  // 세트 3: 3모델 모두 상위권인 번호 (합의 번호)
  const consensusNumbers = ranking
    .filter(r => r.cdmScore > 0.5 && r.markovScore > 0.5 && r.mcScore > 0.5)
    .slice(0, 6)

  if (consensusNumbers.length >= 6) {
    sets.push({
      set: 3,
      numbers: consensusNumbers.map(r => r.number).sort((a, b) => a - b),
      score: consensusNumbers.reduce((sum, r) => sum + r.ensembleScore, 0),
      method: '3모델 합의',
    })
  } else {
    // 합의 번호가 6개 미만이면 앙상블 TOP에서 보충
    const filled = [...consensusNumbers]
    for (const r of ranking) {
      if (filled.length >= 6) break
      if (!filled.find(x => x.number === r.number)) {
        filled.push(r)
      }
    }
    sets.push({
      set: 3,
      numbers: filled.slice(0, 6).map(r => r.number).sort((a, b) => a - b),
      score: filled.slice(0, 6).reduce((sum, r) => sum + r.ensembleScore, 0),
      method: '3모델 합의+보충',
    })
  }

  // 세트 4: CDM 강세 + 다른 모델 보조
  const cdmBiased = [...ranking].sort((a, b) =>
    (b.cdmScore * 0.6 + b.markovScore * 0.2 + b.mcScore * 0.2) -
    (a.cdmScore * 0.6 + a.markovScore * 0.2 + a.mcScore * 0.2)
  )
  sets.push({
    set: 4,
    numbers: cdmBiased.slice(0, 6).map(r => r.number).sort((a, b) => a - b),
    score: cdmBiased.slice(0, 6).reduce((sum, r) => sum + r.ensembleScore, 0),
    method: 'CDM 가중 앙상블',
  })

  // 세트 5: Markov 강세 + 다른 모델 보조
  const markovBiased = [...ranking].sort((a, b) =>
    (b.markovScore * 0.6 + b.cdmScore * 0.2 + b.mcScore * 0.2) -
    (a.markovScore * 0.6 + a.cdmScore * 0.2 + a.mcScore * 0.2)
  )
  sets.push({
    set: 5,
    numbers: markovBiased.slice(0, 6).map(r => r.number).sort((a, b) => a - b),
    score: markovBiased.slice(0, 6).reduce((sum, r) => sum + r.ensembleScore, 0),
    method: 'Markov 가중 앙상블',
  })

  return {
    ranking,
    sets,
    weights: WEIGHTS,
  }
}