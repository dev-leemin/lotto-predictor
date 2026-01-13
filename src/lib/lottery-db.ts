import { PrismaClient } from '@prisma/client'
import axios from 'axios'

const prisma = new PrismaClient()

// ==================== 로또 6/45 ====================

interface LottoApiResponse {
  returnValue: string
  drwNo: number
  drwNoDate: string
  drwtNo1: number
  drwtNo2: number
  drwtNo3: number
  drwtNo4: number
  drwtNo5: number
  drwtNo6: number
  bnusNo: number
  firstWinamnt: number
  firstPrzwnerCo: number
}

// 로또 API에서 단일 회차 가져오기
export async function fetchLottoFromApi(round: number): Promise<LottoApiResponse | null> {
  try {
    const response = await axios.get<LottoApiResponse>(
      `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`,
      {
        timeout: 8000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    )
    if (response.data.returnValue === 'success') {
      return response.data
    }
    return null
  } catch {
    return null
  }
}

// 최신 로또 회차 계산
export function getLatestLottoRound(): number {
  const startDate = new Date('2002-12-07')
  const now = new Date()
  const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  const diffDays = Math.floor((koreaTime.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  let estimatedRound = Math.floor(diffDays / 7) + 1

  const dayOfWeek = koreaTime.getUTCDay()
  const hour = koreaTime.getUTCHours()
  if (dayOfWeek === 6 && hour < 12) {
    estimatedRound -= 1
  }

  return estimatedRound
}

// DB에서 마지막 저장된 로또 회차 가져오기
export async function getLastSavedLottoRound(): Promise<number> {
  const last = await prisma.lottoResult.findFirst({
    orderBy: { round: 'desc' },
    select: { round: true },
  })
  return last?.round || 0
}

// DB에 로또 결과 저장
export async function saveLottoResult(data: LottoApiResponse) {
  await prisma.lottoResult.upsert({
    where: { round: data.drwNo },
    update: {
      date: data.drwNoDate,
      num1: data.drwtNo1,
      num2: data.drwtNo2,
      num3: data.drwtNo3,
      num4: data.drwtNo4,
      num5: data.drwtNo5,
      num6: data.drwtNo6,
      bonus: data.bnusNo,
      firstPrize: BigInt(data.firstWinamnt || 0),
      firstWinners: data.firstPrzwnerCo || 0,
    },
    create: {
      round: data.drwNo,
      date: data.drwNoDate,
      num1: data.drwtNo1,
      num2: data.drwtNo2,
      num3: data.drwtNo3,
      num4: data.drwtNo4,
      num5: data.drwtNo5,
      num6: data.drwtNo6,
      bonus: data.bnusNo,
      firstPrize: BigInt(data.firstWinamnt || 0),
      firstWinners: data.firstPrzwnerCo || 0,
    },
  })
}

// 빈 회차만 크롤링하여 DB에 저장 (증분 업데이트)
export async function syncLottoResults(): Promise<{ synced: number; latest: number }> {
  const lastSaved = await getLastSavedLottoRound()
  const latestRound = getLatestLottoRound()

  let syncedCount = 0

  // 1회차부터 최신까지 빈 회차 확인 및 저장
  const batchSize = 10

  for (let start = lastSaved + 1; start <= latestRound; start += batchSize) {
    const end = Math.min(start + batchSize - 1, latestRound)
    const promises: Promise<void>[] = []

    for (let round = start; round <= end; round++) {
      promises.push(
        (async () => {
          const data = await fetchLottoFromApi(round)
          if (data) {
            await saveLottoResult(data)
            syncedCount++
          }
        })()
      )
    }

    await Promise.all(promises)

    // API 부하 방지
    if (end < latestRound) {
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  }

  return { synced: syncedCount, latest: latestRound }
}

// 전체 로또 결과 조회
export async function getAllLottoResults() {
  return prisma.lottoResult.findMany({
    orderBy: { round: 'asc' },
  })
}

// ==================== 연금복권 720+ ====================

interface PensionLotteryData {
  round: number
  date: string
  group1: number
  numbers: number[]
  bonusGroup?: number
  bonusNumbers?: number[]
}

// 연금복권 API/크롤링으로 데이터 가져오기
export async function fetchPensionLotteryFromApi(round: number): Promise<PensionLotteryData | null> {
  try {
    // 동행복권 연금복권 API
    const response = await axios.get(
      `https://www.dhlottery.co.kr/common.do?method=get720Number&Round=${round}`,
      {
        timeout: 8000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    )

    const data = response.data
    if (!data || data.returnValue !== 'success') {
      return null
    }

    return {
      round: data.round || round,
      date: data.drwNoDate || '',
      group1: parseInt(data.pensionGroup || '1'),
      numbers: [
        parseInt(data.pensionNum1 || '0'),
        parseInt(data.pensionNum2 || '0'),
        parseInt(data.pensionNum3 || '0'),
        parseInt(data.pensionNum4 || '0'),
        parseInt(data.pensionNum5 || '0'),
        parseInt(data.pensionNum6 || '0'),
      ],
      bonusGroup: data.bonusGroup ? parseInt(data.bonusGroup) : undefined,
      bonusNumbers: data.bonusNum1 ? [
        parseInt(data.bonusNum1),
        parseInt(data.bonusNum2),
        parseInt(data.bonusNum3),
        parseInt(data.bonusNum4),
        parseInt(data.bonusNum5),
        parseInt(data.bonusNum6),
      ] : undefined,
    }
  } catch {
    // API가 없을 경우 웹 크롤링으로 시도
    return fetchPensionLotteryByCrawling(round)
  }
}

// 웹 크롤링으로 연금복권 데이터 가져오기
async function fetchPensionLotteryByCrawling(round: number): Promise<PensionLotteryData | null> {
  try {
    const response = await axios.get(
      `https://www.dhlottery.co.kr/gameResult.do?method=win720`,
      {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        params: { Round: round },
      }
    )

    const html = response.data
    // HTML 파싱하여 당첨번호 추출
    const groupMatch = html.match(/1등<\/strong>[\s\S]*?<span class="num">(\d+)조/)
    const numbersMatch = html.match(/class="num pension720">(\d)<\/span>/g)
    const dateMatch = html.match(/\((\d{4}-\d{2}-\d{2})\s*추첨\)/)

    if (!groupMatch || !numbersMatch || numbersMatch.length < 6) {
      return null
    }

    const numbers = numbersMatch.slice(0, 6).map((m: string) => {
      const num = m.match(/(\d)<\/span>/)
      return num ? parseInt(num[1]) : 0
    })

    return {
      round,
      date: dateMatch ? dateMatch[1] : '',
      group1: parseInt(groupMatch[1]),
      numbers,
    }
  } catch {
    return null
  }
}

// 최신 연금복권 회차 계산 (2020년 4월 2일 1회차 시작, 매주 목요일)
export function getLatestPensionRound(): number {
  const startDate = new Date('2020-04-02')
  const now = new Date()
  const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  const diffDays = Math.floor((koreaTime.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  let estimatedRound = Math.floor(diffDays / 7) + 1

  // 목요일 저녁 8시 이후 추첨
  const dayOfWeek = koreaTime.getUTCDay()
  const hour = koreaTime.getUTCHours()
  if (dayOfWeek === 4 && hour < 11) { // 목요일 20시 전 (UTC 11시)
    estimatedRound -= 1
  }

  return estimatedRound
}

// DB에서 마지막 저장된 연금복권 회차
export async function getLastSavedPensionRound(): Promise<number> {
  const last = await prisma.pensionLotteryResult.findFirst({
    orderBy: { round: 'desc' },
    select: { round: true },
  })
  return last?.round || 0
}

// 연금복권 결과 저장
export async function savePensionResult(data: PensionLotteryData) {
  await prisma.pensionLotteryResult.upsert({
    where: { round: data.round },
    update: {
      date: data.date,
      group1: data.group1,
      num1_1: data.numbers[0],
      num1_2: data.numbers[1],
      num1_3: data.numbers[2],
      num1_4: data.numbers[3],
      num1_5: data.numbers[4],
      num1_6: data.numbers[5],
      bonusGroup: data.bonusGroup || null,
      bonus1: data.bonusNumbers?.[0] || null,
      bonus2: data.bonusNumbers?.[1] || null,
      bonus3: data.bonusNumbers?.[2] || null,
      bonus4: data.bonusNumbers?.[3] || null,
      bonus5: data.bonusNumbers?.[4] || null,
      bonus6: data.bonusNumbers?.[5] || null,
    },
    create: {
      round: data.round,
      date: data.date,
      group1: data.group1,
      num1_1: data.numbers[0],
      num1_2: data.numbers[1],
      num1_3: data.numbers[2],
      num1_4: data.numbers[3],
      num1_5: data.numbers[4],
      num1_6: data.numbers[5],
      bonusGroup: data.bonusGroup || null,
      bonus1: data.bonusNumbers?.[0] || null,
      bonus2: data.bonusNumbers?.[1] || null,
      bonus3: data.bonusNumbers?.[2] || null,
      bonus4: data.bonusNumbers?.[3] || null,
      bonus5: data.bonusNumbers?.[4] || null,
      bonus6: data.bonusNumbers?.[5] || null,
    },
  })
}

// 연금복권 증분 동기화
export async function syncPensionResults(): Promise<{ synced: number; latest: number }> {
  const lastSaved = await getLastSavedPensionRound()
  const latestRound = getLatestPensionRound()

  let syncedCount = 0

  for (let round = lastSaved + 1; round <= latestRound; round++) {
    const data = await fetchPensionLotteryFromApi(round)
    if (data) {
      await savePensionResult(data)
      syncedCount++
    }
    // API 부하 방지
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  return { synced: syncedCount, latest: latestRound }
}

// 전체 연금복권 결과 조회
export async function getAllPensionResults() {
  return prisma.pensionLotteryResult.findMany({
    orderBy: { round: 'asc' },
  })
}

// ==================== 초기 데이터 시딩 ====================

// 1회차부터 전체 로또 데이터 시딩
export async function seedAllLottoData(): Promise<{ total: number; errors: number }> {
  const latestRound = getLatestLottoRound()
  let total = 0
  let errors = 0

  console.log(`로또 데이터 시딩 시작: 1회차 ~ ${latestRound}회차`)

  const batchSize = 10

  for (let start = 1; start <= latestRound; start += batchSize) {
    const end = Math.min(start + batchSize - 1, latestRound)
    const promises: Promise<void>[] = []

    for (let round = start; round <= end; round++) {
      promises.push(
        (async () => {
          try {
            const existing = await prisma.lottoResult.findUnique({ where: { round } })
            if (!existing) {
              const data = await fetchLottoFromApi(round)
              if (data) {
                await saveLottoResult(data)
                total++
              } else {
                errors++
              }
            }
          } catch {
            errors++
          }
        })()
      )
    }

    await Promise.all(promises)

    if (start % 100 === 1) {
      console.log(`진행: ${start}/${latestRound} 완료`)
    }

    await new Promise(resolve => setTimeout(resolve, 300))
  }

  console.log(`로또 시딩 완료: ${total}개 저장, ${errors}개 실패`)
  return { total, errors }
}

// 연금복권 전체 시딩
export async function seedAllPensionData(): Promise<{ total: number; errors: number }> {
  const latestRound = getLatestPensionRound()
  let total = 0
  let errors = 0

  console.log(`연금복권 데이터 시딩 시작: 1회차 ~ ${latestRound}회차`)

  for (let round = 1; round <= latestRound; round++) {
    try {
      const existing = await prisma.pensionLotteryResult.findUnique({ where: { round } })
      if (!existing) {
        const data = await fetchPensionLotteryFromApi(round)
        if (data) {
          await savePensionResult(data)
          total++
        } else {
          errors++
        }
      }
    } catch {
      errors++
    }

    if (round % 50 === 0) {
      console.log(`진행: ${round}/${latestRound} 완료`)
    }

    await new Promise(resolve => setTimeout(resolve, 200))
  }

  console.log(`연금복권 시딩 완료: ${total}개 저장, ${errors}개 실패`)
  return { total, errors }
}
