import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import * as cheerio from 'cheerio'

const prisma = new PrismaClient()

interface PensionData {
  round: number
  date: string
  group: number
  numbers: number[]
}

async function fetchPensionData(round: number): Promise<PensionData | null> {
  try {
    const url = `https://dhlottery.co.kr/gameResult.do?method=win720&Round=${round}`

    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Referer': 'https://dhlottery.co.kr/',
      },
    })

    const $ = cheerio.load(response.data)

    // 날짜 추출 - "(2024-01-04 추첨)" 형식
    const dateText = $('body').text()
    const dateMatch = dateText.match(/\((\d{4}-\d{2}-\d{2})\s*추첨\)/)
    const date = dateMatch ? dateMatch[1] : ''

    // 1등 조 추출
    const groupText = $('.win720_num .group').first().text()
    const groupMatch = groupText.match(/(\d)/)
    const group = groupMatch ? parseInt(groupMatch[1]) : 0

    if (!group) {
      // 다른 방식으로 시도
      const altGroupMatch = $('body').text().match(/1등[\s\S]*?(\d)조/)
      if (altGroupMatch) {
        const altGroup = parseInt(altGroupMatch[1])
        if (altGroup >= 1 && altGroup <= 5) {
          // 번호 추출 시도
          const nums: number[] = []
          $('.win720_num .num').each((i, el) => {
            if (i < 6) {
              const num = parseInt($(el).text().trim())
              if (!isNaN(num)) nums.push(num)
            }
          })

          if (nums.length === 6) {
            return { round, date, group: altGroup, numbers: nums }
          }
        }
      }
      console.log(`  ${round}회차: 조 정보 없음`)
      return null
    }

    // 1등 번호 추출 (6자리)
    const numbers: number[] = []
    $('.win720_num .num.pension720').each((i, el) => {
      if (i < 6) {
        const num = parseInt($(el).text().trim())
        if (!isNaN(num)) numbers.push(num)
      }
    })

    // 다른 셀렉터로 시도
    if (numbers.length < 6) {
      $('.win720_num span.num').each((i, el) => {
        if (numbers.length < 6) {
          const num = parseInt($(el).text().trim())
          if (!isNaN(num) && num >= 0 && num <= 9) {
            numbers.push(num)
          }
        }
      })
    }

    if (numbers.length < 6) {
      console.log(`  ${round}회차: 번호 부족 (${numbers.length}개)`)
      return null
    }

    return { round, date, group, numbers: numbers.slice(0, 6) }
  } catch (error) {
    const err = error as Error
    if (err.message.includes('timeout')) {
      console.log(`  ${round}회차: 타임아웃`)
    } else {
      console.log(`  ${round}회차: 오류 - ${err.message.substring(0, 50)}`)
    }
    return null
  }
}

async function savePensionData(data: PensionData) {
  await prisma.pensionLotteryResult.upsert({
    where: { round: data.round },
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
      round: data.round,
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
}

async function main() {
  // 최신 회차 (2026년 1월 기준 약 297회차)
  const latestRound = 297

  console.log(`연금복권 720+ 크롤링 시작 (1~${latestRound}회차)`)
  console.log('=' .repeat(50))

  // 기존 데이터 삭제 (샘플 데이터 대체)
  await prisma.pensionLotteryResult.deleteMany({})
  console.log('기존 샘플 데이터 삭제 완료\n')

  let saved = 0
  let failed = 0

  for (let round = 1; round <= latestRound; round++) {
    const data = await fetchPensionData(round)

    if (data) {
      await savePensionData(data)
      saved++
      console.log(`  ${round}회차: ${data.group}조 ${data.numbers.join('')} (${data.date})`)
    } else {
      failed++
    }

    // 진행상황 표시
    if (round % 50 === 0) {
      console.log(`\n=== 진행: ${round}/${latestRound} (성공: ${saved}, 실패: ${failed}) ===\n`)
    }

    // 요청 간격 (서버 부하 방지)
    await new Promise(r => setTimeout(r, 500))
  }

  console.log('\n' + '='.repeat(50))
  console.log(`완료: ${saved}개 저장, ${failed}개 실패`)

  // 결과 확인
  const count = await prisma.pensionLotteryResult.count()
  const latest = await prisma.pensionLotteryResult.findFirst({
    orderBy: { round: 'desc' },
  })

  console.log(`\nDB 현황:`)
  console.log(`  총 회차: ${count}개`)
  if (latest) {
    console.log(`  최신: ${latest.round}회차 (${latest.date})`)
    console.log(`  번호: ${latest.group1}조 ${latest.num1_1}${latest.num1_2}${latest.num1_3}${latest.num1_4}${latest.num1_5}${latest.num1_6}`)
  }

  await prisma.$disconnect()
}

main().catch(console.error)
