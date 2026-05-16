'use client'

import { useState, useCallback, useMemo } from 'react'

export default function NumberCheckerPage() {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])

  // --- 번호 선택/해제 ---
  const toggleNumber = useCallback((num: number) => {
    setSelectedNumbers(prev => {
      if (prev.includes(num)) return prev.filter(n => n !== num)
      if (prev.length >= 6) return prev
      return [...prev, num].sort((a, b) => a - b)
    })
  }, [])

  // --- 초기화 ---
  const resetNumbers = useCallback(() => setSelectedNumbers([]), [])

  // --- 랜덤 생성 ---
  const generateRandom = useCallback(() => {
    const nums: number[] = []
    while (nums.length < 6) {
      const n = Math.floor(Math.random() * 45) + 1
      if (!nums.includes(n)) nums.push(n)
    }
    setSelectedNumbers(nums.sort((a, b) => a - b))
  }, [])

  // --- 로또볼 색상 ---
  const getBallColor = (n: number) => {
    if (n <= 10) return '#fbc400'
    if (n <= 20) return '#69c8f2'
    if (n <= 30) return '#ff7272'
    if (n <= 40) return '#aaaaaa'
    return '#b0d840'
  }

  const getBallTextColor = (n: number) => {
    if (n <= 10) return '#7a5c00'
    return '#ffffff'
  }

  // ===== 분석 로직 =====
  const analysis = useMemo(() => {
    if (selectedNumbers.length !== 6) return null
    const nums = selectedNumbers

    // 1) 홀짝 비율
    const oddCount = nums.filter(n => n % 2 !== 0).length
    const evenCount = 6 - oddCount
    let oddEvenGrade: 'good' | 'normal' | 'warning'
    if (oddCount === 3) oddEvenGrade = 'good'
    else if (oddCount === 2 || oddCount === 4) oddEvenGrade = 'normal'
    else oddEvenGrade = 'warning'

    // 2) 고저 비율 (1~22: 저 / 23~45: 고)
    const lowCount = nums.filter(n => n <= 22).length
    const highCount = 6 - lowCount
    let highLowGrade: 'good' | 'normal' | 'warning'
    if (lowCount === 3) highLowGrade = 'good'
    else if (lowCount === 2 || lowCount === 4) highLowGrade = 'normal'
    else highLowGrade = 'warning'

    // 3) 번호 합계
    const sum = nums.reduce((a, b) => a + b, 0)
    let sumGrade: 'good' | 'normal' | 'warning'
    if (sum >= 115 && sum <= 160) sumGrade = 'good'
    else if (sum >= 100 && sum <= 180) sumGrade = 'normal'
    else sumGrade = 'warning'

    // 4) 구간별 분포 (5구간)
    const ranges = [
      { label: '1~9', min: 1, max: 9 },
      { label: '10~18', min: 10, max: 18 },
      { label: '19~27', min: 19, max: 27 },
      { label: '28~36', min: 28, max: 36 },
      { label: '37~45', min: 37, max: 45 },
    ]
    const rangeDistribution = ranges.map(r => ({
      label: r.label,
      count: nums.filter(n => n >= r.min && n <= r.max).length,
    }))
    const coveredRanges = rangeDistribution.filter(r => r.count > 0).length
    const maxInOneRange = Math.max(...rangeDistribution.map(r => r.count))
    let rangeGrade: 'good' | 'normal' | 'warning'
    if (coveredRanges >= 4 && maxInOneRange <= 2) rangeGrade = 'good'
    else if (coveredRanges >= 3 && maxInOneRange <= 3) rangeGrade = 'normal'
    else rangeGrade = 'warning'

    // 5) 연속 번호 포함 여부
    let consecutiveCount = 0
    for (let i = 0; i < nums.length - 1; i++) {
      if (nums[i + 1] - nums[i] === 1) consecutiveCount++
    }
    let consecutiveGrade: 'good' | 'normal' | 'warning'
    if (consecutiveCount === 0) consecutiveGrade = 'good'
    else if (consecutiveCount === 1) consecutiveGrade = 'normal'
    else consecutiveGrade = 'warning'

    // 6) 끝자리 분포
    const lastDigits = nums.map(n => n % 10)
    const digitCounts: Record<number, number> = {}
    lastDigits.forEach(d => { digitCounts[d] = (digitCounts[d] || 0) + 1 })
    const maxSameLastDigit = Math.max(...Object.values(digitCounts))
    const uniqueLastDigits = Object.keys(digitCounts).length
    let lastDigitGrade: 'good' | 'normal' | 'warning'
    if (maxSameLastDigit <= 1) lastDigitGrade = 'good'
    else if (maxSameLastDigit === 2 && uniqueLastDigits >= 4) lastDigitGrade = 'normal'
    else lastDigitGrade = 'warning'

    // --- 종합 점수 계산 ---
    const gradeScore = (g: 'good' | 'normal' | 'warning') =>
      g === 'good' ? 100 : g === 'normal' ? 60 : 20

    const weights = [20, 15, 25, 20, 10, 10] // 홀짝, 고저, 합계, 구간, 연속, 끝자리
    const scores = [
      gradeScore(oddEvenGrade),
      gradeScore(highLowGrade),
      gradeScore(sumGrade),
      gradeScore(rangeGrade),
      gradeScore(consecutiveGrade),
      gradeScore(lastDigitGrade),
    ]
    const totalScore = Math.round(
      scores.reduce((acc, s, i) => acc + s * weights[i], 0) / weights.reduce((a, b) => a + b, 0)
    )

    return {
      oddCount,
      evenCount,
      oddEvenGrade,
      lowCount,
      highCount,
      highLowGrade,
      sum,
      sumGrade,
      rangeDistribution,
      rangeGrade,
      consecutiveCount,
      consecutiveGrade,
      maxSameLastDigit,
      uniqueLastDigits,
      lastDigitGrade,
      totalScore,
    }
  }, [selectedNumbers])

  // --- 등급 색상 ---
  const gradeInfo = (grade: 'good' | 'normal' | 'warning') => {
    if (grade === 'good') return { text: '양호', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' }
    if (grade === 'normal') return { text: '보통', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' }
    return { text: '주의', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' }
  }

  // --- 종합 점수 색상 ---
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-600'
    if (score >= 50) return 'text-amber-600'
    return 'text-red-500'
  }

  const getScoreBarColor = (score: number) => {
    if (score >= 75) return 'bg-emerald-500'
    if (score >= 50) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 85) return '매우 우수'
    if (score >= 70) return '우수'
    if (score >= 55) return '양호'
    if (score >= 40) return '보통'
    return '재검토 필요'
  }

  // --- FAQPage JSON-LD ---
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: '번호 검증기에서 높은 점수를 받으면 당첨 확률이 높아지나요?', acceptedAnswer: { '@type': 'Answer', text: '아닙니다. 모든 번호 조합의 당첨 확률은 동일하게 1/8,145,060입니다. 검증기 점수는 역대 당첨번호의 통계적 패턴과 유사도를 나타냅니다.' } },
      { '@type': 'Question', name: '이전에 당첨된 번호 조합이 다시 나올 수 있나요?', acceptedAnswer: { '@type': 'Answer', text: '수학적으로 가능합니다. 매 회차는 독립적인 추첨이므로 과거 당첨 번호가 다시 나올 확률은 다른 조합과 동일합니다.' } },
      { '@type': 'Question', name: '자동과 수동 중 어떤 것이 더 유리한가요?', acceptedAnswer: { '@type': 'Answer', text: '확률적으로는 완전히 동일합니다. 다만 수동 선택 시 검증기를 활용하면 극단적으로 편향된 조합을 피할 수 있습니다.' } },
    ],
  }

  // --- BreadcrumbList JSON-LD ---
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: 'https://lotto45.kr' },
      { '@type': 'ListItem', position: 2, name: '번호 검증기', item: 'https://lotto45.kr/number-checker' },
    ],
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <main className="max-w-4xl mx-auto px-4 py-8 pb-24 lg:pb-8">
        {/* 브레드크럼 */}
        <nav className="text-xs text-gray-500 mb-6">
          <a href="/" className="hover:text-indigo-600">홈</a>
          <span className="mx-2">/</span>
          <span className="text-gray-900">번호 검증기</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">로또 번호 조합 검증기</h1>
        <p className="text-sm text-gray-500 mb-8">
          내 로또 번호의 홀짝 비율, 합계, 구간 분포 등을 분석하여 조합의 균형도를 점검합니다.
        </p>

        {/* 교육 콘텐츠 */}
        <section className="space-y-6 mb-10">
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">좋은 번호 조합의 조건</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              로또는 완전한 확률 게임이지만, 역대 1,100회 이상의 당첨번호를 분석하면 일정한 통계적 패턴이 존재합니다.
              이 검증기는 <strong className="text-indigo-600">6가지 핵심 지표</strong>로 번호 조합의 균형도를 측정합니다.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              균형 잡힌 조합이 반드시 당첨을 보장하지는 않지만, 역대 당첨번호의 대다수가 균형 잡힌 조합에서 나왔습니다.
              반대로 극단적으로 편향된 조합(예: 1,2,3,4,5,6이나 40,41,42,43,44,45)은 역대 당첨번호에서 거의 나타나지 않았습니다.
            </p>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">6가지 분석 지표 상세 설명</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                <h3 className="text-sm font-bold text-indigo-800 mb-1">홀짝 비율 <span className="text-xs font-normal text-indigo-500">(가중치 20%)</span></h3>
                <p className="text-xs text-gray-600 leading-relaxed">역대 당첨번호 중 홀3:짝3이 약 33%로 가장 높고, 홀2:짝4와 홀4:짝2가 각각 약 25%입니다. 6:0이나 0:6은 전체의 1% 미만입니다.</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <h3 className="text-sm font-bold text-blue-800 mb-1">고저 비율 <span className="text-xs font-normal text-blue-500">(가중치 15%)</span></h3>
                <p className="text-xs text-gray-600 leading-relaxed">1~22번을 저번호, 23~45번을 고번호로 분류합니다. 저3:고3이 약 30%로 가장 높으며, 한쪽으로 5개 이상 쏠린 경우는 5% 미만입니다.</p>
              </div>
              <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
                <h3 className="text-sm font-bold text-violet-800 mb-1">번호 합계 <span className="text-xs font-normal text-violet-500">(가중치 25%, 가장 중요)</span></h3>
                <p className="text-xs text-gray-600 leading-relaxed">6개 번호 합계의 이론 범위는 21~255이며, 역대 평균은 약 138입니다. 100~175 구간에 전체의 약 75%가 집중되고, 115~160이 가장 이상적입니다.</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <h3 className="text-sm font-bold text-emerald-800 mb-1">구간별 분포 <span className="text-xs font-normal text-emerald-500">(가중치 20%)</span></h3>
                <p className="text-xs text-gray-600 leading-relaxed">1~9, 10~18, 19~27, 28~36, 37~45의 5구간 중 4개 이상에 골고루 분포되는 것이 이상적이며, 한 구간에 3개 이상 집중되면 주의가 필요합니다.</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <h3 className="text-sm font-bold text-amber-800 mb-1">연속 번호 <span className="text-xs font-normal text-amber-500">(가중치 10%)</span></h3>
                <p className="text-xs text-gray-600 leading-relaxed">역대 당첨번호 중 약 60%가 2연번(연속된 두 숫자)을 포함합니다. 1쌍의 연번 포함이 가장 일반적이며, 3연번 이상은 드문 편입니다.</p>
              </div>
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                <h3 className="text-sm font-bold text-rose-800 mb-1">끝자리 분포 <span className="text-xs font-normal text-rose-500">(가중치 10%)</span></h3>
                <p className="text-xs text-gray-600 leading-relaxed">6개 번호의 끝자리(일의 자리)가 모두 다르면 가장 이상적입니다. 같은 끝자리가 3개 이상이면 편향된 조합으로 판단합니다.</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">피해야 할 조합 예시</h2>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                <span className="text-xs font-bold text-red-500 shrink-0 mt-0.5">X</span>
                <div>
                  <p className="text-sm font-bold text-gray-900">1, 2, 3, 4, 5, 6</p>
                  <p className="text-xs text-gray-500">연속 번호 — 역대 당첨 사례 없음, 합계 21로 극단적 저합</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                <span className="text-xs font-bold text-red-500 shrink-0 mt-0.5">X</span>
                <div>
                  <p className="text-sm font-bold text-gray-900">5, 15, 25, 35, 45, 10</p>
                  <p className="text-xs text-gray-500">끝자리 5가 5개 집중 — 끝자리 분포 극도로 편향</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                <span className="text-xs font-bold text-red-500 shrink-0 mt-0.5">X</span>
                <div>
                  <p className="text-sm font-bold text-gray-900">7, 14, 21, 28, 35, 42</p>
                  <p className="text-xs text-gray-500">7의 배수 조합 — 끝자리 반복 패턴, 구간 분포 편향</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">자주 묻는 질문</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Q. 높은 점수를 받으면 당첨 확률이 높아지나요?</h3>
                <p className="text-sm text-gray-600 leading-relaxed">아닙니다. 모든 번호 조합의 당첨 확률은 동일하게 1/8,145,060입니다. 검증기 점수는 역대 당첨번호의 통계적 패턴과 얼마나 유사한지를 나타낼 뿐, 당첨 확률 자체를 높여주지는 않습니다.</p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Q. 이전에 당첨된 번호 조합이 다시 나올 수 있나요?</h3>
                <p className="text-sm text-gray-600 leading-relaxed">수학적으로 가능합니다. 매 회차는 독립적인 추첨이므로 과거 당첨 번호가 다시 나올 확률은 다른 조합과 동일합니다. 다만 실제로 동일 조합이 재출현한 사례는 한국 로또 역사상 없습니다.</p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Q. 자동과 수동 중 어떤 것이 더 유리한가요?</h3>
                <p className="text-sm text-gray-600 leading-relaxed">확률적으로는 완전히 동일합니다. 다만 수동 선택 시 이 검증기를 활용하면 극단적으로 편향된 조합을 피할 수 있어, 역대 당첨번호의 통계적 패턴에 부합하는 조합을 선택하는 데 도움이 됩니다.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== 번호 입력 섹션 ===== */}
        <section className="mb-8">
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 sm:p-6">
            {/* 선택된 번호 표시 영역 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-gray-900">선택한 번호</h2>
                <span className="text-xs text-gray-400">{selectedNumbers.length}/6</span>
              </div>
              <div className="flex items-center gap-3 min-h-[56px] p-4 rounded-xl bg-gray-50 border border-gray-200">
                {selectedNumbers.length === 0 && (
                  <span className="text-sm text-gray-400">아래 번호판에서 6개의 번호를 선택하세요</span>
                )}
                {selectedNumbers.map(n => (
                  <button
                    key={n}
                    onClick={() => toggleNumber(n)}
                    className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-transform hover:scale-110 cursor-pointer shrink-0"
                    style={{
                      backgroundColor: getBallColor(n),
                      color: getBallTextColor(n),
                    }}
                    title={`${n} 제거`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* 1~45 번호 그리드 */}
            <div className="mb-5">
              <h3 className="text-sm font-medium text-gray-500 mb-3">번호 선택 (1~45)</h3>
              <div className="grid grid-cols-9 gap-1.5 sm:gap-2">
                {Array.from({ length: 45 }, (_, i) => i + 1).map(n => {
                  const isSelected = selectedNumbers.includes(n)
                  const isDisabled = !isSelected && selectedNumbers.length >= 6
                  return (
                    <button
                      key={n}
                      onClick={() => toggleNumber(n)}
                      disabled={isDisabled}
                      className={`
                        w-full aspect-square rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-200
                        ${isSelected
                          ? 'scale-110 ring-2 ring-gray-400'
                          : isDisabled
                            ? 'opacity-30 cursor-not-allowed'
                            : 'hover:scale-105 hover:ring-1 hover:ring-indigo-300 cursor-pointer'
                        }
                      `}
                      style={
                        isSelected
                          ? {
                              backgroundColor: getBallColor(n),
                              color: getBallTextColor(n),
                              boxShadow: `0 2px 8px ${getBallColor(n)}44`,
                            }
                          : {
                              background: '#F3F4F6',
                              color: '#6B7280',
                            }
                      }
                    >
                      {n}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={resetNumbers}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400 text-sm font-medium transition-all cursor-pointer"
              >
                초기화
              </button>
              <button
                onClick={generateRandom}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium cursor-pointer transition-colors"
              >
                랜덤 생성
              </button>
            </div>
          </div>
        </section>

        {/* ===== 분석 결과 ===== */}
        {analysis && (
          <section className="mb-8 space-y-4">
            {/* 종합 점수 */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 sm:p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">종합 분석 결과</h2>
              <div className="flex items-center gap-6">
                <div className="text-center shrink-0">
                  <div className={`text-4xl sm:text-5xl font-black ${getScoreColor(analysis.totalScore)}`}>
                    {analysis.totalScore}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">/ 100점</div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-bold ${getScoreColor(analysis.totalScore)}`}>
                      {getScoreLabel(analysis.totalScore)}
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getScoreBarColor(analysis.totalScore)} transition-all duration-700`}
                      style={{ width: `${analysis.totalScore}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    6개 항목의 가중 평균으로 산출 (합계 25%, 홀짝 20%, 구간분포 20%, 고저 15%, 연속번호 10%, 끝자리 10%)
                  </p>
                </div>
              </div>
            </div>

            {/* 상세 분석 항목 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1) 홀짝 비율 */}
              <div className={`rounded-2xl p-5 border ${gradeInfo(analysis.oddEvenGrade).bg} ${gradeInfo(analysis.oddEvenGrade).border}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-900">홀짝 비율</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${gradeInfo(analysis.oddEvenGrade).bg} ${gradeInfo(analysis.oddEvenGrade).color} border ${gradeInfo(analysis.oddEvenGrade).border}`}>
                    {gradeInfo(analysis.oddEvenGrade).text}
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <span className="text-xs text-gray-500">홀수</span>
                    <span className="text-sm font-bold text-gray-900">{analysis.oddCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <span className="text-xs text-gray-500">짝수</span>
                    <span className="text-sm font-bold text-gray-900">{analysis.evenCount}</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden flex">
                  <div className="h-full bg-indigo-500" style={{ width: `${(analysis.oddCount / 6) * 100}%` }} />
                  <div className="h-full bg-rose-400" style={{ width: `${(analysis.evenCount / 6) * 100}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-2">역대 가장 많은 비율: 홀3:짝3 (약 33%)</p>
              </div>

              {/* 2) 고저 비율 */}
              <div className={`rounded-2xl p-5 border ${gradeInfo(analysis.highLowGrade).bg} ${gradeInfo(analysis.highLowGrade).border}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-900">고저 비율</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${gradeInfo(analysis.highLowGrade).bg} ${gradeInfo(analysis.highLowGrade).color} border ${gradeInfo(analysis.highLowGrade).border}`}>
                    {gradeInfo(analysis.highLowGrade).text}
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-xs text-gray-500">저 (1~22)</span>
                    <span className="text-sm font-bold text-gray-900">{analysis.lowCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                    <span className="text-xs text-gray-500">고 (23~45)</span>
                    <span className="text-sm font-bold text-gray-900">{analysis.highCount}</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden flex">
                  <div className="h-full bg-blue-500" style={{ width: `${(analysis.lowCount / 6) * 100}%` }} />
                  <div className="h-full bg-orange-400" style={{ width: `${(analysis.highCount / 6) * 100}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-2">역대 가장 많은 비율: 저3:고3 (약 30%)</p>
              </div>

              {/* 3) 번호 합계 */}
              <div className={`rounded-2xl p-5 border ${gradeInfo(analysis.sumGrade).bg} ${gradeInfo(analysis.sumGrade).border}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-900">번호 합계</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${gradeInfo(analysis.sumGrade).bg} ${gradeInfo(analysis.sumGrade).color} border ${gradeInfo(analysis.sumGrade).border}`}>
                    {gradeInfo(analysis.sumGrade).text}
                  </span>
                </div>
                <div className="text-center mb-3">
                  <span className="text-3xl font-black text-gray-900">{analysis.sum}</span>
                  <span className="text-xs text-gray-400 ml-2">/ 평균 138</span>
                </div>
                <div className="relative w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                  {/* 적정 범위 표시 */}
                  <div
                    className="absolute h-full bg-emerald-200"
                    style={{ left: `${(100 / 255) * 100}%`, width: `${((180 - 100) / 255) * 100}%` }}
                  />
                  {/* 현재 합계 위치 */}
                  <div
                    className="absolute top-0 w-1 h-full bg-gray-900 rounded-full"
                    style={{ left: `${Math.min(Math.max((analysis.sum / 255) * 100, 1), 99)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>21</span>
                  <span className="text-emerald-600">100~180 적정</span>
                  <span>255</span>
                </div>
              </div>

              {/* 4) 구간별 분포 */}
              <div className={`rounded-2xl p-5 border ${gradeInfo(analysis.rangeGrade).bg} ${gradeInfo(analysis.rangeGrade).border}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-900">구간별 분포</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${gradeInfo(analysis.rangeGrade).bg} ${gradeInfo(analysis.rangeGrade).color} border ${gradeInfo(analysis.rangeGrade).border}`}>
                    {gradeInfo(analysis.rangeGrade).text}
                  </span>
                </div>
                <div className="space-y-2">
                  {analysis.rangeDistribution.map(r => (
                    <div key={r.label} className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-12 shrink-0 text-right">{r.label}</span>
                      <div className="flex-1 h-4 rounded bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded bg-indigo-500 transition-all duration-500"
                          style={{ width: `${(r.count / 6) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-900 w-4 text-right">{r.count}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">4구간 이상 분포 + 한 구간 최대 2개가 이상적</p>
              </div>

              {/* 5) 연속 번호 */}
              <div className={`rounded-2xl p-5 border ${gradeInfo(analysis.consecutiveGrade).bg} ${gradeInfo(analysis.consecutiveGrade).border}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-900">연속 번호</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${gradeInfo(analysis.consecutiveGrade).bg} ${gradeInfo(analysis.consecutiveGrade).color} border ${gradeInfo(analysis.consecutiveGrade).border}`}>
                    {gradeInfo(analysis.consecutiveGrade).text}
                  </span>
                </div>
                <div className="text-center mb-2">
                  <span className="text-2xl font-black text-gray-900">{analysis.consecutiveCount}</span>
                  <span className="text-xs text-gray-500 ml-1">쌍</span>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  {analysis.consecutiveCount === 0
                    ? '연속 번호 없음'
                    : analysis.consecutiveCount === 1
                      ? '1쌍의 연속 번호 포함 (역대 약 60%)'
                      : `${analysis.consecutiveCount}쌍의 연속 번호 (다소 많음)`}
                </p>
                <p className="text-xs text-gray-400 mt-2 text-center">역대 당첨번호 중 약 60%가 2연번 이상 포함</p>
              </div>

              {/* 6) 끝자리 분포 */}
              <div className={`rounded-2xl p-5 border ${gradeInfo(analysis.lastDigitGrade).bg} ${gradeInfo(analysis.lastDigitGrade).border}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-900">끝자리 분포</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${gradeInfo(analysis.lastDigitGrade).bg} ${gradeInfo(analysis.lastDigitGrade).color} border ${gradeInfo(analysis.lastDigitGrade).border}`}>
                    {gradeInfo(analysis.lastDigitGrade).text}
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <div>
                    <span className="text-xs text-gray-500">같은 끝자리 최대</span>
                    <span className="text-lg font-bold text-gray-900 ml-2">{analysis.maxSameLastDigit}개</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">끝자리 종류</span>
                    <span className="text-lg font-bold text-gray-900 ml-2">{analysis.uniqueLastDigits}종</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 10 }, (_, i) => {
                    const cnt = selectedNumbers.filter(n => n % 10 === i).length
                    return (
                      <div key={i} className="flex-1 text-center">
                        <div
                          className={`mx-auto w-full h-6 rounded-sm mb-0.5 transition-all ${cnt > 0 ? 'bg-indigo-400' : 'bg-gray-100'}`}
                          style={{ opacity: cnt > 0 ? Math.min(cnt * 0.5, 1) : 0.3 }}
                        />
                        <span className="text-xs text-gray-400">{i}</span>
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs text-gray-400 mt-2">같은 끝자리 3개 이상이면 주의</p>
              </div>
            </div>
          </section>
        )}

        {/* 번호 미선택 시 안내 */}
        {!analysis && (
          <section className="mb-8">
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8 text-center">
              <div className="text-4xl mb-4">
                <span role="img" aria-label="search">&#128270;</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">번호를 선택하면 분석이 시작됩니다</h2>
              <p className="text-sm text-gray-500">
                위 번호판에서 6개의 번호를 선택하거나, &quot;랜덤 생성&quot; 버튼을 눌러보세요.
              </p>
            </div>
          </section>
        )}

        {/* 관련 블로그 글 링크 */}
        <section className="mb-8">
          <a
            href="/blog/number-strategies"
            className="block rounded-2xl bg-white border border-gray-200 shadow-sm p-5 hover:border-indigo-300 transition-all duration-300 hover:-translate-y-0.5 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  로또 번호 선택 전략 가이드
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  홀짝 비율, 합계, 구간 분포 등 통계 기반 번호 선택 전략을 알아보세요.
                </p>
              </div>
              <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
        </section>

        {/* CTA */}
        <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-200 text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-2">AI가 분석한 이번 주 추천 번호는?</h2>
          <p className="text-sm text-gray-500 mb-4">CDM + Markov + Monte Carlo 앙상블 분석으로 번호를 추천받으세요.</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all"
          >
            무료 번호 추천 받기
          </a>
        </div>
      </main>
    </div>
  )
}
