/**
 * 동행복권 API를 통해 최신 로또/연금복권 데이터를 가져오는 유틸리티
 *
 * 새 API 엔드포인트 사용:
 * - 로또: https://www.dhlottery.co.kr/lt645/selectPstLt645Info.do
 * - 연금복권: https://www.dhlottery.co.kr/pt720/selectPstPt720Info.do
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface LottoAPIResult {
  ltEpsd: number        // 회차
  ltRflYmd: string      // 추첨일 (YYYYMMDD)
  tm1WnNo: number       // 1번째 당첨번호
  tm2WnNo: number       // 2번째 당첨번호
  tm3WnNo: number       // 3번째 당첨번호
  tm4WnNo: number       // 4번째 당첨번호
  tm5WnNo: number       // 5번째 당첨번호
  tm6WnNo: number       // 6번째 당첨번호
  bnsWnNo: number       // 보너스 번호
  rnk1WnAmt: number     // 1등 당첨금
  rnk1WnNope: number    // 1등 당첨자수
}

interface PensionAPIResult {
  psltEpsd: number      // 회차
  psltRflYmd: string    // 추첨일 (YYYYMMDD)
  wnBndNo: string | null // 조 (1등만 있음)
  wnRnkVl: string       // 당첨번호 (6자리)
  wnSqNo: number        // 등수
}

// 날짜 포맷 변환 (YYYYMMDD -> YYYY-MM-DD)
function formatDate(yyyymmdd: string): string {
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`
}

// 로또 여러 회차 데이터 가져오기
export async function fetchLottoResults(startRound: number, endRound: number): Promise<LottoAPIResult[]> {
  try {
    const res = await fetch(
      `https://www.dhlottery.co.kr/lt645/selectPstLt645Info.do?srchStrLtEpsd=${startRound}&srchEndLtEpsd=${endRound}`,
      {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
        },
      }
    )

    if (!res.ok) return []

    const data = await res.json()
    return data.data?.list || []
  } catch (error) {
    console.error(`Failed to fetch lotto rounds ${startRound}-${endRound}:`, error)
    return []
  }
}

// 로또 DB 업데이트 (최신 데이터 자동 추가)
export async function updateLottoDB(): Promise<{ updated: number; latest: number }> {
  try {
    // DB에서 가장 최신 회차 확인
    const dbLatest = await prisma.lottoResult.findFirst({
      orderBy: { round: 'desc' },
    })
    const dbLatestRound = dbLatest?.round || 0

    // 새 데이터 가져오기 (최대 10회차까지 확인)
    const results = await fetchLottoResults(dbLatestRound + 1, dbLatestRound + 10)

    if (results.length === 0) {
      return { updated: 0, latest: dbLatestRound }
    }

    // DB에 저장
    let updated = 0
    let latestRound = dbLatestRound

    for (const r of results) {
      await prisma.lottoResult.upsert({
        where: { round: r.ltEpsd },
        update: {
          date: formatDate(r.ltRflYmd),
          num1: r.tm1WnNo,
          num2: r.tm2WnNo,
          num3: r.tm3WnNo,
          num4: r.tm4WnNo,
          num5: r.tm5WnNo,
          num6: r.tm6WnNo,
          bonus: r.bnsWnNo,
          firstPrize: BigInt(r.rnk1WnAmt || 0),
          firstWinners: r.rnk1WnNope || 0,
        },
        create: {
          round: r.ltEpsd,
          date: formatDate(r.ltRflYmd),
          num1: r.tm1WnNo,
          num2: r.tm2WnNo,
          num3: r.tm3WnNo,
          num4: r.tm4WnNo,
          num5: r.tm5WnNo,
          num6: r.tm6WnNo,
          bonus: r.bnsWnNo,
          firstPrize: BigInt(r.rnk1WnAmt || 0),
          firstWinners: r.rnk1WnNope || 0,
        },
      })

      console.log(`Lotto round ${r.ltEpsd} saved (${formatDate(r.ltRflYmd)})`)
      updated++
      if (r.ltEpsd > latestRound) latestRound = r.ltEpsd
    }

    return { updated, latest: latestRound }
  } catch (error) {
    console.error('Failed to update lotto DB:', error)
    return { updated: 0, latest: 0 }
  }
}

// 연금복권 여러 회차 데이터 가져오기
export async function fetchPensionResults(startRound: number, endRound: number): Promise<Map<number, { date: string; group: number; numbers: number[] }>> {
  try {
    const res = await fetch(
      `https://www.dhlottery.co.kr/pt720/selectPstPt720Info.do?srchStrLtEpsd=${startRound}&srchEndLtEpsd=${endRound}`,
      {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
        },
      }
    )

    if (!res.ok) return new Map()

    const data = await res.json()
    const results: PensionAPIResult[] = data.data?.result || []

    // 1등 데이터만 추출 (wnSqNo === 1)
    const roundMap = new Map<number, { date: string; group: number; numbers: number[] }>()

    for (const r of results) {
      if (r.wnSqNo === 1 && r.wnBndNo) {
        const numbers = r.wnRnkVl.split('').map(Number)
        roundMap.set(r.psltEpsd, {
          date: formatDate(r.psltRflYmd),
          group: parseInt(r.wnBndNo),
          numbers,
        })
      }
    }

    return roundMap
  } catch (error) {
    console.error(`Failed to fetch pension rounds ${startRound}-${endRound}:`, error)
    return new Map()
  }
}

// 연금복권 DB 업데이트 (최신 데이터 자동 추가)
export async function updatePensionDB(): Promise<{ updated: number; latest: number }> {
  try {
    // DB에서 가장 최신 회차 확인
    const dbLatest = await prisma.pensionLotteryResult.findFirst({
      orderBy: { round: 'desc' },
    })
    const dbLatestRound = dbLatest?.round || 0

    // 새 데이터 가져오기 (최대 10회차까지 확인)
    const results = await fetchPensionResults(dbLatestRound + 1, dbLatestRound + 10)

    if (results.size === 0) {
      return { updated: 0, latest: dbLatestRound }
    }

    // DB에 저장
    let updated = 0
    let latestRound = dbLatestRound

    for (const [round, data] of results) {
      await prisma.pensionLotteryResult.upsert({
        where: { round },
        update: {
          date: data.date,
          group1: data.group,
          num1_1: data.numbers[0],
          num1_2: data.numbers[1],
          num1_3: data.numbers[2],
          num1_4: data.numbers[3],
          num1_5: data.numbers[4],
          num1_6: data.numbers[5],
        },
        create: {
          round,
          date: data.date,
          group1: data.group,
          num1_1: data.numbers[0],
          num1_2: data.numbers[1],
          num1_3: data.numbers[2],
          num1_4: data.numbers[3],
          num1_5: data.numbers[4],
          num1_6: data.numbers[5],
        },
      })

      console.log(`Pension round ${round} saved (${data.date}): ${data.group}조 ${data.numbers.join('')}`)
      updated++
      if (round > latestRound) latestRound = round
    }

    return { updated, latest: latestRound }
  } catch (error) {
    console.error('Failed to update pension DB:', error)
    return { updated: 0, latest: 0 }
  }
}

// 둘 다 업데이트
export async function updateAllLotteryDB() {
  const lotto = await updateLottoDB()
  const pension = await updatePensionDB()

  await prisma.$disconnect()

  return { lotto, pension }
}
