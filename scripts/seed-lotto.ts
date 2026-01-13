// 로또 데이터 시드 스크립트 - 1회차부터 최신 회차까지 DB에 저장
import { PrismaClient } from '@prisma/client'
import axios from 'axios'

const prisma = new PrismaClient()

// 동행복권 API에서 로또 데이터 가져오기
async function fetchLottoResult(round: number): Promise<{
  round: number
  date: string
  numbers: number[]
  bonus: number
  firstPrize: number
  firstWinners: number
} | null> {
  const url = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      })

      const data = response.data

      if (data.returnValue !== 'success') {
        return null
      }

      return {
        round: data.drwNo,
        date: data.drwNoDate,
        numbers: [
          data.drwtNo1,
          data.drwtNo2,
          data.drwtNo3,
          data.drwtNo4,
          data.drwtNo5,
          data.drwtNo6,
        ].sort((a, b) => a - b),
        bonus: data.bnusNo,
        firstPrize: data.firstWinamnt || 0,
        firstWinners: data.firstPrzwnerCo || 0,
      }
    } catch (error) {
      if (attempt === 3) {
        console.error(`Failed to fetch round ${round} after 3 attempts`)
        return null
      }
      await new Promise(resolve => setTimeout(resolve, 500 * attempt))
    }
  }
  return null
}

// 최신 회차 계산
function getEstimatedLatestRound(): number {
  const startDate = new Date('2002-12-07')
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  return Math.floor(diffDays / 7) + 1
}

async function main() {
  console.log('🎱 로또 데이터 시드 시작...\n')

  // DB에서 가장 최신 저장된 회차 확인
  const latestInDb = await prisma.lottoResult.findFirst({
    orderBy: { round: 'desc' },
  })

  const startRound = latestInDb ? latestInDb.round + 1 : 1
  const estimatedLatestRound = getEstimatedLatestRound()

  console.log(`DB 최신 회차: ${latestInDb?.round || '없음'}`)
  console.log(`예상 최신 회차: ${estimatedLatestRound}`)
  console.log(`가져올 회차: ${startRound} ~ ${estimatedLatestRound}\n`)

  if (startRound > estimatedLatestRound) {
    console.log('✅ 이미 최신 데이터입니다.')
    await prisma.$disconnect()
    return
  }

  let successCount = 0
  let failCount = 0
  const batchSize = 10 // 동시 요청 수

  for (let i = startRound; i <= estimatedLatestRound; i += batchSize) {
    const batch: number[] = []
    for (let j = i; j < Math.min(i + batchSize, estimatedLatestRound + 1); j++) {
      batch.push(j)
    }

    console.log(`📥 ${i}~${Math.min(i + batchSize - 1, estimatedLatestRound)}회차 가져오는 중...`)

    const results = await Promise.all(batch.map(round => fetchLottoResult(round)))

    for (const result of results) {
      if (result) {
        try {
          await prisma.lottoResult.upsert({
            where: { round: result.round },
            update: {
              date: result.date,
              num1: result.numbers[0],
              num2: result.numbers[1],
              num3: result.numbers[2],
              num4: result.numbers[3],
              num5: result.numbers[4],
              num6: result.numbers[5],
              bonus: result.bonus,
              firstPrize: BigInt(result.firstPrize),
              firstWinners: result.firstWinners,
            },
            create: {
              round: result.round,
              date: result.date,
              num1: result.numbers[0],
              num2: result.numbers[1],
              num3: result.numbers[2],
              num4: result.numbers[3],
              num5: result.numbers[4],
              num6: result.numbers[5],
              bonus: result.bonus,
              firstPrize: BigInt(result.firstPrize),
              firstWinners: result.firstWinners,
            },
          })
          successCount++
        } catch (err) {
          console.error(`DB 저장 실패 (${result.round}회차):`, err)
          failCount++
        }
      } else {
        failCount++
      }
    }

    // API 부하 방지
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  console.log(`\n✅ 완료: ${successCount}개 저장, ${failCount}개 실패`)

  // 최종 통계
  const totalCount = await prisma.lottoResult.count()
  const latest = await prisma.lottoResult.findFirst({ orderBy: { round: 'desc' } })

  console.log(`\n📊 DB 통계:`)
  console.log(`   총 회차: ${totalCount}개`)
  console.log(`   최신 회차: ${latest?.round}회 (${latest?.date})`)

  await prisma.$disconnect()
}

main().catch(console.error)
