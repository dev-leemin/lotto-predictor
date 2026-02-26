import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { analyzePensionCDM, PensionResultData } from '@/lib/cdm-predictor'

// 특정 회차 기준 연금복권 CDM 예측 조회
// GET /api/pension/history?round=290
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const targetRound = parseInt(searchParams.get('round') || '0')

    if (!targetRound || targetRound < 1 || targetRound > 10000) {
      return NextResponse.json(
        { error: '유효한 회차를 입력해주세요. (예: ?round=290)' },
        { status: 400 }
      )
    }

    // 해당 회차까지의 데이터만 조회 (해당 회차 제외 - 예측이므로)
    const dbResults = await prisma.pensionLotteryResult.findMany({
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
    const actualResult = await prisma.pensionLotteryResult.findUnique({
      where: { round: targetRound },
    })

    // CDM 분석 (해당 회차 직전까지의 데이터로)
    const results: PensionResultData[] = dbResults.map(r => ({
      round: r.round,
      group: r.group1,
      numbers: [r.num1_1, r.num1_2, r.num1_3, r.num1_4, r.num1_5, r.num1_6],
    }))

    const analysis = analyzePensionCDM(results)

    // 실제 당첨번호와 예측 비교
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
        actualGroup,
        actualNumbers,
        actualDate: actualResult.date,
        setMatches: setMatches.sort((a, b) => b.consecutiveFromEnd - a.consecutiveFromEnd),
        bestConsecutiveMatch: Math.max(...setMatches.map(s => s.consecutiveFromEnd)),
      }
    }

    // 자릿수별 예측 요약
    const digitSummary = analysis.digitPredictions.map((dp, idx) => ({
      position: idx + 1,
      top3: dp.slice(0, 3).map(p => ({
        digit: p.digit,
        cdmScore: Math.round(p.cdmScore * 100) / 100,
      })),
    }))

    return NextResponse.json({
      targetRound,
      analysisBasedOn: dbResults.length,
      lastDataRound: dbResults[dbResults.length - 1].round,
      groupPrediction: analysis.groupPrediction,
      digitSummary,
      recommendedSets: analysis.recommendedSets.map(set => ({
        ...set,
        numberString: set.numbers.join(''),
      })),
      matchInfo,
    })
  } catch (error) {
    console.error('Pension history API error:', error)
    return NextResponse.json(
      { error: '조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 연금복권 등수 판정 (뒤에서부터 연속 일치 기준)
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
