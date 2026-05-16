import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const results = await prisma.lottoResult.findMany({
      orderBy: { round: 'asc' },
      select: { round: true, num1: true, num2: true, num3: true, num4: true, num5: true, num6: true, bonus: true },
    })

    const totalRounds = results.length

    // 1~45 번호별 출현 빈도
    const freq: number[] = new Array(46).fill(0)
    // 합계 분포
    const sumBuckets: Record<string, number> = {
      '21-80': 0,
      '81-120': 0,
      '121-160': 0,
      '161-200': 0,
      '201-255': 0,
    }
    // 홀짝 비율 분포
    const oddEvenDist: Record<string, number> = {}
    // 고저 비율 분포
    const highLowDist: Record<string, number> = {}

    for (const r of results) {
      const nums = [r.num1, r.num2, r.num3, r.num4, r.num5, r.num6]
      for (const n of nums) freq[n]++
      freq[r.bonus]++ // 보너스 포함

      const sum = nums.reduce((a, b) => a + b, 0)
      if (sum <= 80) sumBuckets['21-80']++
      else if (sum <= 120) sumBuckets['81-120']++
      else if (sum <= 160) sumBuckets['121-160']++
      else if (sum <= 200) sumBuckets['161-200']++
      else sumBuckets['201-255']++

      const oddCount = nums.filter(n => n % 2 === 1).length
      const oeKey = `${oddCount}:${6 - oddCount}`
      oddEvenDist[oeKey] = (oddEvenDist[oeKey] || 0) + 1

      const lowCount = nums.filter(n => n <= 22).length
      const hlKey = `${lowCount}:${6 - lowCount}`
      highLowDist[hlKey] = (highLowDist[hlKey] || 0) + 1
    }

    // 빈도 배열 (1~45)
    const numberFreq = Array.from({ length: 45 }, (_, i) => ({
      number: i + 1,
      count: freq[i + 1],
    }))

    // 합계 분포 퍼��트
    const sumDist = Object.entries(sumBuckets).map(([range, count]) => ({
      range,
      count,
      percent: Math.round((count / totalRounds) * 1000) / 10,
    }))

    // 홀짝 정렬
    const oddEven = Object.entries(oddEvenDist)
      .map(([ratio, count]) => ({
        ratio: `홀${ratio}짝`,
        count,
        percent: Math.round((count / totalRounds) * 1000) / 10,
      }))
      .sort((a, b) => b.count - a.count)

    // 고저 정렬
    const highLow = Object.entries(highLowDist)
      .map(([ratio, count]) => ({
        ratio: `저${ratio}고`,
        count,
        percent: Math.round((count / totalRounds) * 1000) / 10,
      }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({
      totalRounds,
      numberFreq,
      sumDist,
      oddEven,
      highLow,
      avgFreq: Math.round(numberFreq.reduce((a, b) => a + b.count, 0) / 45),
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}
