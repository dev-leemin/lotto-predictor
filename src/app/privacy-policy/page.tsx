'use client'

import Link from 'next/link'

export default function PrivacyPolicyPage() {
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
        <h1 className="text-3xl font-bold text-white mb-2">개인정보처리방침</h1>
        <p className="text-sm text-gray-500 mb-10">
          최종 수정일: 2025년 6월 15일
        </p>

        <div className="space-y-10 text-gray-300 leading-relaxed">
          {/* 1. 개요 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white/10">
              1. 개요
            </h2>
            <p>
              내로또(이하 &quot;서비스&quot;)는 이용자의 개인정보를 소중히 여기며,
              「개인정보 보호법」 등 관련 법령을 준수합니다. 본 개인정보처리방침은
              서비스가 수집하는 정보, 사용 목적, 보호 방법에 대해 안내합니다.
            </p>
          </section>

          {/* 2. 수집하는 정보 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white/10">
              2. 수집하는 정보
            </h2>
            <p className="mb-4">
              내로또는 별도의 회원가입 절차가 없으며, 이용자로부터 직접적으로
              개인정보를 수집하지 않습니다. 다만, 서비스 운영 과정에서 다음과 같은
              정보가 자동으로 수집될 수 있습니다.
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h3 className="font-bold text-white mb-2">자동 수집 정보</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                  <li>방문 기록, 페이지 조회 수, 체류 시간 등 서비스 이용 통계</li>
                  <li>브라우저 종류, 운영체제, 화면 해상도 등 기기 정보</li>
                  <li>IP 주소 및 접속 지역 (국가/도시 수준)</li>
                  <li>리퍼러(유입 경로) 정보</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h3 className="font-bold text-white mb-2">쿠키(Cookies)</h3>
                <p className="text-sm text-gray-400">
                  본 서비스는 Google AdSense 광고를 게재하기 위해 쿠키를 사용합니다.
                  쿠키는 이용자의 브라우저에 저장되는 소량의 데이터로, 맞춤형 광고
                  제공 및 광고 성과 측정에 사용됩니다. 이용자는 브라우저 설정을 통해
                  쿠키 수집을 거부할 수 있으나, 이 경우 서비스 이용에 제한이 있을 수
                  있습니다.
                </p>
              </div>
            </div>
          </section>

          {/* 3. 정보 이용 목적 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white/10">
              3. 정보 이용 목적
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>서비스 제공 및 운영 (로또 번호 분석, 통계 제공)</li>
              <li>서비스 개선 및 이용 통계 분석</li>
              <li>광고 게재 및 광고 성과 측정</li>
              <li>서비스 안정성 확보 및 오류 대응</li>
            </ul>
          </section>

          {/* 4. 제3자 서비스 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white/10">
              4. 제3자 서비스
            </h2>
            <p className="mb-4">
              본 서비스는 아래 제3자 서비스를 이용하며, 각 서비스의 개인정보처리방침이
              별도로 적용됩니다.
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h3 className="font-bold text-white mb-1">Google AdSense</h3>
                <p className="text-sm text-gray-400 mb-2">
                  광고 게재 및 맞춤형 광고 제공을 위해 쿠키 및 이용 데이터를 수집합니다.
                </p>
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Google 개인정보처리방침 보기
                </a>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h3 className="font-bold text-white mb-1">Vercel</h3>
                <p className="text-sm text-gray-400 mb-2">
                  서비스 호스팅 및 배포 플랫폼으로, 서버 로그 등 기술적 데이터를 처리합니다.
                </p>
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Vercel 개인정보처리방침 보기
                </a>
              </div>
            </div>
          </section>

          {/* 5. 데이터 보유 및 파기 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white/10">
              5. 데이터 보유 및 파기
            </h2>
            <p>
              본 서비스는 이용자의 개인정보를 직접 저장하지 않습니다. 자동으로 수집되는
              로그 데이터는 서비스 운영 목적으로만 활용되며, 수집 후 최대 90일 이내에
              자동 삭제됩니다. 제3자 서비스(Google AdSense, Vercel)가 수집한 데이터의
              보유 기간은 해당 서비스의 정책을 따릅니다.
            </p>
          </section>

          {/* 6. 이용자 권리 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white/10">
              6. 이용자의 권리
            </h2>
            <p className="mb-4">
              이용자는 다음과 같은 권리를 행사할 수 있습니다.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>
                <span className="text-white font-medium">쿠키 거부:</span>{' '}
                브라우저 설정에서 쿠키 수집을 차단하거나 삭제할 수 있습니다.
              </li>
              <li>
                <span className="text-white font-medium">맞춤 광고 비활성화:</span>{' '}
                <a
                  href="https://adssettings.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Google 광고 설정
                </a>
                에서 맞춤 광고를 비활성화할 수 있습니다.
              </li>
              <li>
                <span className="text-white font-medium">정보 삭제 요청:</span>{' '}
                수집된 정보에 대한 삭제를 요청할 수 있습니다.
              </li>
              <li>
                <span className="text-white font-medium">열람 및 정정 요청:</span>{' '}
                수집된 정보의 열람 및 정정을 요청할 수 있습니다.
              </li>
            </ul>
          </section>

          {/* 7. 보안 조치 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white/10">
              7. 보안 조치
            </h2>
            <p>
              본 서비스는 이용자의 정보 보호를 위해 HTTPS 암호화 통신을 사용하며,
              보안 헤더(X-Frame-Options, Content-Security-Policy 등)를 적용하여
              웹사이트의 보안을 강화하고 있습니다.
            </p>
          </section>

          {/* 8. 아동의 개인정보 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white/10">
              8. 아동의 개인정보
            </h2>
            <p>
              본 서비스는 만 18세 미만의 이용을 대상으로 하지 않으며, 의도적으로
              아동의 개인정보를 수집하지 않습니다.
            </p>
          </section>

          {/* 9. 방침 변경 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white/10">
              9. 개인정보처리방침의 변경
            </h2>
            <p>
              본 개인정보처리방침은 법령 변경이나 서비스 운영 정책에 따라 변경될 수
              있습니다. 변경 사항은 본 페이지를 통해 공지하며, 변경된 방침은 공지한
              날로부터 효력이 발생합니다.
            </p>
          </section>

          {/* 10. 문의 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white/10">
              10. 문의
            </h2>
            <p>
              개인정보 관련 문의사항이 있으시면 아래로 연락해 주시기 바랍니다.
            </p>
            <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-gray-400">
                서비스명: 내로또
                <br />
                이메일: 서비스 내 문의를 통해 연락 가능
              </p>
            </div>
          </section>
        </div>

        {/* 하단 링크 */}
        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <Link
            href="/"
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
