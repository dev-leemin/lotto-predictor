export type Tab = 'lotto' | 'pension'

export interface RankedNumber {
  rank: number
  number: number
  score?: number
  cdmScore?: number
  reasons: string[]
  frequency: number
  lastAppeared: number
  consecutiveMiss: number
  bayesianPosterior?: number
}

export interface RecentResult {
  round: number
  date: string
  dayOfWeek: string
  numbers: number[]
  bonus: number
}

export interface RecommendedSet {
  set: number
  numbers: number[]
  score: number
  description?: string
  method?: string
}

export interface BacktestSet {
  set: number
  numbers: number[]
  score: number
  method: string
  hitRate: number
  recentHitRate: number
}

export interface ConsensusNumber {
  number: number
  count: number
}

export interface EnsembleRank {
  number: number
  ensembleScore: number
  cdmScore: number
  markovScore: number
  mcScore: number
  rank: number
}

export interface EnsembleSet {
  set: number
  numbers: number[]
  score: number
  method: string
}

export interface LottoMatchInfo {
  targetRound: number
  actualNumbers: number[]
  actualBonus: number
  actualDate: string
  top15Matched: number
  top15MatchedNumbers: number[]
  setMatches: Array<{
    set: number
    method: string
    numbers: number[]
    matched: number
    matchedNumbers: number[]
  }>
  bestSetMatch: number
}

export interface LottoFullAnalysis {
  rankedNumbers: RankedNumber[]
  recommendedSets: RecommendedSet[]
  recentResults: RecentResult[]
  latestRound: number
  latestDate: string
  latestDayOfWeek: string
  totalRounds: number
  patterns: {
    sumRange: { min: number; max: number; avg: number }
    oddEvenMostCommon: string
    highLowMostCommon: string
    consecutivePairsPercent: number
  }
  nextRound: number
  cached: boolean
  lastUpdate: string
  matchInfo?: LottoMatchInfo
  isHistorical?: boolean
  backtestSets?: BacktestSet[]
  consensusNumbers?: ConsensusNumber[]
  ensembleRanking?: EnsembleRank[]
  ensembleSets?: EnsembleSet[]
  ensembleWeights?: { cdm: number; markov: number; mc: number }
  markovSets?: EnsembleSet[]
  monteCarloSets?: EnsembleSet[]
}

export interface PensionAnalysis {
  predictions: Array<{
    group: number
    numbers: number[]
    confidence: number
    reasons: string[]
    cdmScore?: number
  }>
  hotByPosition: Array<{ position: number; hotNumbers: number[] }>
  coldByPosition: Array<{ position: number; coldNumbers: number[] }>
  groupStats?: Array<{ group: number; score: number; frequency: number; probability: number }>
  recommendedSets?: Array<{
    set: number
    group: number
    numbers: number[]
    score: number
    method?: string
    numberString?: string
  }>
  digitPredictions?: Array<{
    position: number
    top3: Array<{ digit: number; cdmScore: number; frequency: number }>
  }>
  recentResults?: Array<{
    round: number
    date: string
    group: number
    numbers: number[]
  }>
  nextRound: number
  latestRound: number
  lastUpdate: string
  method?: string
  totalResults?: number
  matchInfo?: {
    targetRound: number
    actualGroup: number
    actualNumbers: number[]
    actualDate: string
    setMatches: Array<{
      set: number
      method: string
      numbers: number[]
      matchedDigits: number
      matchedPositions: number[]
      consecutiveFromEnd: number
      prize: string
    }>
    bestConsecutiveMatch: number
  }
  isHistorical?: boolean
}

export interface LoadingState {
  isLoading: boolean
  progress: number
  status: string
  startTime: number
  elapsedTime: number
}
