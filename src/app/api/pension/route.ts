import { NextResponse } from 'next/server'
import { fetchRecentPensionResults, getLatestPensionRound } from '@/lib/pension-scraper'
import { analyzePension } from '@/lib/pension-analyzer'

// 캐시 (서버 메모리)
let cachedAnalysis: ReturnType<typeof analyzePension> | null = null
let lastFetchTime = 0
const CACHE_DURATION = 1000 * 60 * 30 // 30분

export async function GET() {
  try {
    const now = Date.now()

    // 캐시된 데이터가 있고 30분 이내면 재사용
    if (cachedAnalysis && now - lastFetchTime < CACHE_DURATION) {
      return NextResponse.json({
        ...cachedAnalysis,
        cached: true,
        nextRound: await getLatestPensionRound() + 1,
      })
    }

    // 최근 50회차 데이터 가져오기 (속도 개선)
    const results = await fetchRecentPensionResults(50)

    if (results.length === 0) {
      return NextResponse.json(
        { error: '연금복권 데이터를 가져올 수 없습니다.' },
        { status: 500 }
      )
    }

    // 분석 실행
    const analysis = analyzePension(results)

    // 캐시 업데이트
    cachedAnalysis = analysis
    lastFetchTime = now

    const latestRound = results[results.length - 1].round

    return NextResponse.json({
      ...analysis,
      cached: false,
      latestRound,
      nextRound: latestRound + 1,
      totalResults: results.length,
    })
  } catch (error) {
    console.error('Pension API error:', error)
    return NextResponse.json(
      { error: '분석 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
