import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'
import * as path from 'path'
import * as os from 'os'

const prisma = new PrismaClient()

async function main() {
  // 엑셀 파일 경로
  const filePath = path.join(os.homedir(), 'Downloads', '연금720+ 회차별 당첨번호_20260114004239.xlsx')

  console.log('엑셀 파일 읽는 중:', filePath)

  // 엑셀 파일 읽기
  const workbook = XLSX.readFile(filePath)
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]

  // JSON으로 변환
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (string | number)[][]

  console.log('총 행 수:', data.length)
  console.log('첫 5행:', data.slice(0, 5))

  // 기존 데이터 삭제
  await prisma.pensionLotteryResult.deleteMany({})
  console.log('\n기존 데이터 삭제 완료')

  let saved = 0
  let skipped = 0

  // 헤더 행 스킵하고 데이터 처리
  // 엑셀 구조: No, 회차, 조, 당첨번호
  for (let i = 1; i < data.length; i++) {
    const row = data[i]
    if (!row || row.length < 4) {
      skipped++
      continue
    }

    try {
      // row[0]: No (순번)
      // row[1]: 회차
      // row[2]: 조 (1~5)
      // row[3]: 당첨번호 (6자리 문자열)

      const round = typeof row[1] === 'number' ? row[1] : parseInt(String(row[1]))
      if (!round || round <= 0) {
        skipped++
        continue
      }

      // 조 추출
      const groupStr = String(row[2])
      const group = parseInt(groupStr)
      if (isNaN(group) || group < 1 || group > 5) {
        console.log(`  ${round}회차: 조 파싱 실패 - ${groupStr}`)
        skipped++
        continue
      }

      // 번호 추출 (6자리 문자열)
      const numStr = String(row[3]).padStart(6, '0')
      if (numStr.length !== 6 || !/^\d{6}$/.test(numStr)) {
        console.log(`  ${round}회차: 번호 파싱 실패 - ${row[3]}`)
        skipped++
        continue
      }

      const numbers = numStr.split('').map(n => parseInt(n))

      // 날짜는 회차로부터 계산 (2020-04-02 1회차 시작, 매주 목요일)
      const startDate = new Date('2020-04-02')
      const drawDate = new Date(startDate)
      drawDate.setDate(drawDate.getDate() + (round - 1) * 7)
      const date = drawDate.toISOString().split('T')[0]

      // DB에 저장
      await prisma.pensionLotteryResult.create({
        data: {
          round,
          date,
          group1: group,
          num1_1: numbers[0],
          num1_2: numbers[1],
          num1_3: numbers[2],
          num1_4: numbers[3],
          num1_5: numbers[4],
          num1_6: numbers[5],
        },
      })

      saved++

      if (saved % 50 === 0) {
        console.log(`  ${saved}개 저장 완료... (최근: ${round}회차)`)
      }
    } catch (error) {
      console.log(`  행 ${i} 오류:`, error)
      skipped++
    }
  }

  console.log(`\n완료: ${saved}개 저장, ${skipped}개 스킵`)

  // 결과 확인
  const count = await prisma.pensionLotteryResult.count()
  const latest = await prisma.pensionLotteryResult.findFirst({
    orderBy: { round: 'desc' },
  })
  const first = await prisma.pensionLotteryResult.findFirst({
    orderBy: { round: 'asc' },
  })

  console.log(`\nDB 현황:`)
  console.log(`  총 회차: ${count}개`)
  if (first) {
    console.log(`  최초: ${first.round}회차 (${first.date}) - ${first.group1}조 ${first.num1_1}${first.num1_2}${first.num1_3}${first.num1_4}${first.num1_5}${first.num1_6}`)
  }
  if (latest) {
    console.log(`  최신: ${latest.round}회차 (${latest.date}) - ${latest.group1}조 ${latest.num1_1}${latest.num1_2}${latest.num1_3}${latest.num1_4}${latest.num1_5}${latest.num1_6}`)
  }

  await prisma.$disconnect()
}

main().catch(console.error)
