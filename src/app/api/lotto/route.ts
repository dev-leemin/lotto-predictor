import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { analyzeLottoCDM, LottoResultData } from '@/lib/cdm-predictor'
import { updateLottoDB } from '@/lib/lottery-fetcher'

const prisma = new PrismaClient()

// 캐시 (서버 메모리) - 1시간 캐시
let cachedResponse: Record<string, unknown> | null = null
let lastFetchTime = 0
let lastUpdateCheck = 0
const CACHE_DURATION = 1000 * 60 * 60 // 1시간
const UPDATE_CHECK_INTERVAL = 1000 * 60 * 60 // 1시간마다 업데이트 체크

// GET /api/lotto?round=1200 (특정 회차) 또는 GET /api/lotto (최신)
export async function GET(request: NextRequest) {
  try {
    const now = Date.now()
    const searchParams = request.nextUrl.searchParams
    const targetRound = searchParams.get('round') ? parseInt(searchParams.get('round')!) : null

    // 특정 회차 조회 시 캐시 사용 안함
    const useCache = !targetRound

    // 1시간마다 최신 데이터 업데이트 체크 (최신 조회 시에만)
    if (useCache && now - lastUpdateCheck > UPDATE_CHECK_INTERVAL) {
      console.log('Checking for lotto updates...')
      try {
        const updateResult = await updateLottoDB()
        if (updateResult.updated > 0) {
          console.log(`Lotto: ${updateResult.updated} new rounds added (latest: ${updateResult.latest})`)
          // 캐시 무효화
          cachedResponse = null
          lastFetchTime = 0
        }
      } catch (updateError) {
        console.error('Lotto update check failed:', updateError)
      }
      lastUpdateCheck = now
    }

    // 캐시된 데이터가 있고 1시간 이내면 재사용 (최신 조회 시에만)
    if (useCache && cachedResponse && now - lastFetchTime < CACHE_DURATION) {
      return NextResponse.json({
        ...cachedResponse,
        cached: true,
      })
    }

    // DB에서 로또 데이터 조회
    // targetRound가 있으면 해당 회차 직전까지만, 없으면 전체
    const whereClause = targetRound ? { round: { lt: targetRound } } : {}
    const dbResults = await prisma.lottoResult.findMany({
      where: whereClause,
      orderBy: { round: 'asc' },
    })

    if (dbResults.length === 0) {
      return NextResponse.json(
        { error: 'DB에 로또 데이터가 없습니다.' },
        { status: 404 }
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
      actualResult = await prisma.lottoResult.findUnique({
        where: { round: targetRound },
      })
    }

    // CDM 분석을 위한 데이터 변환
    const results: LottoResultData[] = dbResults.map(r => ({
      round: r.round,
      numbers: [r.num1, r.num2, r.num3, r.num4, r.num5, r.num6].sort((a, b) => a - b),
      bonus: r.bonus,
    }))

    // CDM 논문 기반 분석 실행
    const analysis = analyzeLottoCDM(results)

    // 요일 변환 함수
    const getDayOfWeek = (dateString: string): string => {
      const days = ['일', '월', '화', '수', '목', '금', '토']
      const date = new Date(dateString)
      return days[date.getDay()]
    }

    // 최근 5회차 당첨번호
    const recentResults = dbResults.slice(-5).reverse().map(r => ({
      round: r.round,
      date: r.date,
      dayOfWeek: getDayOfWeek(r.date),
      numbers: [r.num1, r.num2, r.num3, r.num4, r.num5, r.num6].sort((a, b) => a - b),
      bonus: r.bonus,
    }))

    // 최신 회차 정보 (분석 기준)
    const latestResult = dbResults[dbResults.length - 1]

    // 실제 당첨번호와 비교 (특정 회차 조회 시)
    let matchInfo = null
    if (actualResult) {
      const actualNumbers = [
        actualResult.num1, actualResult.num2, actualResult.num3,
        actualResult.num4, actualResult.num5, actualResult.num6
      ].sort((a, b) => a - b)

      // TOP 15 번호 중 맞춘 개수
      const top15Numbers = analysis.rankedNumbers.slice(0, 15).map(r => r.number)
      const matchedInTop15 = actualNumbers.filter(n => top15Numbers.includes(n))

      // 추천 세트별 맞춘 개수
      const setMatches = analysis.recommendedSets.map(set => ({
        set: set.set,
        method: set.method,
        numbers: set.numbers,
        matched: actualNumbers.filter(n => set.numbers.includes(n)).length,
        matchedNumbers: actualNumbers.filter(n => set.numbers.includes(n)),
      }))

      matchInfo = {
        targetRound,
        actualNumbers,
        actualBonus: actualResult.bonus,
        actualDate: actualResult.date,
        top15Matched: matchedInTop15.length,
        top15MatchedNumbers: matchedInTop15,
        setMatches: setMatches.sort((a, b) => b.matched - a.matched),
        bestSetMatch: Math.max(...setMatches.map(s => s.matched)),
      }
    }

    // 응답 데이터
    const responseData = {
      ...analysis,
      recentResults,
      latestDate: latestResult.date,
      latestDayOfWeek: getDayOfWeek(latestResult.date),
      totalRounds: dbResults.length,
      nextRound: targetRound || analysis.latestRound + 1,
      totalResults: dbResults.length,
      patterns: {
        sumRange: { min: 21, max: 255, avg: 138 },
        oddEvenMostCommon: '3:3',
        highLowMostCommon: '3:3',
        consecutivePairsPercent: 60,
      },
      matchInfo,
      isHistorical: !!targetRound,
      lastUpdate: new Date().toISOString(),
    }

    // 최신 조회 시에만 캐시 저장
    if (useCache) {
      cachedResponse = responseData
      lastFetchTime = now
    }

    return NextResponse.json({
      ...responseData,
      cached: false,
    })
  } catch (error) {
    console.error('Lotto API error:', error)
    return NextResponse.json(
      { error: '분석 중 오류가 발생했습니다.', details: String(error) },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DB 동기화 API - 새로운 회차 데이터 추가
export async function POST() {
  try {
    const count = await prisma.lottoResult.count()
    const latest = await prisma.lottoResult.findFirst({
      orderBy: { round: 'desc' },
    })

    return NextResponse.json({
      totalRounds: count,
      latestRound: latest?.round || 0,
      latestDate: latest?.date || '',
      cacheStatus: cachedResponse ? 'ready' : 'empty',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'DB 조회 오류', details: String(error) },
      { status: 500 }
    )
  }
}
