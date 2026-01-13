/**
 * 로또 및 연금복권 역대 당첨번호 시딩 스크립트
 *
 * 실행: npx tsx scripts/seed-lottery-data.ts
 */

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

async function fetchLottoFromApi(round: number): Promise<LottoApiResponse | null> {
  try {
    const response = await axios.get<LottoApiResponse>(
      `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`,
      {
        timeout: 10000,
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

function getLatestLottoRound(): number {
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

async function seedLottoData(): Promise<{ total: number; errors: number }> {
  const latestRound = getLatestLottoRound()
  let total = 0
  let errors = 0

  console.log(`\n========== 로또 6/45 데이터 시딩 ==========`)
  console.log(`대상: 1회차 ~ ${latestRound}회차`)

  const batchSize = 10

  for (let start = 1; start <= latestRound; start += batchSize) {
    const end = Math.min(start + batchSize - 1, latestRound)
    const promises: Promise<void>[] = []

    for (let round = start; round <= end; round++) {
      promises.push(
        (async () => {
          try {
            const existing = await prisma.lottoResult.findUnique({ where: { round } })
            if (existing) return

            const data = await fetchLottoFromApi(round)
            if (data) {
              await prisma.lottoResult.create({
                data: {
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
              total++
            } else {
              errors++
            }
          } catch (e) {
            errors++
          }
        })()
      )
    }

    await Promise.all(promises)

    // 진행 상황 출력 (50회차마다)
    if (start % 50 === 1 || end === latestRound) {
      const progress = Math.round((end / latestRound) * 100)
      console.log(`  진행: ${end}/${latestRound} (${progress}%) - 저장: ${total}, 실패: ${errors}`)
    }

    // API 부하 방지
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  console.log(`\n로또 시딩 완료: ${total}개 저장, ${errors}개 실패`)
  return { total, errors }
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

async function fetchPensionLotteryFromWeb(round: number): Promise<PensionLotteryData | null> {
  try {
    // 동행복권 연금복권 페이지 크롤링
    const response = await axios.get(
      `https://www.dhlottery.co.kr/gameResult.do?method=win720&Round=${round}`,
      {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml',
        },
      }
    )

    const html = response.data as string

    // 1등 당첨번호 파싱
    // 조 추출
    const groupMatch = html.match(/1등<\/strong>[\s\S]*?<span class="num large">(\d+)조/i)
    if (!groupMatch) {
      // 다른 패턴 시도
      const altGroupMatch = html.match(/<span class="num">(\d+)조<\/span>/i)
      if (!altGroupMatch) return null
    }

    const group1 = groupMatch ? parseInt(groupMatch[1]) : 1

    // 6자리 숫자 추출
    const numberMatches = html.match(/<span class="num"[^>]*>(\d)<\/span>/g)
    if (!numberMatches || numberMatches.length < 6) return null

    const numbers: number[] = []
    for (let i = 0; i < 6 && i < numberMatches.length; i++) {
      const numMatch = numberMatches[i].match(/>(\d)<\/span>/)
      if (numMatch) {
        numbers.push(parseInt(numMatch[1]))
      }
    }

    if (numbers.length < 6) return null

    // 추첨일 추출
    const dateMatch = html.match(/\((\d{4}-\d{2}-\d{2})\s*추첨\)/)
    const date = dateMatch ? dateMatch[1] : ''

    return {
      round,
      date,
      group1,
      numbers,
    }
  } catch {
    return null
  }
}

// 연금복권 API 시도 (있다면)
async function fetchPensionFromApi(round: number): Promise<PensionLotteryData | null> {
  try {
    const response = await axios.get(
      `https://www.dhlottery.co.kr/common.do?method=get720Number&Round=${round}`,
      {
        timeout: 8000,
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      }
    )

    const data = response.data
    if (data && data.returnValue === 'success') {
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
      }
    }
  } catch {
    // API 실패 시 웹 크롤링으로 폴백
  }

  return fetchPensionLotteryFromWeb(round)
}

function getLatestPensionRound(): number {
  // 연금복권 720+ 는 2020년 4월 2일 1회차 시작, 매주 목요일 추첨
  const startDate = new Date('2020-04-02')
  const now = new Date()
  const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  const diffDays = Math.floor((koreaTime.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  let estimatedRound = Math.floor(diffDays / 7) + 1

  const dayOfWeek = koreaTime.getUTCDay()
  const hour = koreaTime.getUTCHours()
  if (dayOfWeek === 4 && hour < 11) {
    estimatedRound -= 1
  }

  return estimatedRound
}

async function seedPensionData(): Promise<{ total: number; errors: number }> {
  const latestRound = getLatestPensionRound()
  let total = 0
  let errors = 0

  console.log(`\n========== 연금복권 720+ 데이터 시딩 ==========`)
  console.log(`대상: 1회차 ~ ${latestRound}회차`)

  for (let round = 1; round <= latestRound; round++) {
    try {
      const existing = await prisma.pensionLotteryResult.findUnique({ where: { round } })
      if (existing) continue

      const data = await fetchPensionFromApi(round)
      if (data && data.numbers.length === 6) {
        await prisma.pensionLotteryResult.create({
          data: {
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
        total++
      } else {
        errors++
      }
    } catch {
      errors++
    }

    // 진행 상황 출력 (20회차마다)
    if (round % 20 === 0 || round === latestRound) {
      const progress = Math.round((round / latestRound) * 100)
      console.log(`  진행: ${round}/${latestRound} (${progress}%) - 저장: ${total}, 실패: ${errors}`)
    }

    // API 부하 방지
    await new Promise(resolve => setTimeout(resolve, 250))
  }

  console.log(`\n연금복권 시딩 완료: ${total}개 저장, ${errors}개 실패`)
  return { total, errors }
}

// ==================== 메인 실행 ====================

async function main() {
  console.log('====================================')
  console.log('로또 예측기 - 데이터 시딩 시작')
  console.log('====================================')
  console.log(`시작 시간: ${new Date().toLocaleString('ko-KR')}`)

  try {
    // 로또 데이터 시딩
    const lottoResult = await seedLottoData()

    // 연금복권 데이터 시딩
    const pensionResult = await seedPensionData()

    console.log('\n====================================')
    console.log('시딩 완료 요약')
    console.log('====================================')
    console.log(`로또 6/45: ${lottoResult.total}개 저장, ${lottoResult.errors}개 실패`)
    console.log(`연금복권 720+: ${pensionResult.total}개 저장, ${pensionResult.errors}개 실패`)
    console.log(`완료 시간: ${new Date().toLocaleString('ko-KR')}`)
  } catch (error) {
    console.error('시딩 중 오류 발생:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
