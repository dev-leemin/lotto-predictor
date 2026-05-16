import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '로또 자주 묻는 질문 - 번호 추천 원리, 당첨 확률 등',
  description: '로또 번호 추천은 어떻게 하나요? 당첨 확률은? 무료인가요? 로또에 대해 궁금한 것들을 모두 정리했습니다.',
  keywords: ['로또 FAQ', '로또 질문', '로또 번호 추천 방법', '로또 당첨 확률', '로또 무료', 'AI 로또', '로또 궁금한 점'],
  alternates: {
    canonical: 'https://lotto45.kr/faq',
  },
}

const faqs = [
  {
    question: 'Lotto45는 어떤 서비스인가요?',
    answer: 'Lotto45는 AI 확률 분석 기반 로또 6/45 번호 추천 및 연금복권 720+ 분석 서비스입니다. CDM(Compound Dirichlet Multinomial) 논문 기반 확률 모델, Markov Chain 전이 확률, Monte Carlo 시뮬레이션, 백테스트 검증 등 다양한 통계 기법을 활용하여 번호를 분석합니다. 모든 기능은 무료로 제공됩니다.',
  },
  {
    question: 'CDM 분석이란 무엇인가요?',
    answer: 'CDM(Compound Dirichlet Multinomial)은 학술 논문(arXiv:2403.12836)에 기반한 확률 모델입니다. 각 번호의 출현 빈도, 최근 트렌드, 베이지안 사후 확률을 종합적으로 계산하여 다음 회차에 출현할 가능성이 높은 번호를 예측합니다. 단순 빈도 분석보다 통계적으로 더 정교한 방법입니다.',
  },
  {
    question: '앙상블 분석은 어떻게 작동하나요?',
    answer: '앙상블 분석은 3가지 독립적인 AI 모델의 결과를 가중 합산하는 방식입니다. CDM 확률 모델(40%), Markov Chain 전이 확률(30%), Monte Carlo 시뮬레이션(30%)의 점수를 종합하여 더 안정적인 예측을 제공합니다. 마치 여러 전문가의 의견을 종합하는 것과 같습니다.',
  },
  {
    question: 'Markov Chain 분석이란?',
    answer: 'Markov Chain은 번호 간 전이 확률을 분석하는 기법입니다. "이번 회차에 특정 번호가 나왔을 때, 다음 회차에 어떤 번호가 나올 확률이 높은가"를 45x45 전이 행렬로 계산합니다. 최근 3회차의 당첨번호를 기반으로 다음 회차 번호를 예측합니다.',
  },
  {
    question: 'Monte Carlo 시뮬레이션이란?',
    answer: 'Monte Carlo 시뮬레이션은 CDM과 Markov Chain의 점수를 확률 분포로 변환한 뒤, 50,000회의 가상 추첨을 실행하는 방식입니다. 시뮬레이션에서 자주 등장하는 번호와 조합을 추출하여, 이론적 분석과 다른 관점의 검증을 제공합니다.',
  },
  {
    question: '로또 6/45 당첨 확률은 얼마인가요?',
    answer: '로또 6/45의 1등 당첨 확률은 약 1/8,145,060 (0.0000123%)입니다. 45개 번호 중 6개를 맞추는 경우의 수가 8,145,060가지이기 때문입니다. 2등(5개+보너스)은 약 1/1,357,510, 3등(5개)은 약 1/35,724, 4등(4개)은 약 1/733, 5등(3개)은 약 1/45입니다.',
  },
  {
    question: '이 서비스를 사용하면 당첨 확률이 높아지나요?',
    answer: '로또는 완전한 무작위 추첨이므로, 어떤 분석 방법도 당첨을 보장할 수 없습니다. Lotto45는 과거 데이터의 통계적 패턴을 분석하는 도구이며, 재미와 참고용으로 사용하시길 권장합니다. 과도한 구매는 삼가해 주세요.',
  },
  {
    question: '백테스트 검증이란?',
    answer: '백테스트는 과거 실제 당첨 데이터를 활용한 역추적 검증입니다. 특정 공식으로 과거 N회차의 번호를 예측했을 때, 실제 당첨번호와 몇 개가 일치하는지를 테스트합니다. 전체 회차와 최근 50회차에서 평균 2~3개 적중률을 보이는 공식을 선별하여 제공합니다.',
  },
  {
    question: '스마트 랜덤 번호는 완전 랜덤과 다른가요?',
    answer: '네, 다릅니다. 스마트 랜덤은 역대 당첨 번호의 통계적 패턴(홀짝 비율 2:4~4:2, 고저 비율 2:4~4:2, 합계 100~180, 3개 이상 번호대 분포 등)을 충족하는 조합만 생성합니다. 통계적으로 비현실적인 조합(예: 1,2,3,4,5,6)을 걸러내어 더 합리적인 번호를 제공합니다.',
  },
  {
    question: '연금복권 720+도 분석하나요?',
    answer: '네, 연금복권 720+도 동일한 CDM 모델로 분석합니다. 조(1~5조) 출현 확률, 각 자릿수별 CDM TOP 3, 핫/콜드 번호 등을 제공하며, CDM 기반 추천 세트도 생성합니다. 연금복권은 뒤 6자리 연속 일치 기준으로 당첨이 결정되므로, 이에 맞춘 분석을 제공합니다.',
  },
  {
    question: '데이터는 얼마나 자주 업데이트되나요?',
    answer: '매주 토요일 로또 추첨 후 자동으로 최신 당첨 번호가 업데이트됩니다. API 서버가 1시간마다 동행복권 공식 사이트의 최신 데이터를 확인하고, 새로운 회차가 있으면 자동 수집합니다.',
  },
  {
    question: '이 서비스는 무료인가요?',
    answer: '네, Lotto45의 모든 기능은 완전 무료입니다. 회원가입도 필요 없습니다. 로또 번호 추천, 연금복권 분석, 스마트 랜덤 생성, 백테스트 검증, 앙상블 분석 등 모든 기능을 자유롭게 이용하실 수 있습니다.',
  },
]

export default function FAQPage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: 'https://lotto45.kr' },
      { '@type': 'ListItem', position: 2, name: 'FAQ', item: 'https://lotto45.kr/faq' },
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

      <div className="max-w-4xl mx-auto px-4 py-8 pb-24 lg:pb-8">
        <nav className="text-xs text-gray-500 mb-6">
          <a href="/" className="hover:text-indigo-600">홈</a>
          <span className="mx-2">/</span>
          <span className="text-gray-900">자주 묻는 질문</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">자주 묻는 질문 (FAQ)</h1>
        <p className="text-sm text-gray-500 mb-8">
          Lotto45 서비스에 대해 궁금한 점을 확인하세요.
        </p>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <details
              key={idx}
              className="group rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm"
            >
              <summary className="cursor-pointer p-4 sm:p-5 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                <span className="text-indigo-600 font-bold mt-0.5 shrink-0">Q.</span>
                <span className="text-sm sm:text-base font-medium text-gray-900 flex-1">{faq.question}</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform shrink-0">&#9660;</span>
              </summary>
              <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
                <div className="flex gap-3 pl-0">
                  <span className="text-emerald-600 font-bold shrink-0">A.</span>
                  <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </details>
          ))}
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