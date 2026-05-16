import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lotto45 소개 - 무료 로또 번호 추천 서비스',
  description: 'Lotto45는 AI가 로또 번호를 분석해서 무료로 추천해주는 서비스입니다. 누구나 쉽게 쓸 수 있어요!',
  alternates: { canonical: 'https://lotto45.kr/about' },
}

export default function AboutPage() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: 'https://lotto45.kr' },
      { '@type': 'ListItem', position: 2, name: '소개', item: 'https://lotto45.kr/about' },
    ],
  }

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Lotto45',
    url: 'https://lotto45.kr',
    description: 'AI 확률 분석 기반 로또 번호 추천 서비스. CDM 모델, Markov Chain, Monte Carlo 시뮬레이션을 활용한 통계 분석 도구.',
    foundingDate: '2025',
    sameAs: [],
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 py-8 pb-24 lg:pb-8">
        <nav className="text-xs text-gray-500 mb-6">
          <a href="/" className="hover:text-indigo-600">홈</a>
          <span className="mx-2">/</span>
          <span className="text-gray-900">소개</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Lotto45 소개</h1>
        <p className="text-sm text-gray-500 mb-10">
          AI 확률 분석 기반 로또 번호 추천 서비스, Lotto45를 소개합니다.
        </p>

        <div className="space-y-8">
          {/* 1. 서비스 소개 */}
          <section className="p-5 sm:p-6 rounded-2xl bg-indigo-50 border border-indigo-200">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">1</span>
              서비스 소개
            </h2>
            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
              <p>
                <strong className="text-gray-900">Lotto45</strong>는 로또 6/45와 연금복권 720+를 위한 AI 기반 통계 분석 서비스입니다.
                단순히 랜덤 번호를 생성하는 것이 아니라, 학술 논문에 기반한 확률 모델과 검증된 통계 기법을 활용하여
                보다 합리적인 번호 선택을 돕는 도구입니다.
              </p>
              <p>
                매주 수천만 명이 로또를 구매하지만, 대부분은 생일이나 기념일 등 감정적 기준으로 번호를 선택합니다.
                Lotto45는 이러한 편향에서 벗어나, 역대 당첨 데이터의 통계적 패턴을 기반으로 번호를 분석합니다.
                물론 로또는 완전한 무작위 추첨이므로 당첨을 보장할 수는 없지만,
                최소한 통계적으로 비합리적인 조합(예: 연속 번호 6개, 한 번호대에 치우친 조합 등)을 피하고
                보다 균형 잡힌 번호를 선택하는 데 도움을 드립니다.
              </p>
              <p>
                Lotto45의 모든 기능은 <strong className="text-indigo-600">완전 무료</strong>이며,
                회원가입 없이 누구나 자유롭게 이용할 수 있습니다.
                우리의 목표는 로또를 즐기는 분들께 통계적으로 합리적인 번호 선택 경험을 제공하는 것입니다.
              </p>
            </div>
          </section>

          {/* 2. 분석 방법론 */}
          <section className="p-5 sm:p-6 rounded-2xl bg-amber-50 border border-amber-200">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-600 shrink-0">2</span>
              분석 방법론
            </h2>
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <p>
                Lotto45는 4가지 독립적인 분석 기법을 결합한 앙상블 방식으로 번호를 분석합니다.
                각 기법은 서로 다른 관점에서 데이터를 바라보며, 이를 종합하여 더 안정적인 결과를 도출합니다.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-white border border-gray-200">
                  <h3 className="text-sm font-bold text-amber-600 mb-2">CDM 확률 모델</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Compound Dirichlet Multinomial 모델은 학술 논문(arXiv:2403.12836)에 기반한 베이지안 확률 모델입니다.
                    각 번호의 전체 출현 빈도, 최근 트렌드, 디리클레 분포 기반 사후 확률을 종합하여
                    다음 회차에 출현할 가능성이 높은 번호를 예측합니다.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-gray-200">
                  <h3 className="text-sm font-bold text-indigo-600 mb-2">Markov Chain 전이 확률</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    번호 간의 전이 확률을 분석하는 기법입니다. 45x45 전이 행렬을 구축하여
                    &quot;이번 회차에 특정 번호가 나왔을 때, 다음 회차에 어떤 번호가 나올 확률이 높은가&quot;를
                    계산합니다. 최근 3회차의 결과를 가중치로 반영합니다.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-gray-200">
                  <h3 className="text-sm font-bold text-violet-600 mb-2">Monte Carlo 시뮬레이션</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    CDM과 Markov Chain의 점수를 확률 분포로 변환한 뒤, 50,000회의 가상 추첨을 실행합니다.
                    시뮬레이션에서 자주 등장하는 번호와 조합을 추출하여,
                    이론적 분석과는 다른 관점의 교차 검증을 제공합니다.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-gray-200">
                  <h3 className="text-sm font-bold text-indigo-600 mb-2">앙상블 합산</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    위 3가지 모델의 결과를 CDM 40%, Markov Chain 30%, Monte Carlo 30%의 비율로 가중 합산합니다.
                    단일 모델의 편향을 보완하고 여러 관점을 종합하여
                    더 안정적이고 균형 잡힌 최종 추천 번호를 도출합니다.
                  </p>
                </div>
              </div>

              <p>
                더 자세한 분석 방법은 <a href="/guide" className="text-indigo-600 hover:text-indigo-500 underline">분석 가이드</a> 페이지에서 확인할 수 있습니다.
              </p>
            </div>
          </section>

          {/* 3. 개발 철학 */}
          <section className="p-5 sm:p-6 rounded-2xl bg-emerald-50 border border-emerald-200">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600 shrink-0">3</span>
              개발 철학
            </h2>
            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
              <p>
                Lotto45는 &quot;책임감 있는 분석 도구&quot;를 지향합니다.
                우리는 로또 구매를 조장하거나 과도한 기대를 심어주는 서비스가 아니라,
                이미 로또를 즐기는 분들이 보다 합리적인 선택을 할 수 있도록 돕는 도구입니다.
              </p>

              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white border border-gray-200">
                  <span className="text-emerald-600 font-bold mt-0.5 shrink-0">01</span>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">투명성</h3>
                    <p className="text-xs text-gray-500">
                      Lotto45가 사용하는 모든 분석 기법과 알고리즘은 가이드 페이지에 상세히 공개되어 있습니다.
                      블랙박스 예측이 아닌, 누구나 원리를 이해하고 검증할 수 있는 투명한 분석을 지향합니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white border border-gray-200">
                  <span className="text-emerald-600 font-bold mt-0.5 shrink-0">02</span>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">완전 무료</h3>
                    <p className="text-xs text-gray-500">
                      Lotto45의 모든 기능은 무료이며, 회원가입이 필요 없습니다.
                      유료 구독, 프리미엄 기능, 숨겨진 과금 요소는 일체 존재하지 않습니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white border border-gray-200">
                  <span className="text-emerald-600 font-bold mt-0.5 shrink-0">03</span>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">책임감 있는 도구</h3>
                    <p className="text-xs text-gray-500">
                      Lotto45는 &quot;이 번호가 당첨된다&quot;고 주장하지 않습니다.
                      로또는 무작위 추첨이며 어떤 분석도 결과를 보장할 수 없다는 사실을 항상 명시합니다.
                      과도한 구매는 삼가해 주시길 권장합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 4. 기술 스택 */}
          <section className="p-5 sm:p-6 rounded-2xl bg-violet-50 border border-violet-200">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-600 shrink-0">4</span>
              기술 스택
            </h2>
            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
              <p>
                Lotto45는 최신 웹 기술을 활용하여 빠르고 안정적인 서비스를 제공합니다.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { cat: '프레임워크', name: 'Next.js 15', sub: 'App Router' },
                  { cat: 'UI 라이브러리', name: 'React 19', sub: 'Server Components' },
                  { cat: '언어', name: 'TypeScript', sub: '타입 안전성' },
                  { cat: '스타일링', name: 'Tailwind CSS', sub: '유틸리티 퍼스트' },
                  { cat: '데이터베이스', name: 'PostgreSQL', sub: 'Neon Serverless' },
                  { cat: '배포', name: 'Docker', sub: 'Oracle Cloud' },
                  { cat: '데이터 수집', name: '자동 크롤링', sub: '동행복권 API' },
                  { cat: '분석 엔진', name: '자체 개발', sub: 'CDM + Markov + MC' },
                ].map((t) => (
                  <div key={t.cat} className="p-3 rounded-lg bg-white border border-gray-200 text-center">
                    <p className="text-xs font-bold text-violet-600 mb-1">{t.cat}</p>
                    <p className="text-sm text-gray-900 font-medium">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 5. 면책 조항 */}
          <section className="p-5 sm:p-6 rounded-2xl bg-red-50 border border-red-200">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-600 shrink-0">5</span>
              면책 조항
            </h2>
            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
              <p>
                로또 6/45는 동행복권에서 운영하는 완전한 무작위 추첨 복권입니다.
                45개 번호 중 6개가 무작위로 선택되며, 각 번호의 출현 확률은 이론적으로 동일합니다.
                과거의 당첨 패턴이 미래의 결과에 영향을 미치지 않습니다.
              </p>
              <p>
                Lotto45가 제공하는 모든 분석 결과와 추천 번호는 과거 데이터의 통계적 패턴을 기반으로 한
                <strong className="text-red-600"> 참고 자료</strong>이며,
                어떠한 경우에도 당첨을 보장하지 않습니다.
              </p>
              <p>
                로또는 여가와 재미를 위한 활동입니다.
                생활에 지장을 줄 정도의 과도한 구매는 반드시 삼가해 주시고,
                도움이 필요하시면 한국도박문제관리센터(1336)에 상담을 요청하실 수 있습니다.
              </p>
            </div>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-10 p-6 rounded-2xl bg-indigo-50 border border-indigo-200 text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-2">지금 바로 번호를 분석해보세요</h2>
          <p className="text-sm text-gray-500 mb-4">AI 앙상블 분석으로 이번 주 로또 번호를 추천받으세요.</p>
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