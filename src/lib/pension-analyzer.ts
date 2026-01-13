import { PensionResult, Prediction } from '@/types/lottery'

// 연금복권 번호별 통계
interface PensionNumberStats {
  position: number // 자릿수 (0-5, 0이 가장 왼쪽)
  number: number   // 0-9
  frequency: number
  lastAppeared: number
  consecutiveMiss: number
}

// 조별 통계
interface GroupStats {
  group: number
  frequency: number
  lastAppeared: number
}

// 각 자릿수별 숫자 통계 계산
export function calculatePensionStats(results: PensionResult[]) {
  const positionStats: PensionNumberStats[][] = Array(6).fill(null).map(() => [])
  const groupStats: GroupStats[] = []
  const latestRound = results[results.length - 1]?.round || 0

  // 각 자릿수별 0-9 통계 초기화
  for (let pos = 0; pos < 6; pos++) {
    for (let num = 0; num <= 9; num++) {
      positionStats[pos].push({
        position: pos,
        number: num,
        frequency: 0,
        lastAppeared: 0,
        consecutiveMiss: latestRound,
      })
    }
  }

  // 조 통계 초기화
  for (let g = 1; g <= 5; g++) {
    groupStats.push({
      group: g,
      frequency: 0,
      lastAppeared: 0,
    })
  }

  // 데이터 집계
  results.forEach(result => {
    // 조 통계
    const groupStat = groupStats.find(g => g.group === result.group)
    if (groupStat) {
      groupStat.frequency++
      groupStat.lastAppeared = result.round
    }

    // 각 자릿수 통계
    result.numbers.forEach((num, pos) => {
      const stat = positionStats[pos].find(s => s.number === num)
      if (stat) {
        stat.frequency++
        stat.lastAppeared = result.round
      }
    })
  })

  // 연속 미출현 계산
  positionStats.forEach(posStats => {
    posStats.forEach(stat => {
      stat.consecutiveMiss = latestRound - stat.lastAppeared
    })
  })

  return { positionStats, groupStats, latestRound }
}

// 연금복권 예측
export function predictPension(results: PensionResult[]): {
  predictions: Array<{
    group: number
    numbers: number[]
    confidence: number
    reasons: string[]
  }>
  groupStats: GroupStats[]
  positionStats: PensionNumberStats[][]
} {
  const { positionStats, groupStats, latestRound } = calculatePensionStats(results)

  // 조 예측 (최근 출현 빈도 + 미출현 기간)
  const groupScores = groupStats.map(g => {
    // 최근 10회차 출현 횟수
    const recent10 = results.slice(-10).filter(r => r.group === g.group).length
    // 미출현 기간 가중치
    const missWeight = (latestRound - g.lastAppeared) * 0.5
    return {
      group: g.group,
      score: recent10 * 10 + missWeight,
    }
  }).sort((a, b) => b.score - a.score)

  // 각 자릿수별 숫자 예측
  const predictedNumbers: number[] = []
  const reasons: string[] = []

  positionStats.forEach((posStats, pos) => {
    // 각 숫자의 점수 계산
    const scores = posStats.map(stat => {
      const freqScore = stat.frequency / results.length * 100
      const missScore = stat.consecutiveMiss > 5 ? stat.consecutiveMiss * 2 : 0
      const recentScore = stat.consecutiveMiss < 3 ? 20 - stat.consecutiveMiss * 5 : 0

      return {
        number: stat.number,
        score: freqScore + missScore + recentScore,
        reason: stat.consecutiveMiss > 5
          ? `${pos + 1}번째: 최근 미출현`
          : stat.consecutiveMiss < 2
            ? `${pos + 1}번째: 연속 출현 중`
            : '',
      }
    }).sort((a, b) => b.score - a.score)

    // 상위 2개 중 하나 선택 (약간의 랜덤성)
    const selected = scores[0]
    predictedNumbers.push(selected.number)
    if (selected.reason) reasons.push(selected.reason)
  })

  // 예측 3세트 생성
  const predictions = groupScores.slice(0, 3).map((g, idx) => ({
    group: g.group,
    numbers: predictedNumbers.map((n, pos) => {
      // 세트별 약간 다른 번호 (2, 3번째 세트)
      if (idx > 0) {
        const altNumbers = positionStats[pos]
          .sort((a, b) => b.frequency - a.frequency)
          .map(s => s.number)
        return altNumbers[(idx) % 10]
      }
      return n
    }),
    confidence: 70 - idx * 10,
    reasons: idx === 0 ? reasons : [`${idx + 1}번째 추천 조합`],
  }))

  return {
    predictions,
    groupStats,
    positionStats,
  }
}

// 분석 결과 요약
export function analyzePension(results: PensionResult[]) {
  const { predictions, groupStats, positionStats } = predictPension(results)

  // 핫 번호 (각 자릿수별 최근 많이 나온 숫자)
  const hotByPosition = positionStats.map((posStats, pos) => {
    const sorted = [...posStats].sort((a, b) => {
      // 최근 출현 + 빈도 복합 점수
      const scoreA = (posStats.length - a.consecutiveMiss) * 2 + a.frequency
      const scoreB = (posStats.length - b.consecutiveMiss) * 2 + b.frequency
      return scoreB - scoreA
    })
    return {
      position: pos + 1,
      hotNumbers: sorted.slice(0, 3).map(s => s.number),
    }
  })

  // 콜드 번호 (각 자릿수별 오래 안 나온 숫자)
  const coldByPosition = positionStats.map((posStats, pos) => {
    const sorted = [...posStats].sort((a, b) => b.consecutiveMiss - a.consecutiveMiss)
    return {
      position: pos + 1,
      coldNumbers: sorted.slice(0, 3).map(s => s.number),
    }
  })

  return {
    predictions,
    groupStats,
    hotByPosition,
    coldByPosition,
    lastUpdate: new Date().toISOString(),
  }
}
