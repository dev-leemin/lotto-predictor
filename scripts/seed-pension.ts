import { PrismaClient } from '@prisma/client'
import axios from 'axios'

const prisma = new PrismaClient()

interface PensionLotteryData {
  round: number
  date: string
  group1: number
  numbers: number[]
  bonusGroup?: number
  bonusNumbers?: number[]
}

// 최신 연금복권 회차 계산 (2020년 4월 2일 1회차 시작, 매주 목요일)
function getLatestPensionRound(): number {
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

// 웹 크롤링으로 연금복권 데이터 가져오기
async function fetchPensionLotteryByCrawling(round: number): Promise<PensionLotteryData | null> {
  try {
    const response = await axios.get(
      `https://www.dhlottery.co.kr/gameResult.do?method=win720`,
      {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        params: { Round: round },
      }
    )

    const html = response.data

    // 1등 조 추출
    const groupMatch = html.match(/1등<\/strong>[\s\S]*?<span class="num">(\d+)조/)
    if (!groupMatch) {
      console.log(`  ${round}회차: 조 정보 없음`)
      return null
    }

    // 1등 번호 추출 (6자리)
    const numbersMatch = html.match(/class="num pension720">(\d)<\/span>/g)
    if (!numbersMatch || numbersMatch.length < 6) {
      console.log(`  ${round}회차: 번호 정보 부족 (${numbersMatch?.length || 0}개)`)
      return null
    }

    // 날짜 추출
    const dateMatch = html.match(/\((\d{4}-\d{2}-\d{2})\s*추첨\)/)

    const numbers = numbersMatch.slice(0, 6).map((m: string) => {
      const num = m.match(/>(\d)</)
      return num ? parseInt(num[1]) : 0
    })

    return {
      round,
      date: dateMatch ? dateMatch[1] : '',
      group1: parseInt(groupMatch[1]),
      numbers,
    }
  } catch (error) {
    console.log(`  ${round}회차: 크롤링 실패 -`, (error as Error).message)
    return null
  }
}

// 연금복권 결과 저장
async function savePensionResult(data: PensionLotteryData) {
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

async function main() {
  const latestRound = getLatestPensionRound()
  let total = 0
  let errors = 0

  console.log(`연금복권 데이터 크롤링 시작: 1회차 ~ ${latestRound}회차`)

  for (let round = 1; round <= latestRound; round++) {
    try {
      const existing = await prisma.pensionLotteryResult.findUnique({ where: { round } })
      if (!existing) {
        const data = await fetchPensionLotteryByCrawling(round)
        if (data) {
          await savePensionResult(data)
          total++
          console.log(`  ${round}회차 저장 완료 (${data.group1}조 ${data.numbers.join('')})`)
        } else {
          errors++
        }
      } else {
        console.log(`  ${round}회차 이미 존재`)
      }
    } catch (error) {
      console.log(`  ${round}회차 오류:`, (error as Error).message)
      errors++
    }

    if (round % 50 === 0) {
      console.log(`\n=== 진행: ${round}/${latestRound} (${total}개 저장, ${errors}개 실패) ===\n`)
    }

    // API 부하 방지
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  console.log(`\n연금복권 크롤링 완료: ${total}개 저장, ${errors}개 실패`)
  await prisma.$disconnect()
}

main().catch(console.error)
