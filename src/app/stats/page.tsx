import type { Metadata } from 'next'
import StatsCharts from './StatsCharts'
import AdBanner from '@/components/AdBanner'

export const metadata: Metadata = {
  title: '로또 역대 당첨 번호 통계 - 가장 많이 나온 번호는?',
  description: '로또에서 가장 많이 나온 번호는? 역대 당첨 번호 통계를 한눈에! 번호별 출현 빈도, 홀짝 비율, 합계 분포 등 데이터 분석.',
  keywords: ['로또 통계', '로또 당첨 번호', '로또 많이 나온 번호', '로또 출현 빈도', '로또 역대 당첨', '로또 데이터', '로또 번호 통계'],
  alternates: {
    canonical: 'https://lotto45.kr/stats',
  },
}

function getBallColor(num: number): { bg: string; text: string } {
  if (num <= 10) return { bg: '#FBC400', text: '#7A5C00' }
  if (num <= 20) return { bg: '#69C8F2', text: '#FFFFFF' }
  if (num <= 30) return { bg: '#FF7272', text: '#FFFFFF' }
  if (num <= 40) return { bg: '#AAAAAA', text: '#FFFFFF' }
  return { bg: '#B0D840', text: '#FFFFFF' }
}

export default function StatsPage() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: 'https://lotto45.kr' },
      { '@type': 'ListItem', position: 2, name: '역대 통계', item: 'https://lotto45.kr/stats' },
    ],
  }

  const generalStats = [
    { label: '총 추첨 횟수', value: '1,150+회', sub: '2002년 12월~' },
    { label: '1등 총 당첨자', value: '약 5,000명', sub: '평균 회당 4~5명' },
    { label: '1회 판매량', value: '약 40억원', sub: '1게임 1,000원 기준' },
    { label: '역대 최고 1등', value: '407억원', sub: '2003년 4월 (55회)' },
  ]

  const topNumbers = [
    { num: 34, count: 198 }, { num: 27, count: 195 }, { num: 43, count: 193 },
    { num: 17, count: 191 }, { num: 12, count: 190 }, { num: 1, count: 189 },
    { num: 33, count: 189 }, { num: 18, count: 188 }, { num: 40, count: 187 },
    { num: 20, count: 186 },
  ]

  const bottomNumbers = [
    { num: 9, count: 155 }, { num: 22, count: 158 }, { num: 44, count: 160 },
    { num: 41, count: 161 }, { num: 23, count: 162 },
  ]

  const patterns = [
    { title: '가장 많은 홀짝 비율', value: '홀3:짝3', percent: '약 33%' },
    { title: '가장 많은 고저 비율', value: '고3:저3', percent: '약 30%' },
    { title: '연번 포함 비율', value: '2연번 이상', percent: '약 60%' },
    { title: '평균 합계', value: '약 138', percent: '100~175 구간 80%' },
    { title: '같은 번호대 3개 이상', value: '약 35%', percent: '10단위 기준' },
    { title: '끝수 같은 번호 2개 이상', value: '약 70%', percent: '일의 자리 기준' },
  ]

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 py-8 pb-24 lg:pb-8">
        <nav className="text-xs text-gray-500 mb-6">
          <a href="/" className="hover:text-indigo-600">홈</a>
          <span className="mx-2">/</span>
          <span className="text-gray-900">역대 통계</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">로또 6/45 역대 당첨 통계</h1>
        <p className="text-sm text-gray-500 mb-8">
          2002년부터 현재까지의 로또 당첨 데이터를 분석한 통계입니다.
        </p>

        {/* 교육 콘텐츠: 통계 해석 가이드 */}
        <section className="space-y-5 mb-10">
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">로또 통계, 어떻게 읽어야 할까?</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              로또 6/45는 2002년 12월 첫 추첨 이후 1,150회 이상의 추첨이 이루어졌습니다.
              이 방대한 데이터를 분석하면 흥미로운 패턴이 발견되지만, 이를 해석할 때는 주의가 필요합니다.
              로또는 <strong className="text-indigo-600">매 회차 독립적인 무작위 추첨</strong>이므로,
              과거 데이터가 미래 결과를 결정하지 않습니다. 하지만 통계를 통해
              <strong className="text-indigo-600">"자연스러운" 번호 조합의 특성</strong>을 이해할 수 있습니다.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              예를 들어, 역대 당첨번호의 합계가 100~175에 집중된다는 것은 이 범위가 "자연스러운" 조합임을 의미합니다.
              1+2+3+4+5+6=21이나 40+41+42+43+44+45=255 같은 극단적 조합은 수학적으로 동일한 확률이지만,
              실제 추첨에서는 매우 드물게 나타납니다. 이는 가능한 조합 중 합계 21인 경우가 극히 적기 때문입니다.
            </p>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">통계 활용 시 주의사항</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <h3 className="text-sm font-bold text-emerald-700 mb-2">올바른 활용법</h3>
                <ul className="text-xs text-gray-600 space-y-1.5">
                  <li>• 번호 조합의 "자연스러움" 검증 참고</li>
                  <li>• 극단적 패턴(all 홀수, all 같은 번호대) 회피</li>
                  <li>• 합계 범위, 홀짝 비율 등 균형 확인</li>
                  <li>• 재미와 교육 목적으로 분석</li>
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                <h3 className="text-sm font-bold text-red-700 mb-2">주의할 오류</h3>
                <ul className="text-xs text-gray-600 space-y-1.5">
                  <li>• "안 나온 번호는 나올 차례" → <strong>도박사의 오류</strong></li>
                  <li>• "많이 나온 번호가 계속 나온다" → <strong>핫핸드 오류</strong></li>
                  <li>• "특정 패턴이 당첨을 보장" → <strong>패턴 착각</strong></li>
                  <li>• 통계로 당첨 확률을 높일 수 있다 → <strong>불가능</strong></li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 leading-relaxed">
              모든 번호 조합의 당첨 확률은 1/8,145,060으로 동일합니다.
              통계는 "어떤 조합이 자연스러운지" 참고하는 용도로만 활용하세요.
              <a href="/probability-calculator" className="text-indigo-600 hover:text-indigo-800 ml-1">확률 계산기에서 자세히 알아보기 →</a>
            </p>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">핵심 통계 용어 해설</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex gap-3">
                <span className="text-indigo-600 font-bold shrink-0 w-20">출현 빈도</span>
                <p>특정 번호가 역대 추첨에서 당첨번호에 포함된 횟수입니다. 45개 번호의 이론적 평균 출현 빈도는 (회차 수 × 6) / 45로 계산됩니다. 1,150회 기준 약 153회가 이론적 평균이며, 실제로는 155~198회 범위에 분포합니다.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-indigo-600 font-bold shrink-0 w-20">연번</span>
                <p>연속하는 두 수가 당첨번호에 동시에 포함된 경우입니다. 예: 7, 8이 함께 당첨. 역대 당첨번호의 약 60%에서 최소 1쌍의 연번이 관찰되어, 연번은 매우 흔한 패턴입니다.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-indigo-600 font-bold shrink-0 w-20">홀짝 비율</span>
                <p>당첨번호 6개 중 홀수와 짝수의 비율입니다. 가장 흔한 패턴은 홀3:짝3(약 33%)이며, 올 홀수(6:0)나 올 짝수(0:6)는 전체의 1% 미만으로 극히 드뭅니다.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-indigo-600 font-bold shrink-0 w-20">합계 범위</span>
                <p>6개 당첨번호를 모두 더한 값입니다. 이론적 범위는 21~255이지만, 역대 데이터에서 80%가 100~175 구간에 집중됩니다. 이는 정규분포의 특성 때문입니다.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 주요 통계 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {generalStats.map((stat) => (
            <div key={stat.label} className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm text-center">
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* 실시간 차트 (클라이언트 컴포넌트) */}
        <div className="mb-8">
          <StatsCharts />
        </div>

        {/* 최다 출현 번호 */}
        <section className="mb-8">
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">최다 출현 번호 TOP 10</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {topNumbers.map((item, idx) => {
                const c = getBallColor(item.num)
                return (
                  <div key={item.num} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200">
                    <span
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm shrink-0"
                      style={{ backgroundColor: c.bg, color: c.text }}
                    >
                      {item.num}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{idx + 1}위</p>
                      <p className="text-xs text-gray-500">{item.count}회</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* 최소 출현 번호 */}
        <section className="mb-8">
          <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">최소 출현 번호 TOP 5</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {bottomNumbers.map((item, idx) => {
                const c = getBallColor(item.num)
                return (
                  <div key={item.num} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200">
                    <span
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm opacity-60 shrink-0"
                      style={{ backgroundColor: c.bg, color: c.text }}
                    >
                      {item.num}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{idx + 1}위</p>
                      <p className="text-xs text-gray-500">{item.count}회</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              * 최소 출현 번호라고 해서 앞으로 더 많이 나온다는 보장은 없습니다. (도박사의 오류)
            </p>
          </div>
        </section>

        {/* 패턴 통계 */}
        <section className="mb-8">
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">당첨 패턴 통계</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {patterns.map((p) => (
                <div key={p.title} className="p-4 rounded-lg bg-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">{p.title}</p>
                    <p className="text-base font-bold text-gray-900">{p.value}</p>
                  </div>
                  <span className="text-xs text-indigo-600 font-medium">{p.percent}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 합계 분포 설명 */}
        <section className="mb-8">
          <div className="p-5 rounded-2xl bg-violet-50 border border-violet-200">
            <h2 className="text-lg font-bold text-gray-900 mb-3">당첨번호 합계 분포</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                로또 6개 번호의 합계는 이론적으로 21(1+2+3+4+5+6)부터 255(40+41+42+43+44+45)까지 가능합니다.
                하지만 역대 당첨 데이터를 보면 <strong className="text-gray-900">100~175 구간</strong>에 약 80%가 집중됩니다.
              </p>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="p-3 rounded-lg bg-white border border-gray-200 text-center">
                  <p className="text-xs text-gray-500">평균 합계</p>
                  <p className="text-lg font-bold text-gray-900">138</p>
                </div>
                <div className="p-3 rounded-lg bg-white border border-gray-200 text-center">
                  <p className="text-xs text-gray-500">최빈 구간</p>
                  <p className="text-lg font-bold text-gray-900">120~160</p>
                </div>
                <div className="p-3 rounded-lg bg-white border border-gray-200 text-center">
                  <p className="text-xs text-gray-500">80% 집중 구간</p>
                  <p className="text-lg font-bold text-gray-900">100~175</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 sm:mt-8">
          <AdBanner slot="stats-bottom" />
        </div>

        {/* 관련 블로그 글 */}
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-3">통계 분석 더 알아보기</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <a href="/blog/number-frequency-deep-analysis" className="block p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200 transition-all">
              <p className="text-sm font-medium text-gray-900">번호 출현 빈도 심층 분석</p>
              <p className="text-xs text-gray-500 mt-1">가장 많이/적게 나온 번호의 진실</p>
            </a>
            <a href="/blog/sum-range-strategy" className="block p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200 transition-all">
              <p className="text-sm font-medium text-gray-900">합계 구간 전략</p>
              <p className="text-xs text-gray-500 mt-1">당첨번호 합계 100~175의 비밀</p>
            </a>
            <a href="/blog/hot-cold-numbers" className="block p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200 transition-all">
              <p className="text-sm font-medium text-gray-900">핫넘버 vs 콜드넘버</p>
              <p className="text-xs text-gray-500 mt-1">자주 나오는 번호, 정말 효과 있을까?</p>
            </a>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-4 p-6 rounded-2xl bg-indigo-50 border border-indigo-200 text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-2">AI가 분석한 이번 주 추천 번호는?</h2>
          <p className="text-sm text-gray-500 mb-4">역대 통계를 기반으로 CDM + 앙상블 분석 결과를 확인하세요.</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors"
          >
            무료 번호 추천 받기
          </a>
        </div>
      </div>
    </div>
  )
}