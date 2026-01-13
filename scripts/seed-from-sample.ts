/**
 * 샘플 데이터를 사용한 로또 시딩 스크립트
 * 실행: npx tsx scripts/seed-from-sample.ts
 */

import { PrismaClient } from '@prisma/client'
import { SAMPLE_LOTTO_DATA } from '../src/data/sample-lotto'

const prisma = new PrismaClient()

async function main() {
  console.log('====================================')
  console.log('로또 데이터 시딩 (샘플 데이터 사용)')
  console.log('====================================')
  console.log(`시작 시간: ${new Date().toLocaleString('ko-KR')}`)
  console.log(`총 ${SAMPLE_LOTTO_DATA.length}개 회차 데이터`)

  let created = 0
  let skipped = 0
  let errors = 0

  // 배치 처리 (50개씩)
  const batchSize = 50

  for (let i = 0; i < SAMPLE_LOTTO_DATA.length; i += batchSize) {
    const batch = SAMPLE_LOTTO_DATA.slice(i, i + batchSize)

    const promises = batch.map(async (data) => {
      try {
        const existing = await prisma.lottoResult.findUnique({
          where: { round: data.round },
        })

        if (existing) {
          skipped++
          return
        }

        const sortedNumbers = [...data.numbers].sort((a, b) => a - b)

        await prisma.lottoResult.create({
          data: {
            round: data.round,
            date: data.date,
            num1: sortedNumbers[0],
            num2: sortedNumbers[1],
            num3: sortedNumbers[2],
            num4: sortedNumbers[3],
            num5: sortedNumbers[4],
            num6: sortedNumbers[5],
            bonus: data.bonus,
            firstPrize: BigInt(data.firstPrize || 0),
            firstWinners: data.firstWinners || 0,
          },
        })
        created++
      } catch (e) {
        errors++
        console.error(`회차 ${data.round} 저장 실패:`, e)
      }
    })

    await Promise.all(promises)

    // 진행 상황 출력
    const progress = Math.min(i + batchSize, SAMPLE_LOTTO_DATA.length)
    console.log(`진행: ${progress}/${SAMPLE_LOTTO_DATA.length} (생성: ${created}, 스킵: ${skipped}, 실패: ${errors})`)
  }

  console.log('\n====================================')
  console.log('시딩 완료')
  console.log('====================================')
  console.log(`생성: ${created}개`)
  console.log(`스킵 (이미 존재): ${skipped}개`)
  console.log(`실패: ${errors}개`)
  console.log(`완료 시간: ${new Date().toLocaleString('ko-KR')}`)

  // DB 확인
  const count = await prisma.lottoResult.count()
  console.log(`\nDB 총 로또 데이터: ${count}개`)

  await prisma.$disconnect()
}

main().catch(console.error)
