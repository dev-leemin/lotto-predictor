// 로또 6/45 당첨 데이터
export interface LottoResult {
  round: number           // 회차
  date: string            // 추첨일
  numbers: number[]       // 당첨번호 6개
  bonus: number           // 보너스 번호
  firstPrize: number      // 1등 당첨금
  firstWinners: number    // 1등 당첨자 수
}

// 연금복권 720+ 당첨 데이터
export interface PensionResult {
  round: number           // 회차
  date: string            // 추첨일
  group: number           // 조 (1~5)
  numbers: number[]       // 6자리 숫자
  bonusNumbers: number[]  // 보너스 번호
}

// 번호별 통계
export interface NumberStats {
  number: number
  frequency: number       // 출현 횟수
  lastAppeared: number    // 마지막 출현 회차
  consecutiveMiss: number // 연속 미출현 횟수
  avgGap: number          // 평균 출현 간격
  hotScore: number        // 핫 점수 (최근 출현 가중치)
  coldScore: number       // 콜드 점수 (오래 안 나온 정도)
}

// 예측 결과
export interface Prediction {
  numbers: number[]
  confidence: number      // 신뢰도 (0-100)
  method: 'statistical' | 'ml' | 'hybrid'
  reasons: string[]       // 추천 이유
}

// 분석 결과
export interface AnalysisResult {
  stats: NumberStats[]
  hotNumbers: number[]    // 핫 번호 (최근 자주 나온)
  coldNumbers: number[]   // 콜드 번호 (오래 안 나온)
  overdueNumbers: number[]// 출현 예정 번호 (평균보다 오래 안 나온)
  predictions: Prediction[]
  lastUpdate: string
}
