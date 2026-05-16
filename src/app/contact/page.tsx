import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '문의하기',
  description: 'Lotto45에 궁금한 점이나 건의사항이 있으시면 편하게 보내주세요!',
  alternates: { canonical: 'https://lotto45.kr/contact' },
}

export default function ContactPage() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: 'https://lotto45.kr' },
      { '@type': 'ListItem', position: 2, name: '문의하기', item: 'https://lotto45.kr/contact' },
    ],
  }

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
          <span className="text-gray-900">문의하기</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">문의하기</h1>
        <p className="text-sm text-gray-500 mb-10">
          Lotto45 서비스에 대한 문의, 제안, 버그 리포트를 보내주세요.
        </p>

        <div className="space-y-6">
          {/* 연락 방법 */}
          <section className="p-5 sm:p-6 rounded-2xl bg-indigo-50 border border-indigo-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">연락 방법</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-200">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">이메일</h3>
                  <p className="text-sm text-indigo-600 font-mono">contact@naelotto.com</p>
                  <p className="text-xs text-gray-500 mt-1">서비스 관련 문의, 제안, 버그 리포트 등을 보내주세요. 영업일 기준 1~2일 내 답변드립니다.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-200">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">GitHub</h3>
                  <p className="text-sm text-gray-600">github.com/naelotto</p>
                  <p className="text-xs text-gray-500 mt-1">기술적인 이슈나 버그는 GitHub Issues로 제보해 주시면 더 빠르게 대응할 수 있습니다.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 문의 전 확인 */}
          <section className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">문의 전 확인해 주세요</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <span className="text-indigo-600 font-bold mt-0.5 shrink-0">Q</span>
                <div>
                  <p className="text-sm text-gray-700">자주 묻는 질문은 FAQ 페이지를 참고하세요.</p>
                  <p className="text-xs text-gray-500 mt-1">
                    서비스 이용 방법, 분석 원리, 당첨 확률 등 대부분의 궁금증은 FAQ에서 해결하실 수 있습니다.
                  </p>
                  <a
                    href="/faq"
                    className="inline-block mt-2 px-4 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-600 rounded-lg text-xs font-medium transition-colors"
                  >
                    FAQ 페이지 바로가기
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <span className="text-emerald-600 font-bold mt-0.5 shrink-0">+</span>
                <div>
                  <p className="text-sm text-gray-700">서비스 개선 제안은 커뮤니티 게시판에 남겨주세요.</p>
                  <p className="text-xs text-gray-500 mt-1">
                    새로운 기능 요청, 개선 아이디어, 사용 후기 등은 게시판에 작성해 주시면 다른 사용자들과 함께 논의할 수 있습니다.
                  </p>
                  <a
                    href="/board"
                    className="inline-block mt-2 px-4 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-600 rounded-lg text-xs font-medium transition-colors"
                  >
                    커뮤니티 게시판 바로가기
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* 문의 유형 안내 */}
          <section className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">문의 유형 안내</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-gray-50 text-center">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-2">
                  <span className="text-indigo-600 text-sm font-bold">?</span>
                </div>
                <h3 className="text-xs font-bold text-gray-900 mb-1">일반 문의</h3>
                <p className="text-xs text-gray-500">서비스 이용, 기능 질문, 데이터 관련 문의</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 text-center">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-2">
                  <span className="text-red-600 text-sm font-bold">!</span>
                </div>
                <h3 className="text-xs font-bold text-gray-900 mb-1">버그 리포트</h3>
                <p className="text-xs text-gray-500">오류, 잘못된 데이터, 페이지 오작동 신고</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 text-center">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                  <span className="text-emerald-600 text-sm font-bold">+</span>
                </div>
                <h3 className="text-xs font-bold text-gray-900 mb-1">기능 제안</h3>
                <p className="text-xs text-gray-500">새로운 분석 기능, UI 개선, 콘텐츠 제안</p>
              </div>
            </div>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-10 p-6 rounded-2xl bg-indigo-50 border border-indigo-200 text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-2">번호 분석이 필요하신가요?</h2>
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