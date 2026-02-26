import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { analyzePensionCDM, PensionResultData } from '@/lib/cdm-predictor'
import { updatePensionDB } from '@/lib/lottery-fetcher'

// 캐시 (서버 메모리)
let cachedAnalysis: ReturnType<typeof analyzePensionCDM> | null = null
let cachedRecentResults: Array<{ round: number; date: string; group: number; numbers: number[] }> = []
let lastFetchTime = 0
let lastUpdateCheck = 0
const CACHE_DURATION = 1000 * 60 * 30 // 30분
const UPDATE_CHECK_INTERVAL = 1000 * 60 * 60 // 1시간마다 업데이트 체크

// GET /api/pension?round=290 (특정 회차) 또는 GET /api/pension (최신)
export async function GET(request: NextRequest) {
  try {
    const now = Date.now()
    const searchParams = request.nextUrl.searchParams
    const roundParam = searchParams.get('round')
    const targetRound = roundParam ? parseInt(roundParam) : null

    if (roundParam && (isNaN(targetRound!) || targetRound! < 1 || targetRound! > 10000)) {
      return NextResponse.json(
        { error: '유효한 회차를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 특정 회차 조회 시 캐시 사용 안함
    const useCache = !targetRound

    // 1시간마다 최신 데이터 업데이트 체크 (최신 조회 시에만)
    if (useCache && now - lastUpdateCheck > UPDATE_CHECK_INTERVAL) {
      try {
        const updateResult = await updatePensionDB()
        if (updateResult.updated > 0) {
          // 캐시 무효화
          cachedAnalysis = null
          lastFetchTime = 0
        }
      } catch (updateError) {
        console.error('Pension update check failed:', updateError)
      }
      lastUpdateCheck = now
    }

    // 캐시된 데이터가 있고 30분 이내면 재사용 (최신 조회 시에만)
    if (useCache && cachedAnalysis && now - lastFetchTime < CACHE_DURATION) {
      return NextResponse.json({
        ...formatResponse(cachedAnalysis, cachedRecentResults),
        cached: true,
      })
    }

    // DB에서 연금복권 데이터 가져오기
    const whereClause = targetRound ? { round: { lt: targetRound } } : {}
    const dbResults = await prisma.pensionLotteryResult.findMany({
      where: whereClause,
      orderBy: { round: 'asc' },
    })

    if (dbResults.length === 0) {
      return NextResponse.json(
        { error: '연금복권 데이터가 없습니다.' },
        { status: 500 }
      )
    }

    if (dbResults.length < 10) {
      return NextResponse.json(
        { error: `데이터가 충분하지 않습니다. (최소 10회차 필요, 현재 ${dbResults.length}회차)` },
        { status: 400 }
      )
    }

    // 해당 회차의 실제 당첨번호 (특정 회차 조회 시)
    let actualResult = null
    if (targetRound) {
      actualResult = await prisma.pensionLotteryResult.findUnique({
        where: { round: targetRound },
      })
    }

    // DB 데이터를 CDM 분석용 형식으로 변환
    const results: PensionResultData[] = dbResults.map(r => ({
      round: r.round,
      group: r.group1,
      numbers: [r.num1_1, r.num1_2, r.num1_3, r.num1_4, r.num1_5, r.num1_6],
    }))

    // 최근 3회차 결과
    const recentResults = dbResults.slice(-3).reverse().map(r => ({
      round: r.round,
      date: r.date,
      group: r.group1,
      numbers: [r.num1_1, r.num1_2, r.num1_3, r.num1_4, r.num1_5, r.num1_6],
    }))

    // CDM 분석 실행
    const analysis = analyzePensionCDM(results)

    // 실제 당첨번호와 비교 (특정 회차 조회 시)
    let matchInfo = null
    if (actualResult) {
      const actualNumbers = [
        actualResult.num1_1, actualResult.num1_2, actualResult.num1_3,
        actualResult.num1_4, actualResult.num1_5, actualResult.num1_6
      ]
      const actualGroup = actualResult.group1

      // 추천 세트별 맞춘 자릿수
      const setMatches = analysis.recommendedSets.map(set => {
        let matchedDigits = 0
        let matchedPositions: number[] = []

        for (let i = 0; i < 6; i++) {
          if (set.numbers[i] === actualNumbers[i]) {
            matchedDigits++
            matchedPositions.push(i + 1)
          }
        }

        // 뒤에서부터 연속으로 맞춘 개수 (등수 결정)
        let consecutiveFromEnd = 0
        for (let i = 5; i >= 0; i--) {
          if (set.numbers[i] === actualNumbers[i]) {
            consecutiveFromEnd++
          } else {
            break
          }
        }

        return {
          set: set.set,
          method: set.method,
          numbers: set.numbers,
          matchedDigits,
          matchedPositions,
          consecutiveFromEnd,
          prize: getPrizeRank(consecutiveFromEnd),
        }
      })

      matchInfo = {
        targetRound,
        actualGroup,
        actualNumbers,
        actualDate: actualResult.date,
        setMatches: setMatches.sort((a, b) => b.consecutiveFromEnd - a.consecutiveFromEnd),
        bestConsecutiveMatch: Math.max(...setMatches.map(s => s.consecutiveFromEnd)),
      }
    }

    // 캐시 업데이트 (최신 조회 시에만)
    if (useCache) {
      cachedAnalysis = analysis
      cachedRecentResults = recentResults
      lastFetchTime = now
    }

    return NextResponse.json({
      ...formatResponse(analysis, recentResults, matchInfo, targetRound),
      cached: false,
      totalResults: results.length,
      isHistorical: !!targetRound,
    })
  } catch (error) {
    console.error('Pension API error:', error)
    return NextResponse.json(
      { error: '분석 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 연금복권 등수 판정
function getPrizeRank(consecutiveFromEnd: number): string {
  switch (consecutiveFromEnd) {
    case 6: return '1등 (월 700만원 x 20년)'
    case 5: return '2등 (월 100만원 x 10년)'
    case 4: return '3등 (100만원)'
    case 3: return '4등 (10만원)'
    case 2: return '5등 (5만원)'
    case 1: return '6등 (5천원)'
    default: return '낙첨'
  }
}

// 프론트엔드용 응답 포맷
function formatResponse(
  analysis: ReturnType<typeof analyzePensionCDM>,
  recentResults?: Array<{ round: number; date: string; group: number; numbers: number[] }>,
  matchInfo?: unknown,
  targetRound?: number | null
) {
  const predictions = analysis.recommendedSets.slice(0, 3).map((set, idx) => ({
    group: set.group,
    numbers: set.numbers,
    confidence: Math.round(70 - idx * 10),
    reasons: [set.method || 'CDM 분석'],
    cdmScore: set.score,
  }))

  const hotByPosition = analysis.digitPredictions.map((posPredict, idx) => ({
    position: idx + 1,
    hotNumbers: posPredict.slice(0, 3).map(p => p.digit),
  }))

  const coldByPosition = analysis.digitPredictions.map((posPredict, idx) => ({
    position: idx + 1,
    coldNumbers: posPredict.slice(-3).reverse().map(p => p.digit),
  }))

  const groupStats = analysis.groupPrediction.map(g => ({
    group: g.group,
    score: Math.round(g.score * 100) / 100,
    frequency: g.frequency,
    probability: Math.round(g.score * 20),
  }))

  return {
    predictions,
    hotByPosition,
    coldByPosition,
    groupStats,
    recommendedSets: analysis.recommendedSets.map(set => ({
      ...set,
      numberString: set.numbers.join(''),
    })),
    digitPredictions: analysis.digitPredictions.map((posPredict, idx) => ({
      position: idx + 1,
      top3: posPredict.slice(0, 3).map(p => ({
        digit: p.digit,
        cdmScore: Math.round(p.cdmScore * 100) / 100,
        frequency: p.frequency,
      })),
    })),
    recentResults: recentResults || [],
    matchInfo,
    nextRound: targetRound || analysis.latestRound + 1,
    latestRound: analysis.latestRound,
    lastUpdate: new Date().toISOString(),
    method: 'CDM (Compound-Dirichlet-Multinomial)',
  }
}
