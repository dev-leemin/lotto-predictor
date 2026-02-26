import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { analyzeLottoCDM, LottoResultData } from '@/lib/cdm-predictor'

// 특정 회차 기준 CDM 예측 조회
// GET /api/lotto/history?round=1200
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const targetRound = parseInt(searchParams.get('round') || '0')

    if (!targetRound || targetRound < 1 || targetRound > 10000) {
      return NextResponse.json(
        { error: '유효한 회차를 입력해주세요. (예: ?round=1200)' },
        { status: 400 }
      )
    }

    // 해당 회차까지의 데이터만 조회 (해당 회차 제외 - 예측이므로)
    const dbResults = await prisma.lottoResult.findMany({
      where: { round: { lt: targetRound } },
      orderBy: { round: 'asc' },
    })

    if (dbResults.length < 10) {
      return NextResponse.json(
        { error: `${targetRound}회차 이전 데이터가 충분하지 않습니다. (최소 10회차 필요)` },
        { status: 400 }
      )
    }

    // 해당 회차의 실제 당첨번호 조회
    const actualResult = await prisma.lottoResult.findUnique({
      where: { round: targetRound },
    })

    // CDM 분석 (해당 회차 직전까지의 데이터로)
    const results: LottoResultData[] = dbResults.map(r => ({
      round: r.round,
      numbers: [r.num1, r.num2, r.num3, r.num4, r.num5, r.num6].sort((a, b) => a - b),
      bonus: r.bonus,
    }))

    const analysis = analyzeLottoCDM(results)

    // 실제 당첨번호와 예측 비교
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
        actualNumbers,
        actualBonus: actualResult.bonus,
        actualDate: actualResult.date,
        top15Matched: matchedInTop15.length,
        top15MatchedNumbers: matchedInTop15,
        setMatches: setMatches.sort((a, b) => b.matched - a.matched),
        bestSetMatch: Math.max(...setMatches.map(s => s.matched)),
      }
    }

    return NextResponse.json({
      targetRound,
      analysisBasedOn: dbResults.length,
      lastDataRound: dbResults[dbResults.length - 1].round,
      rankedNumbers: analysis.rankedNumbers,
      recommendedSets: analysis.recommendedSets,
      matchInfo,
      modelInfo: analysis.modelInfo,
    })
  } catch (error) {
    console.error('Lotto history API error:', error)
    return NextResponse.json(
      { error: '조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
