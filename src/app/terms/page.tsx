'use client'

import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      {/* 배경 효과 */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* 뒤로가기 */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-8"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          홈으로 돌아가기
        </Link>

        {/* 제목 */}
        <h1 className="text-3xl font-bold text-white mb-2">이용약관</h1>
        <p className="text-sm text-gray-500 mb-10">
          최종 수정일: 2025년 6월 15일
        </p>

        <div className="space-y-10 text-gray-300 leading-relaxed">
          {/* 1. 서비스 개요 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white/10">
              1. 서비스 개요
            </h2>
            <p className="mb-4">
              내로또(이하 &quot;서비스&quot;)는 과거 로또 6/45 및 연금복권 720+
              당첨 데이터를 기반으로 한 <span className="text-white font-medium">통계 분석 도구</span>입니다.
            </p>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-gray-400">
                본 서비스는 확률론, 빈도 분석, CDM(Conditional Distribution Model) 등
                통계적 기법을 활용하여 번호를 분석하고 추천합니다. 이는 순수한 정보
                제공 목적이며, <span className="text-yellow-400 font-medium">도박이나 베팅을 권유하거나 조장하는 서비스가 아닙니다.</span>
              </p>
            </div>
          </section>

          {/* 2. 면책 조항 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white/10">
              2. 면책 조항 (당첨 비보장)
            </h2>
            <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/30 mb-4">
              <p className="text-red-300 font-medium mb-3">
                본 서비스는 어떠한 경우에도 당첨을 보장하지 않습니다.
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-400">
                <li>
                  로또 및 연금복권은 완전한 무작위(랜덤) 추첨으로, 과거 데이터 분석을
                  통해 미래 결과를 예측하는 것은 원천적으로 불가능합니다.
                </li>
                <li>
                  서비스에서 제공하는 &quot;추천 번호&quot;, &quot;AI 분석&quot;, &quot;확률 예측&quot; 등의
                  표현은 통계적 경향성을 나타낼 뿐, 당첨 가능성을 의미하지 않습니다.
                </li>
                <li>
                  본 서비스의 정보를 근거로 한 복권 구매로 인한 금전적 손실에 대해
                  서비스 운영자는 일절 책임을 지지 않습니다.
                </li>
              </ul>
            </div>
          </section>

          {/* 3. 책임감 있는 복권 구매 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white/10">
              3. 책임감 있는 복권 구매
            </h2>
            <p className="mb-4">
              복권은 소액의 여가 활동으로 즐겨야 합니다. 과도한 복권 구매는 도박
              중독으로 이어질 수 있으며, 본인과 가족에게 심각한 피해를 줄 수 있습니다.
            </p>

            <div className="p-5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 space-y-4">
              <div>
                <h3 className="font-bold text-yellow-300 mb-2">건전한 복권 이용 수칙</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                  <li>본인이 감당할 수 있는 금액 범위 내에서만 구매하세요.</li>
                  <li>복권 구매를 투자나 수입원으로 생각하지 마세요.</li>
                  <li>손실을 만회하려고 추가 구매를 하지 마세요.</li>
                  <li>주변 사람과 복권 구매 습관에 대해 솔직하게 대화하세요.</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-yellow-500/20">
                <h3 className="font-bold text-yellow-300 mb-2">도박 중독 상담</h3>
                <p className="text-sm text-gray-400 mb-2">
                  복권 구매로 인해 일상에 문제가 생겼다면 전문 상담을 받으시기 바랍니다.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="p-3 rounded-lg bg-white/5 flex-1">
                    <p className="text-sm font-bold text-white">한국도박문제관리센터</p>
                    <p className="text-lg font-bold text-yellow-400 mt-1">1336</p>
                    <p className="text-xs text-gray-500">24시간 무료 상담</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 flex-1">
                    <p className="text-sm font-bold text-white">정신건강 위기상담전화</p>
                    <p className="text-lg font-bold text-yellow-400 mt-1">1577-0199</p>
                    <p className="text-xs text-gray-500">24시간 무료 상담</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 flex-1">
                    <p className="text-sm font-bold text-white">도박중독 상담전화</p>
                    <p className="text-lg font-bold text-yellow-400 mt-1">1393</p>
                    <p className="text-xs text-gray-500">자살예방 상담전화</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 4. 이용 연령 제한 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white/10">
              4. 이용 연령 제한
            </h2>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p>
                본 서비스는 <span className="text-white font-bold">만 18세 이상</span>의
                성인만 이용할 수 있습니다. 「복권 및 복권기금법」에 따라 만 18세 미만은
                복권 구매가 금지되어 있으며, 본 서비스 역시 미성년자의 이용을
                허용하지 않습니다.
              </p>
            </div>
          </section>

          {/* 5. 지적재산권 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white/10">
              5. 지적재산권
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>
                본 서비스의 디자인, 로고, 소스 코드, 분석 알고리즘, 콘텐츠 등
                일체의 지적재산권은 서비스 운영자에게 귀속됩니다.
              </li>
              <li>
                서비스에서 제공하는 분석 결과, 추천 번호, 통계 데이터 등은 개인적
                용도로만 이용 가능하며, 상업적 목적의 복제, 배포, 재가공은
                금지됩니다.
              </li>
              <li>
                서비스의 콘텐츠를 무단으로 크롤링, 스크래핑하거나 자동화된
                방법으로 수집하는 행위를 금지합니다.
              </li>
            </ul>
          </section>

          {/* 6. 책임의 제한 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white/10">
              6. 책임의 제한
            </h2>
            <p className="mb-4">
              서비스 운영자는 다음 사항에 대해 책임을 지지 않습니다.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>
                서비스 이용으로 인해 발생한 직접적, 간접적, 부수적, 결과적 손해
              </li>
              <li>
                서비스의 정확성, 완전성, 신뢰성에 대한 보증 (서비스는 &quot;있는 그대로&quot;
                제공됩니다)
              </li>
              <li>
                제3자 서비스(Google AdSense, Vercel 등)의 정책 변경이나 서비스 장애로
                인한 문제
              </li>
              <li>
                천재지변, 시스템 장애, 해킹 등 불가항력적 사유로 인한 서비스 중단
              </li>
              <li>
                이용자가 서비스 정보를 기반으로 내린 의사결정의 결과
              </li>
            </ul>
          </section>

          {/* 7. 서비스 변경 및 중단 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white/10">
              7. 서비스 변경 및 중단
            </h2>
            <p>
              서비스 운영자는 운영상의 필요에 따라 서비스의 전부 또는 일부를
              변경하거나 중단할 수 있습니다. 이 경우 가능한 한 사전에 공지하나,
              불가피한 사유가 있는 경우 사후 공지할 수 있습니다.
            </p>
          </section>

          {/* 8. 이용자의 의무 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white/10">
              8. 이용자의 의무
            </h2>
            <p className="mb-4">
              이용자는 서비스를 이용함에 있어 다음 행위를 하여서는 안 됩니다.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>서비스의 운영을 방해하는 일체의 행위</li>
              <li>서비스 콘텐츠의 무단 복제, 배포, 상업적 이용</li>
              <li>자동화된 수단(봇, 크롤러 등)을 이용한 대량 접근</li>
              <li>서비스를 도박 조장 또는 불법 행위에 활용하는 행위</li>
              <li>타인의 권리를 침해하거나 법령에 위반되는 행위</li>
            </ul>
          </section>

          {/* 9. 약관의 변경 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white/10">
              9. 약관의 변경
            </h2>
            <p>
              본 약관은 법령 변경, 서비스 운영 정책 변경 등의 사유로 수정될 수
              있습니다. 변경된 약관은 본 페이지를 통해 공지되며, 변경 후에도 서비스를
              계속 이용하는 경우 변경된 약관에 동의한 것으로 간주합니다.
            </p>
          </section>

          {/* 10. 준거법 및 관할 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white/10">
              10. 준거법 및 관할
            </h2>
            <p>
              본 약관의 해석 및 적용에 관해서는 대한민국 법률을 준거법으로 하며,
              서비스 이용과 관련하여 발생한 분쟁에 대해서는 민사소송법에 따른
              관할 법원을 전속적 관할 법원으로 합니다.
            </p>
          </section>
        </div>

        {/* 하단 링크 */}
        <div className="mt-12 pt-8 border-t border-white/10 flex justify-center gap-6">
          <Link
            href="/"
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            홈으로 돌아가기
          </Link>
          <Link
            href="/privacy-policy"
            className="text-gray-500 hover:text-gray-400 transition-colors"
          >
            개인정보처리방침
          </Link>
        </div>
      </div>
    </div>
  )
}
