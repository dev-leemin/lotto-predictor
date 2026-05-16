import type { Metadata } from 'next'
import ProbabilityCalculator from './ProbabilityCalculator'

const SITE_URL = 'https://lotto45.kr'

export const metadata: Metadata = {
  title: '로또 당첨 확률 계산기 - 몇 장 사야 당첨될까?',
  description: '로또 몇 장 사면 당첨될까? 구매 장수별 등수 당첨 확률과 기대값을 바로 계산해보세요. 무료!',
  keywords: ['로또 확률 계산기', '로또 당첨 확률', '로또 몇 장', '로또 기대값', '로또 수익률', '로또 확률'],
  alternates: {
    canonical: `${SITE_URL}/probability-calculator`,
  },
}

export default function ProbabilityCalculatorPage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: '로또를 많이 사면 당첨 확률이 높아지나요?', acceptedAnswer: { '@type': 'Answer', text: '네, 구매 매수에 비례하여 확률은 높아집니다. 하지만 10장을 사도 1등 확률은 약 1/814,506으로 여전히 매우 낮습니다.' } },
      { '@type': 'Question', name: '자동과 수동의 당첨 확률 차이가 있나요?', acceptedAnswer: { '@type': 'Answer', text: '수학적으로 동일합니다. 로또는 완전한 무작위 추첨이므로 어떤 번호 조합이든 당첨 확률은 1/8,145,060으로 같습니다.' } },
      { '@type': 'Question', name: '1등에 당첨되려면 평균 몇 년이 걸리나요?', acceptedAnswer: { '@type': 'Answer', text: '매주 1장씩 구매 시 평균 약 156,636년, 5장이면 약 31,327년, 10장이면 약 15,664년입니다.' } },
    ],
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: '확률 계산기', item: `${SITE_URL}/probability-calculator` },
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
          <span className="text-gray-900">확률 계산기</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">로또 당첨 확률 계산기</h1>
        <p className="text-sm text-gray-500 mb-8">
          구매 장수에 따른 등수별 당첨 확률과 기대값을 계산합니다.
        </p>

        {/* 교육 콘텐츠 */}
        <section className="space-y-6 mb-10">
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">로또 확률의 수학적 이해</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              로또 6/45는 1부터 45까지의 번호 중 6개를 선택하는 <strong className="text-indigo-600">조합(Combination)</strong> 문제입니다.
              순서와 관계없이 6개 번호만 일치하면 되므로, 전체 경우의 수는 조합 공식 C(45,6) = 45! / (6! × 39!)로 계산합니다.
            </p>
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-center mb-3">
              <p className="text-xs text-gray-500 mb-1">전체 경우의 수</p>
              <p className="text-2xl font-bold text-indigo-600">8,145,060<span className="text-sm font-normal text-gray-500 ml-1">가지</span></p>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              즉, 1장 구매 시 1등 확률은 <strong className="text-indigo-600">1/8,145,060 (약 0.0000123%)</strong>입니다.
              이는 초당 1장씩 쉬지 않고 사도 약 94일이 걸려야 모든 조합을 살 수 있는 양입니다.
              매주 1장씩 구매한다면 평균적으로 약 156,636년에 한 번 1등에 당첨되는 셈입니다.
            </p>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">등수별 당첨 확률</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">등수</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">조건</th>
                    <th className="text-right py-2 px-3 text-gray-500 font-medium">경우의 수</th>
                    <th className="text-right py-2 px-3 text-gray-500 font-medium">확률</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b border-gray-100"><td className="py-2 px-3 font-bold text-amber-600">1등</td><td className="py-2 px-3">6개 번호 일치</td><td className="py-2 px-3 text-right font-mono">1</td><td className="py-2 px-3 text-right font-mono">1/8,145,060</td></tr>
                  <tr className="border-b border-gray-100"><td className="py-2 px-3 font-bold text-gray-600">2등</td><td className="py-2 px-3">5개 + 보너스</td><td className="py-2 px-3 text-right font-mono">6</td><td className="py-2 px-3 text-right font-mono">1/1,357,510</td></tr>
                  <tr className="border-b border-gray-100"><td className="py-2 px-3 font-bold text-orange-600">3등</td><td className="py-2 px-3">5개 일치</td><td className="py-2 px-3 text-right font-mono">228</td><td className="py-2 px-3 text-right font-mono">1/35,724</td></tr>
                  <tr className="border-b border-gray-100"><td className="py-2 px-3 font-bold text-indigo-600">4등</td><td className="py-2 px-3">4개 일치</td><td className="py-2 px-3 text-right font-mono">11,115</td><td className="py-2 px-3 text-right font-mono">1/733</td></tr>
                  <tr><td className="py-2 px-3 font-bold text-emerald-600">5등</td><td className="py-2 px-3">3개 일치</td><td className="py-2 px-3 text-right font-mono">182,780</td><td className="py-2 px-3 text-right font-mono">1/45</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-3">5등 이상 당첨 확률을 모두 합하면 약 2.4%로, 1장 구매 시 약 42장 중 1장꼴로 5등 이상에 당첨됩니다.</p>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">기대값과 기대 수익률</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              <strong className="text-indigo-600">기대값(Expected Value)</strong>은 각 등수의 당첨확률에 당첨금을 곱한 값의 합계입니다.
              로또 1장(1,000원)의 기대값은 1등 평균 당첨금 20억 원 기준으로 약 400~500원 수준이며,
              이는 기대 수익률 약 40~50%를 의미합니다.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              쉽게 말해, 평균적으로 1,000원을 투자하면 약 400~500원을 돌려받는다는 의미입니다.
              나머지 500~600원은 복권기금(38%), 판매점 수수료(6%), 운영비 등으로 배분됩니다.
            </p>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <h3 className="text-sm font-bold text-amber-800 mb-2">도박사의 오류에 주의하세요</h3>
              <p className="text-xs text-amber-700 leading-relaxed">
                &quot;10주 연속 안 나온 번호는 나올 차례&quot;라는 생각은 <strong>도박사의 오류(Gambler&apos;s Fallacy)</strong>입니다.
                로또 추첨기는 매주 독립적으로 작동하며, 이전 회차 결과는 다음 회차에 영향을 주지 않습니다.
                매 회차는 항상 동일한 8,145,060분의 1의 확률로 새롭게 시작됩니다.
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">자주 묻는 질문</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Q. 로또를 많이 사면 당첨 확률이 높아지나요?</h3>
                <p className="text-sm text-gray-600 leading-relaxed">네, 구매 매수에 비례하여 확률은 높아집니다. 하지만 10장을 사도 1등 확률은 10/8,145,060(약 1/814,506)으로 여전히 매우 낮습니다. 100장(10만원)을 사면 약 1/81,451의 확률을 얻게 됩니다.</p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Q. &quot;자동&quot;과 &quot;수동&quot;의 당첨 확률 차이가 있나요?</h3>
                <p className="text-sm text-gray-600 leading-relaxed">수학적으로 동일합니다. 로또는 완전한 무작위 추첨이므로 어떤 번호 조합이든 당첨 확률은 1/8,145,060으로 같습니다. 다만 인기 번호를 피하면 당첨 시 분배 인원이 적어 개인 당첨금이 높아질 수 있습니다.</p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Q. 1등에 당첨되려면 평균 몇 년이 걸리나요?</h3>
                <p className="text-sm text-gray-600 leading-relaxed">매주 1장씩 구매 시 평균 약 156,636년, 5장이면 약 31,327년, 10장이면 약 15,664년입니다. 이 수치는 평균적인 기대이며 실제로는 첫 주에 될 수도, 영원히 안 될 수도 있습니다.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 클라이언트 인터랙티브 영역 */}
        <ProbabilityCalculator />

        {/* 관련 콘텐츠 */}
        <div className="mt-8 p-6 rounded-2xl bg-indigo-50 border border-indigo-200 text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-2">로또 확률에 대해 더 알아보기</h2>
          <p className="text-sm text-gray-500 mb-4">로또 당첨 확률의 수학적 원리를 블로그에서 자세히 확인하세요.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/blog/lotto-probability"
              className="inline-block px-6 py-3 bg-white border border-gray-200 hover:border-indigo-300 rounded-xl text-sm font-bold text-indigo-600 transition-all"
            >
              확률 분석 블로그 읽기
            </a>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all"
            >
              무료 번호 추천 받기
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
