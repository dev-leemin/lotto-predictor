import axios from 'axios'
import * as cheerio from 'cheerio'
import { LottoResult } from '@/types/lottery'

// 동행복권 API로 로또 데이터 가져오기 (재시도 로직 포함)
export async function fetchLottoResult(round: number, retries: number = 2): Promise<LottoResult | null> {
  const url = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, {
        timeout: 8000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
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
        firstPrize: data.firstWinamnt,
        firstWinners: data.firstPrzwnerCo,
      }
    } catch (error) {
      if (attempt === retries) {
        console.error(`Failed to fetch lotto round ${round}`)
        return null
      }
      await new Promise(resolve => setTimeout(resolve, 200 * attempt))
    }
  }
  return null
}

// 최신 회차 번호 가져오기
export async function getLatestLottoRound(): Promise<number> {
  try {
    // 2002년 12월 7일 1회차 시작, 매주 토요일 추첨
    const startDate = new Date('2002-12-07')
    const now = new Date()

    // 한국 시간 기준 (UTC+9)
    const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000))
    const diffDays = Math.floor((koreaTime.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    // 토요일 저녁 9시 이후에 추첨 결과 반영되므로, 여유 두기
    let estimatedRound = Math.floor(diffDays / 7) + 1

    // 오늘이 토요일이고 아직 추첨 전(21시 전)이면 이전 회차
    const dayOfWeek = koreaTime.getUTCDay() // 일=0, 토=6
    const hour = koreaTime.getUTCHours()
    if (dayOfWeek === 6 && hour < 12) { // 토요일 21시 전 (UTC 12시)
      estimatedRound -= 1
    }

    // 예상 회차에서 실제 데이터가 있는지 확인 (순차적으로 찾기)
    for (let round = estimatedRound; round > estimatedRound - 10; round--) {
      const result = await fetchLottoResult(round, 2) // 재시도 2회
      if (result) {
        return round
      }
    }

    // 못 찾으면 안전한 이전 회차 반환
    return estimatedRound - 2
  } catch (error) {
    console.error('Failed to get latest round:', error)
    return 1200 // fallback (최근 안정적인 회차)
  }
}

// 전체 로또 데이터 가져오기 (캐싱 고려)
export async function fetchAllLottoResults(
  fromRound: number = 1,
  toRound?: number
): Promise<LottoResult[]> {
  const latestRound = toRound || await getLatestLottoRound()
  const results: LottoResult[] = []

  // 병렬로 가져오되 동시 요청 수 제한 (5개씩 - API 안정성을 위해)
  const batchSize = 5

  for (let i = fromRound; i <= latestRound; i += batchSize) {
    const batch = []
    for (let j = i; j < Math.min(i + batchSize, latestRound + 1); j++) {
      batch.push(fetchLottoResult(j))
    }

    const batchResults = await Promise.all(batch)
    batchResults.forEach(result => {
      if (result) results.push(result)
    })

    // API 부하 방지를 위한 딜레이 (200ms)
    if (i + batchSize <= latestRound) {
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }

  return results.sort((a, b) => a.round - b.round)
}

// 최근 N회차 데이터만 가져오기 (빠른 로드용)
export async function fetchRecentLottoResults(count: number = 100): Promise<LottoResult[]> {
  const latestRound = await getLatestLottoRound()
  const fromRound = Math.max(1, latestRound - count + 1)
  return fetchAllLottoResults(fromRound, latestRound)
}
