import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '로또 번호 잘 고르는 법 - 당첨 확률 높이는 분석 방법',
  description: '로또 번호 어떻게 골라야 할까? AI가 번호를 분석하는 원리와 당첨 확률을 높이는 번호 선택 전략을 쉽게 알려드립니다.',
  keywords: ['로또 번호 고르는 법', '로또 당첨 전략', '로또 분석 방법', '로또 번호 선택', '로또 확률 높이기', 'AI 로또 분석', '로또 예측'],
  alternates: {
    canonical: 'https://lotto45.kr/guide',
  },
}

export default function GuidePage() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: 'https://lotto45.kr' },
      { '@type': 'ListItem', position: 2, name: '분석 가이드', item: 'https://lotto45.kr/guide' },
    ],
  }

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: '로또 번호 AI 분석 방법 완전 가이드',
    description: 'CDM 확률 모델, Markov Chain, Monte Carlo 시뮬레이션을 활용한 로또 번호 분석 방법을 상세히 설명합니다.',
    author: { '@type': 'Organization', name: 'Lotto45' },
    publisher: { '@type': 'Organization', name: 'Lotto45' },
    datePublished: '2025-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    mainEntityOfPage: 'https://lotto45.kr/guide',
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 py-8 pb-24 lg:pb-8">
        <nav className="text-xs text-gray-500 mb-6">
          <a href="/" className="hover:text-indigo-600">홈</a>
          <span className="mx-2">/</span>
          <span className="text-gray-900">분석 가이드</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">로또 번호 AI 분석 방법 가이드</h1>
        <p className="text-sm text-gray-500 mb-8">
          Lotto45가 사용하는 4가지 분석 기법의 원리를 알아보세요.
        </p>

        <article className="space-y-8">
          {/* 목차 */}
          <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
            <h2 className="text-sm font-bold text-gray-700 mb-3">목차</h2>
            <ol className="space-y-1.5 text-sm text-gray-500">
              <li><a href="#cdm" className="hover:text-indigo-600 transition-colors">1. CDM (Compound Dirichlet Multinomial) 모델</a></li>
              <li><a href="#markov" className="hover:text-indigo-600 transition-colors">2. Markov Chain 전이 확률 분석</a></li>
              <li><a href="#montecarlo" className="hover:text-indigo-600 transition-colors">3. Monte Carlo 시뮬레이션</a></li>
              <li><a href="#ensemble" className="hover:text-indigo-600 transition-colors">4. 앙상블 (Ensemble) 합산</a></li>
              <li><a href="#backtest" className="hover:text-indigo-600 transition-colors">5. 백테스트 검증</a></li>
              <li><a href="#smart-random" className="hover:text-indigo-600 transition-colors">6. 스마트 랜덤 생성기</a></li>
              <li><a href="#probability" className="hover:text-indigo-600 transition-colors">7. 로또 당첨 확률 이해하기</a></li>
            </ol>
          </div>

          {/* CDM */}
          <section id="cdm" className="scroll-mt-20">
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">1. CDM (Compound Dirichlet Multinomial) 모델</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  CDM은 학술 논문(arXiv:2403.12836)에 기반한 베이지안 확률 모델입니다.
                  단순히 &quot;많이 나온 번호&quot;를 추천하는 것이 아니라, 다음 3가지 요소를 종합적으로 분석합니다.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-white border border-gray-200">
                    <h3 className="text-xs font-bold text-amber-600 mb-1">출현 빈도</h3>
                    <p className="text-xs text-gray-500">전체 회차에서 각 번호의 출현 횟수와 비율</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-gray-200">
                    <h3 className="text-xs font-bold text-amber-600 mb-1">최근 트렌드</h3>
                    <p className="text-xs text-gray-500">최근 50~100회차에서의 출현 패턴 변화</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-gray-200">
                    <h3 className="text-xs font-bold text-amber-600 mb-1">베이지안 사후 확률</h3>
                    <p className="text-xs text-gray-500">디리클레 분포 기반 사후 확률 추정</p>
                  </div>
                </div>
                <p>
                  이 세 가지를 가중 합산하여 각 번호에 CDM 점수(0~1)를 부여하고,
                  점수가 높은 번호부터 순위를 매깁니다.
                </p>
              </div>
            </div>
          </section>

          {/* Markov Chain */}
          <section id="markov" className="scroll-mt-20">
            <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">2. Markov Chain 전이 확률 분석</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  Markov Chain은 &quot;이번 회차에 번호 A가 나왔을 때, 다음 회차에 번호 B가 나올 확률&quot;을 계산하는 기법입니다.
                </p>
                <div className="p-4 rounded-lg bg-white border border-gray-200">
                  <h3 className="text-xs font-bold text-indigo-600 mb-2">작동 원리</h3>
                  <ol className="text-xs text-gray-500 space-y-1.5 list-decimal list-inside">
                    <li>전체 당첨 이력에서 45x45 전이 행렬을 구축합니다</li>
                    <li>T[i][j] = i번호 다음 회차에 j번호가 나온 횟수 / i번호 총 출현 횟수</li>
                    <li>최근 3회차의 번호를 시작점으로 사용합니다 (가중치: 최근 50%, 2회전 30%, 3회전 20%)</li>
                    <li>전이 확률이 높은 번호 = 다음 회차에 나올 가능성이 높은 번호</li>
                  </ol>
                </div>
                <p>
                  CDM이 개별 번호의 독립적 확률을 보는 반면,
                  Markov Chain은 번호 간의 관계성(연쇄 패턴)을 포착합니다.
                </p>
              </div>
            </div>
          </section>

          {/* Monte Carlo */}
          <section id="montecarlo" className="scroll-mt-20">
            <div className="p-5 rounded-2xl bg-violet-50 border border-violet-200">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">3. Monte Carlo 시뮬레이션</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  Monte Carlo 시뮬레이션은 CDM과 Markov Chain의 점수를 확률 분포로 변환한 뒤,
                  컴퓨터로 <strong className="text-violet-700">50,000회의 가상 추첨</strong>을 실행하는 방법입니다.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-white border border-gray-200">
                    <h3 className="text-xs font-bold text-violet-600 mb-1">확률 분포 생성</h3>
                    <p className="text-xs text-gray-500">CDM 50% + Markov 50%로 각 번호의 선택 가중치 설정</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-gray-200">
                    <h3 className="text-xs font-bold text-violet-600 mb-1">대량 시뮬레이션</h3>
                    <p className="text-xs text-gray-500">50,000회 가상 추첨에서 번호별 출현 빈도 추출</p>
                  </div>
                </div>
                <p>
                  이론적 확률 계산이 아닌 실제 시뮬레이션 결과이므로,
                  CDM/Markov와는 다른 관점의 교차 검증 역할을 합니다.
                </p>
              </div>
            </div>
          </section>

          {/* 앙상블 */}
          <section id="ensemble" className="scroll-mt-20">
            <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">4. 앙상블 (Ensemble) 합산</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  앙상블은 위 3가지 모델의 결과를 가중 합산하여 최종 점수를 산출하는 방법입니다.
                  머신러닝에서 단일 모델보다 여러 모델을 합치면 성능이 향상되는 원리를 적용합니다.
                </p>
                <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-white border border-gray-200">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-lg font-bold text-amber-700 mx-auto mb-1">40%</div>
                    <p className="text-xs text-gray-500">CDM</p>
                  </div>
                  <span className="text-gray-400 text-lg">+</span>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-lg font-bold text-indigo-700 mx-auto mb-1">30%</div>
                    <p className="text-xs text-gray-500">Markov</p>
                  </div>
                  <span className="text-gray-400 text-lg">+</span>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center text-lg font-bold text-violet-700 mx-auto mb-1">30%</div>
                    <p className="text-xs text-gray-500">Monte Carlo</p>
                  </div>
                </div>
                <p>
                  CDM에 가장 높은 가중치(40%)를 부여하는 이유는 학술 논문에 기반한 가장 이론적 토대가 견고한 모델이기 때문입니다.
                </p>
              </div>
            </div>
          </section>

          {/* 백테스트 */}
          <section id="backtest" className="scroll-mt-20">
            <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">5. 백테스트 검증</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  백테스트는 20가지 통계 공식을 과거 전체 회차에 적용하여
                  실제 당첨번호와 비교하는 역추적 검증입니다.
                </p>
                <p>
                  각 공식별로 평균 적중률(6개 중 몇 개 일치)과 최근 50회차 적중률을 계산하여,
                  가장 성능이 좋은 공식의 결과를 추천합니다.
                  일반적으로 평균 2~3개 적중 수준의 공식이 선별됩니다.
                </p>
              </div>
            </div>
          </section>

          {/* 스마트 랜덤 */}
          <section id="smart-random" className="scroll-mt-20">
            <div className="p-5 rounded-2xl bg-orange-50 border border-orange-200">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">6. 스마트 랜덤 생성기</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  완전 랜덤과 달리, 역대 당첨 번호의 통계적 패턴을 충족하는 조합만 생성합니다.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-white border border-gray-200 text-center">
                    <p className="text-xs font-bold text-orange-600">홀짝 비율</p>
                    <p className="text-sm text-gray-900">2:4 ~ 4:2</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-gray-200 text-center">
                    <p className="text-xs font-bold text-orange-600">고저 비율</p>
                    <p className="text-sm text-gray-900">2:4 ~ 4:2</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-gray-200 text-center">
                    <p className="text-xs font-bold text-orange-600">합계 범위</p>
                    <p className="text-sm text-gray-900">100 ~ 180</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-gray-200 text-center">
                    <p className="text-xs font-bold text-orange-600">번호대 분포</p>
                    <p className="text-sm text-gray-900">3개 이상 구간</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 확률 */}
          <section id="probability" className="scroll-mt-20">
            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">7. 로또 당첨 확률 이해하기</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  로또 6/45는 45개 번호 중 6개를 선택하는 조합입니다.
                  총 경우의 수는 <strong className="text-gray-900">8,145,060가지</strong>입니다.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 text-gray-500 font-medium">등수</th>
                        <th className="text-left py-2 px-3 text-gray-500 font-medium">조건</th>
                        <th className="text-right py-2 px-3 text-gray-500 font-medium">확률</th>
                        <th className="text-right py-2 px-3 text-gray-500 font-medium">평균 당첨금</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600">
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-3 text-amber-600 font-bold">1등</td>
                        <td className="py-2 px-3">6개 일치</td>
                        <td className="py-2 px-3 text-right font-mono">1/8,145,060</td>
                        <td className="py-2 px-3 text-right">~20억원</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-3 text-gray-700 font-bold">2등</td>
                        <td className="py-2 px-3">5개 + 보너스</td>
                        <td className="py-2 px-3 text-right font-mono">1/1,357,510</td>
                        <td className="py-2 px-3 text-right">~5,000만원</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-3 text-gray-700 font-bold">3등</td>
                        <td className="py-2 px-3">5개 일치</td>
                        <td className="py-2 px-3 text-right font-mono">1/35,724</td>
                        <td className="py-2 px-3 text-right">~150만원</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-3 text-gray-700 font-bold">4등</td>
                        <td className="py-2 px-3">4개 일치</td>
                        <td className="py-2 px-3 text-right font-mono">1/733</td>
                        <td className="py-2 px-3 text-right">5만원</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-gray-700 font-bold">5등</td>
                        <td className="py-2 px-3">3개 일치</td>
                        <td className="py-2 px-3 text-right font-mono">1/45</td>
                        <td className="py-2 px-3 text-right">5,000원</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-xs text-red-600">
                    로또는 완전한 무작위 추첨입니다. 어떤 분석도 당첨을 보장하지 않으며,
                    Lotto45는 통계적 참고 도구로만 활용하시기 바랍니다. 과도한 구매는 삼가해 주세요.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </article>

        {/* CTA */}
        <div className="mt-10 p-6 rounded-2xl bg-indigo-50 border border-indigo-200 text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-2">분석 결과 확인하기</h2>
          <p className="text-sm text-gray-500 mb-4">CDM + Markov + Monte Carlo 앙상블 분석 결과를 확인하세요.</p>
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