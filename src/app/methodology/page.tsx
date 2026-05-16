import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '로또 번호 어떻게 분석하나요? - AI 분석 원리 설명',
  description: 'Lotto45는 어떤 방법으로 로또 번호를 분석할까요? 3가지 AI 모델을 합쳐서 더 정확하게 번호를 추천하는 원리를 쉽게 설명합니다.',
  alternates: {
    canonical: 'https://lotto45.kr/methodology',
  },
}

export default function MethodologyPage() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: 'https://lotto45.kr' },
      { '@type': 'ListItem', position: 2, name: '분석 방법론', item: 'https://lotto45.kr/methodology' },
    ],
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 py-8 pb-24 lg:pb-8">
        {/* 브레드크럼 */}
        <nav className="text-xs text-gray-500 mb-6">
          <a href="/" className="hover:text-indigo-600">홈</a>
          <span className="mx-2">/</span>
          <span className="text-gray-900">분석 방법론</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">AI 분석 방법론</h1>
        <p className="text-sm text-gray-500 mb-10">
          Lotto45가 사용하는 앙상블 AI 분석 시스템의 원리와 구조를 상세히 설명합니다.
        </p>

        <div className="space-y-8">

          {/* 1. 개요 */}
          <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">1</span>
              개요: 앙상블 AI 분석 시스템
            </h2>
            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
              <p>
                Lotto45는 단일 모델에 의존하지 않고, <strong className="text-gray-900">3가지 독립적인 분석 모델</strong>의 결과를
                가중 합산하는 앙상블(Ensemble) 방식으로 로또 번호를 분석합니다.
                머신러닝 분야에서 검증된 원리인 &quot;여러 모델의 예측을 결합하면 단일 모델보다 더 안정적인 결과를 얻을 수 있다&quot;는
                앙상블 이론을 적용합니다.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
                  <p className="text-2xl font-bold text-amber-600 mb-1">CDM</p>
                  <p className="text-xs text-gray-500">조건부 확률 분포 모델</p>
                  <p className="text-lg font-bold text-amber-600 mt-2">40%</p>
                </div>
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
                  <p className="text-2xl font-bold text-indigo-600 mb-1">Markov</p>
                  <p className="text-xs text-gray-500">전이 확률 분석</p>
                  <p className="text-lg font-bold text-indigo-600 mt-2">30%</p>
                </div>
                <div className="p-4 rounded-xl bg-violet-50 border border-violet-200 text-center">
                  <p className="text-2xl font-bold text-violet-600 mb-1">Monte Carlo</p>
                  <p className="text-xs text-gray-500">시뮬레이션 기반 검증</p>
                  <p className="text-lg font-bold text-violet-600 mt-2">30%</p>
                </div>
              </div>
              <p>
                각 모델은 서로 다른 통계적 관점에서 데이터를 분석하며,
                이를 종합하여 개별 모델의 편향을 보완하고 더 균형 잡힌 최종 결과를 도출합니다.
              </p>
            </div>
          </section>

          {/* 가중치 시각적 바 */}
          <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6">
            <h2 className="text-sm font-bold text-gray-900 mb-4">모델별 가중치 비율</h2>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-amber-600">CDM (Conditional Distribution Model)</span>
                  <span className="text-xs font-bold text-amber-600">40%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: '40%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-indigo-600">Markov Chain</span>
                  <span className="text-xs font-bold text-indigo-600">30%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-500" style={{ width: '30%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-violet-600">Monte Carlo Simulation</span>
                  <span className="text-xs font-bold text-violet-600">30%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-violet-500" style={{ width: '30%' }} />
                </div>
              </div>
            </div>
          </section>

          {/* 2. CDM */}
          <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-600 shrink-0">2</span>
              CDM (Conditional Distribution Model)
              <span className="ml-auto text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">가중치 40%</span>
            </h2>
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <p>
                CDM은 <strong className="text-amber-600">조건부 확률 분포(Conditional Distribution)</strong>에 기반한
                Lotto45의 핵심 분석 모델입니다. 학술 논문(arXiv:2403.12836)의 이론적 토대 위에 구축되었으며,
                단순 빈도 분석을 넘어 베이지안 통계학의 원리를 적용합니다.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-gray-50">
                  <h3 className="text-xs font-bold text-amber-600 mb-2">조건부 확률 분포</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    과거 전체 당첨 데이터에서 각 번호의 출현 빈도를 기반으로 조건부 확률 분포를 구축합니다.
                    단순 빈도가 아닌, 전체 맥락을 반영한 확률을 계산합니다.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50">
                  <h3 className="text-xs font-bold text-amber-600 mb-2">베이지안 업데이트</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    디리클레 분포를 사전 분포로 사용하여, 새로운 회차 데이터가 추가될 때마다
                    베이지안 사후 확률을 갱신합니다. 최신 트렌드를 반영하되
                    과적합을 방지합니다.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50">
                  <h3 className="text-xs font-bold text-amber-600 mb-2">번호별 출현 확률 추정</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    전체 출현 빈도, 최근 50~100회차 트렌드, 베이지안 사후 확률을 가중 합산하여
                    각 번호(1~45)에 CDM 점수(0~1)를 부여합니다.
                    점수가 높은 번호일수록 다음 회차에 출현할 가능성이 높다고 판단합니다.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-600">
                  CDM에 가장 높은 가중치(40%)를 부여하는 이유는, 학술 논문에 기반한 이론적 토대가 가장 견고한 모델이며,
                  베이지안 업데이트를 통해 과적합과 과소적합 사이의 균형을 잘 유지하기 때문입니다.
                </p>
              </div>

              <p className="text-xs text-gray-500">
                관련 글: <a href="/blog/cdm-analysis-guide" className="text-indigo-600 hover:text-indigo-500 underline">CDM 분석 완전 가이드</a>
              </p>
            </div>
          </section>

          {/* 3. Markov Chain */}
          <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">3</span>
              Markov Chain 전이 확률 분석
              <span className="ml-auto text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded-full">가중치 30%</span>
            </h2>
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <p>
                Markov Chain은 <strong className="text-indigo-600">번호 간의 전이 확률</strong>을 분석하는 기법입니다.
                CDM이 각 번호의 독립적 출현 확률을 분석하는 반면,
                Markov Chain은 &quot;이번 회차에 특정 번호가 나왔을 때, 다음 회차에 어떤 번호가 나올 가능성이 높은가&quot;라는
                번호 간 관계성(연쇄 패턴)을 포착합니다.
              </p>

              <div className="p-4 rounded-xl bg-gray-50">
                <h3 className="text-xs font-bold text-indigo-600 mb-3">45 x 45 전이 행렬</h3>
                <ol className="text-xs text-gray-500 space-y-2 list-decimal list-inside">
                  <li>전체 당첨 이력에서 45x45 크기의 전이 행렬 T를 구축합니다.</li>
                  <li>T[i][j]는 i번호가 출현한 다음 회차에 j번호가 출현한 횟수를 i번호의 총 출현 횟수로 나눈 값입니다.</li>
                  <li>최근 3회차의 당첨번호를 시작점으로 사용합니다 (가중치: 최근 회차 50%, 2회전 30%, 3회전 20%).</li>
                  <li>각 시작 번호에서 전이 확률이 높은 번호들을 합산하여 최종 Markov 점수를 산출합니다.</li>
                </ol>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-gray-50">
                  <h3 className="text-xs font-bold text-indigo-600 mb-2">번호 간 전이 확률 분석</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    예를 들어, 최근 회차에서 7번이 당첨되었다면, 과거 데이터에서 7번 다음 회차에
                    가장 자주 등장한 번호들의 전이 확률을 계산합니다.
                    이를 최근 3회차 전체 당첨번호에 대해 반복 적용합니다.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50">
                  <h3 className="text-xs font-bold text-indigo-600 mb-2">최근 회차 기반 예측</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    최근 회차에 더 높은 가중치를 부여하여,
                    가장 최신의 당첨 패턴이 예측에 더 크게 반영되도록 합니다.
                    이는 로또 추첨기의 미세한 물리적 편향(있다면)도 간접적으로 반영할 수 있습니다.
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                관련 글: <a href="/blog/markov-chain-explained" className="text-indigo-600 hover:text-indigo-500 underline">Markov Chain 분석 원리 해설</a>
              </p>
            </div>
          </section>

          {/* 4. Monte Carlo Simulation */}
          <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-600 shrink-0">4</span>
              Monte Carlo Simulation
              <span className="ml-auto text-xs font-bold text-violet-600 bg-violet-50 border border-violet-200 px-2 py-1 rounded-full">가중치 30%</span>
            </h2>
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <p>
                Monte Carlo 시뮬레이션은 CDM과 Markov Chain의 이론적 분석 결과를 확률 분포로 변환한 뒤,
                컴퓨터로 <strong className="text-violet-600">50,000회의 가상 추첨</strong>을 실행하여 결과를 검증하는 방법입니다.
                이론적 계산이 아닌 실제 시뮬레이션 결과이므로, 다른 두 모델과는 독립적인 관점의 교차 검증 역할을 합니다.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-gray-50">
                  <h3 className="text-xs font-bold text-violet-600 mb-2">50,000회 가상 추첨</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    CDM과 Markov의 점수를 확률 분포로 변환하여,
                    이 분포에 따라 50,000회의 가상 로또 추첨을 시뮬레이션합니다.
                    대수의 법칙에 의해 충분한 시행 횟수가 안정적인 결과를 보장합니다.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50">
                  <h3 className="text-xs font-bold text-violet-600 mb-2">CDM + Markov 가중 확률 분포</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    시뮬레이션에서 각 번호가 선택될 확률은
                    CDM 50% + Markov 50%로 가중 합산한 분포를 사용합니다.
                    이를 통해 두 모델의 분석 결과가 시뮬레이션에 반영됩니다.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50">
                  <h3 className="text-xs font-bold text-violet-600 mb-2">신뢰구간 제공</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    50,000회 시뮬레이션에서 각 번호의 출현 빈도를 집계하여,
                    출현 빈도가 높은 번호에 높은 점수를 부여합니다.
                    또한 95% 신뢰구간을 함께 산출하여 결과의 안정성을 평가합니다.
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                관련 글: <a href="/blog/monte-carlo-lotto" className="text-indigo-600 hover:text-indigo-500 underline">Monte Carlo 시뮬레이션과 로또 분석</a>
              </p>
            </div>
          </section>

          {/* 5. 앙상블 합산 프로세스 */}
          <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600 shrink-0">5</span>
              앙상블 합산 프로세스
            </h2>
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <p>
                3가지 모델의 결과를 최종 추천 번호로 변환하는 앙상블 합산 프로세스는
                다음 3단계로 진행됩니다.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-600 shrink-0">1</div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">정규화 (Normalization)</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      각 모델의 점수 체계가 다르므로, Min-Max 정규화를 적용하여
                      모든 모델의 점수를 0~1 범위로 통일합니다.
                      이를 통해 서로 다른 스케일의 점수를 공정하게 비교하고 합산할 수 있습니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-600 shrink-0">2</div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">가중 합산 (Weighted Sum)</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      정규화된 점수에 각 모델의 가중치를 적용하여 합산합니다.
                      최종 점수 = CDM 점수 x 0.4 + Markov 점수 x 0.3 + Monte Carlo 점수 x 0.3.
                      이 가중치는 각 모델의 이론적 견고성과 백테스트 성능을 기반으로 설정되었습니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-600 shrink-0">3</div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">최종 랭킹 (Final Ranking)</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      가중 합산된 최종 점수를 기준으로 45개 번호의 순위를 매깁니다.
                      상위 6~10개 번호가 최종 추천 번호로 제시되며,
                      각 번호의 개별 모델 점수와 앙상블 점수를 함께 표시하여 투명한 분석 결과를 제공합니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
                <div className="text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-100 flex items-center justify-center text-base sm:text-lg font-bold text-amber-600 mx-auto mb-1">40%</div>
                  <p className="text-xs text-gray-500">CDM</p>
                </div>
                <span className="text-gray-400 text-lg">+</span>
                <div className="text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-indigo-100 flex items-center justify-center text-base sm:text-lg font-bold text-indigo-600 mx-auto mb-1">30%</div>
                  <p className="text-xs text-gray-500">Markov</p>
                </div>
                <span className="text-gray-400 text-lg">+</span>
                <div className="text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-violet-100 flex items-center justify-center text-base sm:text-lg font-bold text-violet-600 mx-auto mb-1">30%</div>
                  <p className="text-xs text-gray-500">Monte Carlo</p>
                </div>
                <span className="text-gray-400 text-lg">=</span>
                <div className="text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-100 flex items-center justify-center text-xs sm:text-sm font-bold text-emerald-600 mx-auto mb-1">최종</div>
                  <p className="text-xs text-gray-500">앙상블</p>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                관련 글: <a href="/blog/ensemble-prediction-guide" className="text-indigo-600 hover:text-indigo-500 underline">앙상블 예측 시스템 완전 가이드</a>
              </p>
            </div>
          </section>

          {/* 6. 백테스트 검증 */}
          <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600 shrink-0">6</span>
              백테스트 검증
            </h2>
            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
              <p>
                백테스트(Backtest)는 <strong className="text-emerald-600">과거 실제 당첨 데이터</strong>를 활용한 역추적 검증입니다.
                모델이 과거 특정 시점의 데이터만으로 분석했을 때,
                실제 다음 회차의 당첨번호와 얼마나 일치하는지를 측정합니다.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-gray-50">
                  <h3 className="text-xs font-bold text-emerald-600 mb-2">전체 회차 검증</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    1회차부터 최신 회차까지 전체 기간에 대해 역추적 테스트를 수행합니다.
                    각 회차에서 모델이 추천한 번호와 실제 당첨번호의 일치 개수를 집계하여
                    전체 평균 적중률을 산출합니다.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50">
                  <h3 className="text-xs font-bold text-emerald-600 mb-2">최근 50회차 정밀 검증</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    최근 50회차에 대한 적중률을 별도로 산출하여,
                    모델이 최근 데이터 트렌드에 얼마나 잘 적응하고 있는지를 평가합니다.
                    전체 평균 대비 최근 성능이 향상되고 있는지를 모니터링합니다.
                  </p>
                </div>
              </div>

              <p>
                백테스트를 통해 20가지 통계 공식 중 평균 2~3개 적중 수준의 가장 안정적인 공식을 선별하여
                추천에 반영합니다. 백테스트 결과는 모델의 신뢰성을 검증하는 핵심 지표입니다.
              </p>
            </div>
          </section>

          {/* 7. 데이터 출처 */}
          <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">7</span>
              데이터 출처
            </h2>
            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
              <p>
                Lotto45의 모든 분석은 <strong className="text-gray-900">동행복권(dhlottery.co.kr) 공식 API</strong>에서 제공하는
                역대 당첨 데이터를 기반으로 합니다.
              </p>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <ul className="text-xs text-gray-500 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5 shrink-0">--</span>
                    <span>데이터 소스: 동행복권 공식 당첨번호 조회 API</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5 shrink-0">--</span>
                    <span>업데이트 주기: 매주 토요일 추첨 후 자동 수집 (1시간 간격 확인)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5 shrink-0">--</span>
                    <span>데이터 범위: 1회차부터 최신 회차까지 전체 역대 데이터</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5 shrink-0">--</span>
                    <span>데이터 무결성: 공식 API 원본 데이터를 그대로 사용, 별도 가공 없음</span>
                  </li>
                </ul>
              </div>
              <p>
                동행복권은 기획재정부 산하 복권위원회가 지정한 복권 발행기관으로,
                제공되는 당첨 데이터는 공식적으로 검증된 신뢰할 수 있는 자료입니다.
              </p>
            </div>
          </section>

          {/* 8. 한계와 면책 */}
          <section className="p-5 sm:p-6 rounded-2xl bg-red-50 border border-red-200">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-600 shrink-0">8</span>
              한계와 면책
            </h2>
            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
              <p>
                로또 6/45는 동행복권에서 운영하는 <strong className="text-red-600">완전한 무작위 추첨</strong> 복권입니다.
                45개 번호 중 6개가 무작위로 선택되며, 각 번호의 출현 확률은 이론적으로 동일합니다.
                과거의 당첨 패턴이 미래의 결과에 인과적 영향을 미치지 않습니다.
              </p>

              <div className="p-4 rounded-xl bg-red-100 border border-red-200 space-y-2">
                <p className="text-xs text-red-600 font-bold">중요 안내 사항</p>
                <ul className="text-xs text-red-600 space-y-1.5">
                  <li>-- Lotto45는 통계 분석 도구이며, 어떠한 경우에도 당첨을 보장하지 않습니다.</li>
                  <li>-- 분석 결과는 과거 데이터의 통계적 패턴에 기반한 참고 자료입니다.</li>
                  <li>-- 분석 결과를 근거로 한 구매 결정은 전적으로 이용자 본인의 책임입니다.</li>
                  <li>-- 로또는 여가와 재미를 위한 활동이며, 과도한 구매는 반드시 삼가해 주세요.</li>
                  <li>-- 도움이 필요하시면 한국도박문제관리센터(1336)에 상담을 요청하실 수 있습니다.</li>
                </ul>
              </div>

              <p>
                Lotto45는 &quot;이 번호가 당첨된다&quot;고 주장하지 않습니다.
                우리의 역할은 이미 로또를 즐기는 분들이 감정적 편향에서 벗어나
                통계적으로 보다 합리적인 번호를 선택할 수 있도록 돕는 분석 도구를 제공하는 것입니다.
              </p>
            </div>
          </section>

          {/* 관련 블로그 글 */}
          <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6">
            <h2 className="text-sm font-bold text-gray-900 mb-4">관련 블로그 글</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a href="/blog/cdm-analysis-guide" className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-gray-300 transition-colors group">
                <h3 className="text-sm font-bold text-amber-600 mb-1 group-hover:text-amber-500">CDM 분석 완전 가이드</h3>
                <p className="text-xs text-gray-500">조건부 확률 분포 모델의 원리와 적용 방법을 상세히 알아봅니다.</p>
              </a>
              <a href="/blog/markov-chain-explained" className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-gray-300 transition-colors group">
                <h3 className="text-sm font-bold text-indigo-600 mb-1 group-hover:text-indigo-500">Markov Chain 분석 원리 해설</h3>
                <p className="text-xs text-gray-500">전이 행렬 기반 번호 간 관계성 분석의 원리를 설명합니다.</p>
              </a>
              <a href="/blog/monte-carlo-lotto" className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-gray-300 transition-colors group">
                <h3 className="text-sm font-bold text-violet-600 mb-1 group-hover:text-violet-500">Monte Carlo 시뮬레이션과 로또</h3>
                <p className="text-xs text-gray-500">50,000회 가상 추첨 시뮬레이션의 원리와 의미를 해설합니다.</p>
              </a>
              <a href="/blog/ensemble-prediction-guide" className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-gray-300 transition-colors group">
                <h3 className="text-sm font-bold text-emerald-600 mb-1 group-hover:text-emerald-500">앙상블 예측 시스템 완전 가이드</h3>
                <p className="text-xs text-gray-500">3가지 모델을 결합하는 앙상블 방법론의 전체 구조를 안내합니다.</p>
              </a>
            </div>
          </section>

          {/* CTA */}
          <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-200 text-center">
            <h2 className="text-lg font-bold text-gray-900 mb-2">분석 결과를 직접 확인해보세요</h2>
            <p className="text-sm text-gray-500 mb-4">CDM + Markov Chain + Monte Carlo 앙상블 분석으로 이번 주 로또 번호를 추천받으세요.</p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all"
            >
              무료 번호 추천 받기
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
