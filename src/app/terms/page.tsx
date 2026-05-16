import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '이용약관',
  description: 'Lotto45 서비스 이용약관입니다.',
  alternates: { canonical: 'https://lotto45.kr/terms' },
}

export default function TermsPage() {
  return (
    <div>
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24 lg:pb-8">
        {/* 브레드크럼 */}
        <nav className="text-xs text-gray-500 mb-6">
          <a href="/" className="hover:text-indigo-600">홈</a>
          <span className="mx-2">/</span>
          <span className="text-gray-900">이용약관</span>
        </nav>

        {/* 제목 */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">이용약관</h1>
        <p className="text-sm text-gray-500 mb-10">
          최종 수정일: 2025년 6월 15일
        </p>

        <div className="space-y-10 text-gray-600 leading-relaxed">
          {/* 1. 서비스 개요 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              1. 서비스 개요
            </h2>
            <p className="mb-4">
              Lotto45(이하 &quot;서비스&quot;)는 과거 로또 6/45 및 연금복권 720+
              당첨 데이터를 기반으로 한 <span className="text-gray-900 font-medium">통계 분석 도구</span>입니다.
            </p>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <p className="text-sm text-gray-500">
                본 서비스는 확률론, 빈도 분석, CDM(Conditional Distribution Model) 등
                통계적 기법을 활용하여 번호를 분석하고 추천합니다. 이는 순수한 정보
                제공 목적이며, <span className="text-amber-600 font-medium">도박이나 베팅을 권유하거나 조장하는 서비스가 아닙니다.</span>
              </p>
            </div>
          </section>

          {/* 2. 면책 조항 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              2. 면책 조항 (당첨 비보장)
            </h2>
            <div className="p-5 rounded-xl bg-red-50 border border-red-200 mb-4">
              <p className="text-red-600 font-medium mb-3">
                본 서비스는 어떠한 경우에도 당첨을 보장하지 않습니다.
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-500">
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
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              3. 책임감 있는 복권 구매
            </h2>
            <p className="mb-4">
              복권은 소액의 여가 활동으로 즐겨야 합니다. 과도한 복권 구매는 도박
              중독으로 이어질 수 있으며, 본인과 가족에게 심각한 피해를 줄 수 있습니다.
            </p>

            <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 space-y-4">
              <div>
                <h3 className="font-bold text-amber-700 mb-2">건전한 복권 이용 수칙</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-500">
                  <li>본인이 감당할 수 있는 금액 범위 내에서만 구매하세요.</li>
                  <li>복권 구매를 투자나 수입원으로 생각하지 마세요.</li>
                  <li>손실을 만회하려고 추가 구매를 하지 마세요.</li>
                  <li>주변 사람과 복권 구매 습관에 대해 솔직하게 대화하세요.</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-amber-200">
                <h3 className="font-bold text-amber-700 mb-2">도박 중독 상담</h3>
                <p className="text-sm text-gray-500 mb-2">
                  복권 구매로 인해 일상에 문제가 생겼다면 전문 상담을 받으시기 바랍니다.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="p-3 rounded-lg bg-white border border-gray-200 flex-1">
                    <p className="text-sm font-bold text-gray-900">한국도박문제관리센터</p>
                    <p className="text-lg font-bold text-amber-600 mt-1">1336</p>
                    <p className="text-xs text-gray-500">24시간 무료 상담</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-gray-200 flex-1">
                    <p className="text-sm font-bold text-gray-900">정신건강 위기상담전화</p>
                    <p className="text-lg font-bold text-amber-600 mt-1">1577-0199</p>
                    <p className="text-xs text-gray-500">24시간 무료 상담</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-gray-200 flex-1">
                    <p className="text-sm font-bold text-gray-900">도박중독 상담전화</p>
                    <p className="text-lg font-bold text-amber-600 mt-1">1393</p>
                    <p className="text-xs text-gray-500">자살예방 상담전화</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 4. 이용 연령 제한 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              4. 이용 연령 제한
            </h2>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <p>
                본 서비스는 <span className="text-gray-900 font-bold">만 18세 이상</span>의
                성인만 이용할 수 있습니다. 「복권 및 복권기금법」에 따라 만 18세 미만은
                복권 구매가 금지되어 있으며, 본 서비스 역시 미성년자의 이용을
                허용하지 않습니다.
              </p>
            </div>
          </section>

          {/* 5. 지적재산권 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              5. 지적재산권
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-500">
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
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              6. 책임의 제한
            </h2>
            <p className="mb-4">
              서비스 운영자는 다음 사항에 대해 책임을 지지 않습니다.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-500">
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
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
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
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              8. 이용자의 의무
            </h2>
            <p className="mb-4">
              이용자는 서비스를 이용함에 있어 다음 행위를 하여서는 안 됩니다.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-500">
              <li>서비스의 운영을 방해하는 일체의 행위</li>
              <li>서비스 콘텐츠의 무단 복제, 배포, 상업적 이용</li>
              <li>자동화된 수단(봇, 크롤러 등)을 이용한 대량 접근</li>
              <li>서비스를 도박 조장 또는 불법 행위에 활용하는 행위</li>
              <li>타인의 권리를 침해하거나 법령에 위반되는 행위</li>
            </ul>
          </section>

          {/* 9. 약관의 변경 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
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
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              10. 준거법 및 관할
            </h2>
            <p>
              본 약관의 해석 및 적용에 관해서는 대한민국 법률을 준거법으로 하며,
              서비스 이용과 관련하여 발생한 분쟁에 대해서는 민사소송법에 따른
              관할 법원을 전속적 관할 법원으로 합니다.
            </p>
          </section>

          {/* 11. 문의 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              11. 문의
            </h2>
            <p>
              서비스 이용 관련 문의사항이 있으시면 아래로 연락해 주시기 바랍니다.
            </p>
            <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
              <p className="text-sm text-gray-500">
                서비스명: Lotto45
                <br />
                이메일:{' '}
                <a
                  href="mailto:leemin.dev@gmail.com"
                  className="text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  leemin.dev@gmail.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
