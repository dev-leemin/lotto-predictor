import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * 연금복권 720+ CDM (Compound-Dirichlet-Multinomial) 예측
 *
 * 논문: arXiv:2403.12836 기반
 *
 * 연금복권 특성:
 * - 조: 1~5 (5개 중 1개 선택)
 * - 번호: 6자리, 각 자리 0~9 (10개 중 1개 선택)
 *
 * CDM 공식: Pred(j) = M × (αⱼ + nⱼ) / Σ(αⱼ + nⱼ)
 * - αⱼ: 사전확률 파라미터 (균등분포에서 시작)
 * - nⱼ: 관측 빈도
 */

interface PensionData {
  round: number
  date: string
  group: number
  numbers: number[]
}

// DB에서 연금복권 데이터 로드
async function loadPensionData(): Promise<PensionData[]> {
  const results = await prisma.pensionLotteryResult.findMany({
    orderBy: { round: 'asc' },
  })

  return results.map(r => ({
    round: r.round,
    date: r.date,
    group: r.group1,
    numbers: [r.num1_1, r.num1_2, r.num1_3, r.num1_4, r.num1_5, r.num1_6],
  }))
}

// CDM 파라미터 추정 (Method of Moments)
function estimateAlpha(frequencies: number[], total: number, categories: number): number {
  const N = total
  const K = categories

  // 빈도 비율
  const p = frequencies.map(f => f / N)

  // 분산 계산
  const meanP = 1 / K
  const variance = p.reduce((sum, pi) => sum + Math.pow(pi - meanP, 2), 0) / K

  // Method of Moments로 α 추정
  // Var(p) ≈ (K-1) / (K² × (N×α + 1))
  if (variance > 0) {
    const alpha = ((K - 1) / (K * K * variance) - 1) / N
    return Math.max(0.1, Math.min(alpha, 10)) // 0.1 ~ 10 범위로 제한
  }

  return 1 // 기본값
}

// 조(Group) CDM 분석
function analyzeGroupCDM(data: PensionData[]) {
  const K = 5 // 조 개수
  const frequencies = Array(K).fill(0)

  data.forEach(d => {
    frequencies[d.group - 1]++
  })

  const total = data.length
  const alpha = estimateAlpha(frequencies, total, K)

  // CDM 예측 확률
  const predictions = Array(K).fill(0).map((_, i) => {
    const group = i + 1
    const freq = frequencies[i]
    const cdmScore = (alpha + freq) / (K * alpha + total)
    const lastAppeared = [...data].reverse().findIndex(d => d.group === group)

    return {
      group,
      frequency: freq,
      cdmScore,
      probability: cdmScore * 100,
      lastAppeared: lastAppeared === -1 ? total : lastAppeared,
    }
  })

  return {
    alpha,
    total,
    predictions: predictions.sort((a, b) => b.cdmScore - a.cdmScore),
  }
}

// 각 자릿수별 CDM 분석
function analyzePositionCDM(data: PensionData[], position: number) {
  const K = 10 // 각 자리 0~9
  const frequencies = Array(K).fill(0)

  data.forEach(d => {
    frequencies[d.numbers[position]]++
  })

  const total = data.length
  const alpha = estimateAlpha(frequencies, total, K)

  // CDM 예측 확률
  const predictions = Array(K).fill(0).map((_, i) => {
    const number = i
    const freq = frequencies[i]
    const cdmScore = (alpha + freq) / (K * alpha + total)
    const lastAppeared = [...data].reverse().findIndex(d => d.numbers[position] === number)

    return {
      number,
      frequency: freq,
      cdmScore,
      probability: cdmScore * 100,
      lastAppeared: lastAppeared === -1 ? total : lastAppeared,
    }
  })

  return {
    position,
    alpha,
    predictions: predictions.sort((a, b) => b.cdmScore - a.cdmScore),
  }
}

// CDM 기반 조합 생성
function generateCDMCombinations(
  groupAnalysis: ReturnType<typeof analyzeGroupCDM>,
  positionAnalyses: ReturnType<typeof analyzePositionCDM>[]
): { group: number; numbers: number[]; score: number; method: string }[] {
  const combinations: { group: number; numbers: number[]; score: number; method: string }[] = []

  // 방법 1: 순수 CDM TOP - 각 자리별 최고 확률 번호
  const topGroup = groupAnalysis.predictions[0].group
  const topNumbers = positionAnalyses.map(pa => pa.predictions[0].number)
  const topScore = groupAnalysis.predictions[0].cdmScore *
    positionAnalyses.reduce((prod, pa) => prod * pa.predictions[0].cdmScore, 1)

  combinations.push({
    group: topGroup,
    numbers: topNumbers,
    score: topScore,
    method: 'CDM 최고확률 조합',
  })

  // 방법 2: CDM 가중 샘플링 (확률 비례 선택)
  for (let i = 0; i < 2; i++) {
    const sampledNumbers = positionAnalyses.map(pa => {
      // 확률 비례 선택
      const totalProb = pa.predictions.reduce((sum, p) => sum + p.cdmScore, 0)
      let random = Math.random() * totalProb
      for (const pred of pa.predictions) {
        random -= pred.cdmScore
        if (random <= 0) return pred.number
      }
      return pa.predictions[0].number
    })

    // 조도 확률 비례 선택
    const totalGroupProb = groupAnalysis.predictions.reduce((sum, p) => sum + p.cdmScore, 0)
    let groupRandom = Math.random() * totalGroupProb
    let sampledGroup = groupAnalysis.predictions[0].group
    for (const pred of groupAnalysis.predictions) {
      groupRandom -= pred.cdmScore
      if (groupRandom <= 0) {
        sampledGroup = pred.group
        break
      }
    }

    const score = calculateCombinationScore(
      sampledGroup, sampledNumbers, groupAnalysis, positionAnalyses
    )

    combinations.push({
      group: sampledGroup,
      numbers: sampledNumbers,
      score,
      method: `CDM 확률가중 샘플링 #${i + 1}`,
    })
  }

  return combinations
}

// 조합 점수 계산
function calculateCombinationScore(
  group: number,
  numbers: number[],
  groupAnalysis: ReturnType<typeof analyzeGroupCDM>,
  positionAnalyses: ReturnType<typeof analyzePositionCDM>[]
): number {
  const groupScore = groupAnalysis.predictions.find(p => p.group === group)?.cdmScore || 0
  const numberScores = numbers.map((num, pos) =>
    positionAnalyses[pos].predictions.find(p => p.number === num)?.cdmScore || 0
  )

  return groupScore * numberScores.reduce((prod, s) => prod * s, 1)
}

async function main() {
  console.log('=' .repeat(60))
  console.log('연금복권 720+ CDM (Compound-Dirichlet-Multinomial) 분석')
  console.log('논문: arXiv:2403.12836 기반 순수 확률 예측')
  console.log('=' .repeat(60))

  // 데이터 로드
  const data = await loadPensionData()
  console.log(`\n총 ${data.length}회차 데이터 로드`)

  if (data.length === 0) {
    console.log('데이터가 없습니다.')
    await prisma.$disconnect()
    return
  }

  const latest = data[data.length - 1]
  console.log(`최신: ${latest.round}회차 (${latest.date}) - ${latest.group}조 ${latest.numbers.join('')}`)

  // 조 CDM 분석
  console.log('\n' + '-'.repeat(60))
  console.log('【조(Group) CDM 분석】')
  console.log('-'.repeat(60))

  const groupAnalysis = analyzeGroupCDM(data)
  console.log(`추정 α 파라미터: ${groupAnalysis.alpha.toFixed(4)}`)
  console.log('\n조별 CDM 예측 확률:')

  groupAnalysis.predictions.forEach((p, idx) => {
    const bar = '█'.repeat(Math.round(p.probability * 2))
    console.log(`  ${idx + 1}위: ${p.group}조 - ${p.probability.toFixed(2)}% (출현: ${p.frequency}회, 미출현: ${p.lastAppeared}회차) ${bar}`)
  })

  // 각 자릿수별 CDM 분석
  console.log('\n' + '-'.repeat(60))
  console.log('【자릿수별 CDM 분석】')
  console.log('-'.repeat(60))

  const positionAnalyses: ReturnType<typeof analyzePositionCDM>[] = []

  for (let pos = 0; pos < 6; pos++) {
    const analysis = analyzePositionCDM(data, pos)
    positionAnalyses.push(analysis)

    console.log(`\n${pos + 1}번째 자리 (α=${analysis.alpha.toFixed(4)}):`)
    const top3 = analysis.predictions.slice(0, 3)
    top3.forEach((p, idx) => {
      const bar = '█'.repeat(Math.round(p.probability))
      console.log(`  ${idx + 1}위: ${p.number} - ${p.probability.toFixed(2)}% (출현: ${p.frequency}회) ${bar}`)
    })
  }

  // CDM 기반 예측 조합
  console.log('\n' + '='.repeat(60))
  console.log('【CDM 기반 1등 예상 조합 (논문 순수 확률)】')
  console.log('='.repeat(60))

  const combinations = generateCDMCombinations(groupAnalysis, positionAnalyses)

  combinations.forEach((combo, idx) => {
    console.log(`\n[${idx + 1}] ${combo.method}`)
    console.log(`   조: ${combo.group}조`)
    console.log(`   번호: ${combo.numbers.join(' - ')} (${combo.numbers.join('')})`)
    console.log(`   결합 CDM 점수: ${(combo.score * 1e9).toFixed(6)} × 10⁻⁹`)
  })

  // 통계 요약
  console.log('\n' + '-'.repeat(60))
  console.log('【분석 요약】')
  console.log('-'.repeat(60))

  // 가장 유리한 조
  const bestGroup = groupAnalysis.predictions[0]
  console.log(`\n가장 유리한 조: ${bestGroup.group}조 (CDM 확률: ${bestGroup.probability.toFixed(2)}%)`)

  // 각 자리별 가장 유리한 번호
  console.log('\n각 자리별 가장 유리한 번호:')
  positionAnalyses.forEach((pa, pos) => {
    const best = pa.predictions[0]
    console.log(`  ${pos + 1}번째 자리: ${best.number} (CDM 확률: ${best.probability.toFixed(2)}%)`)
  })

  // 최종 추천
  console.log('\n' + '='.repeat(60))
  console.log('【최종 CDM 기반 추천 (상위 3개)】')
  console.log('='.repeat(60))

  combinations.slice(0, 3).forEach((combo, idx) => {
    console.log(`\n${idx + 1}. ${combo.group}조 ${combo.numbers.join('')}`)
    console.log(`   방법: ${combo.method}`)
  })

  await prisma.$disconnect()
}

main().catch(console.error)
