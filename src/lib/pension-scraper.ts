import axios from 'axios'
import * as cheerio from 'cheerio'
import { PensionResult } from '@/types/lottery'

// 연금복권 720+ 데이터 스크래핑
export async function fetchPensionResult(round: number): Promise<PensionResult | null> {
  try {
    const response = await axios.get(
      `https://www.dhlottery.co.kr/gameResult.do?method=win720`,
      {
        params: { Round: round },
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    )

    const $ = cheerio.load(response.data)

    // 1등 당첨번호 파싱
    const winNumberArea = $('.win720_num')
    if (!winNumberArea.length) {
      return null
    }

    // 조 번호
    const groupText = winNumberArea.find('.group').text().trim()
    const group = parseInt(groupText.replace(/[^0-9]/g, '')) || 0

    // 6자리 숫자
    const numbers: number[] = []
    winNumberArea.find('.num span').each((_, el) => {
      const num = parseInt($(el).text().trim())
      if (!isNaN(num)) {
        numbers.push(num)
      }
    })

    // 보너스 번호 (각 조 파싱)
    const bonusNumbers: number[] = []
    $('.bwin720_num .win720_num').each((_, el) => {
      const bonusGroup = parseInt($(el).find('.group').text().replace(/[^0-9]/g, '')) || 0
      bonusNumbers.push(bonusGroup)
    })

    // 회차 날짜
    const dateText = $('.win_result h4').text()
    const dateMatch = dateText.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/)
    const date = dateMatch
      ? `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`
      : ''

    if (numbers.length !== 6 || group === 0) {
      return null
    }

    return {
      round,
      date,
      group,
      numbers,
      bonusNumbers
    }
  } catch (error) {
    console.error(`Failed to fetch pension round ${round}:`, error)
    return null
  }
}

// 최신 연금복권 회차 가져오기
export async function getLatestPensionRound(): Promise<number> {
  try {
    // 2020년 4월 30일 1회차 시작 (720+)
    const startDate = new Date('2020-04-30')
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const estimatedRound = Math.floor(diffDays / 7) + 1

    // 예상 회차에서 실제 데이터가 있는지 확인
    for (let round = estimatedRound; round > estimatedRound - 5; round--) {
      const result = await fetchPensionResult(round)
      if (result) {
        return round
      }
    }

    return estimatedRound - 1
  } catch (error) {
    console.error('Failed to get latest pension round:', error)
    return 250 // fallback
  }
}

// 전체 연금복권 데이터 가져오기
export async function fetchAllPensionResults(
  fromRound: number = 1,
  toRound?: number
): Promise<PensionResult[]> {
  const latestRound = toRound || await getLatestPensionRound()
  const results: PensionResult[] = []

  const batchSize = 10 // 배치 크기 증가

  for (let i = fromRound; i <= latestRound; i += batchSize) {
    const batch = []
    for (let j = i; j < Math.min(i + batchSize, latestRound + 1); j++) {
      batch.push(fetchPensionResult(j))
    }

    const batchResults = await Promise.all(batch)
    batchResults.forEach(result => {
      if (result) results.push(result)
    })

    // 스크래핑 부하 방지 (100ms로 단축)
    if (i + batchSize <= latestRound) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  return results.sort((a, b) => a.round - b.round)
}

// 최근 N회차 데이터만 가져오기
export async function fetchRecentPensionResults(count: number = 50): Promise<PensionResult[]> {
  const latestRound = await getLatestPensionRound()
  const fromRound = Math.max(1, latestRound - count + 1)
  return fetchAllPensionResults(fromRound, latestRound)
}
