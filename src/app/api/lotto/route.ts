import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { analyzeLottoCDM, LottoResultData } from '@/lib/cdm-predictor'

const prisma = new PrismaClient()

// 캐시 (서버 메모리) - 1시간 캐시
let cachedResponse: Record<string, unknown> | null = null
let lastFetchTime = 0
const CACHE_DURATION = 1000 * 60 * 60 // 1시간

export async function GET() {
  try {
    const now = Date.now()

    // 캐시된 데이터가 있고 1시간 이내면 재사용
    if (cachedResponse && now - lastFetchTime < CACHE_DURATION) {
      return NextResponse.json({
        ...cachedResponse,
        cached: true,
      })
    }

    // DB에서 로또 데이터 조회
    const dbResults = await prisma.lottoResult.findMany({
      orderBy: { round: 'asc' },
    })

    if (dbResults.length === 0) {
      return NextResponse.json(
        { error: 'DB에 로또 데이터가 없습니다. 시딩을 먼저 실행해주세요.' },
        { status: 404 }
      )
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

    // 최근 10회차 당첨번호 추가
    const recentResults = dbResults.slice(-10).reverse().map(r => ({
      round: r.round,
      date: r.date,
      dayOfWeek: getDayOfWeek(r.date),
      numbers: [r.num1, r.num2, r.num3, r.num4, r.num5, r.num6].sort((a, b) => a - b),
      bonus: r.bonus,
      firstPrize: r.firstPrize ? Number(r.firstPrize) : 0,
      firstWinners: r.firstWinners || 0,
    }))

    // 최신 회차 정보
    const latestResult = dbResults[dbResults.length - 1]

    // 캐시 업데이트
    const responseData = {
      ...analysis,
      recentResults,
      latestDate: latestResult.date,
      latestDayOfWeek: getDayOfWeek(latestResult.date),
      totalRounds: dbResults.length,
      nextRound: analysis.latestRound + 1,
      totalResults: dbResults.length,
      patterns: {
        sumRange: { min: 21, max: 255, avg: 138 },
        oddEvenMostCommon: '3:3',
        highLowMostCommon: '3:3',
        consecutivePairsPercent: 60,
      },
      lastUpdate: new Date().toISOString(),
    }

    cachedResponse = responseData
    lastFetchTime = now

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
