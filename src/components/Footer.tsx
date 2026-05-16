import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-24 lg:pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-3">서비스</h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">번호 추천</Link>
              <Link href="/stats" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">역대 통계</Link>
              <Link href="/guide" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">분석 가이드</Link>
              <Link href="/faq" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">FAQ</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-3">도구</h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/tax-calculator" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">세금 계산기</Link>
              <Link href="/probability-calculator" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">확률 계산기</Link>
              <Link href="/number-checker" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">번호 검증기</Link>
              <Link href="/methodology" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">분석 방법론</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-3">콘텐츠</h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/blog" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">블로그</Link>
              <Link href="/board" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">커뮤니티</Link>
              <Link href="/about" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">소개</Link>
              <Link href="/contact" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">문의</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-3">법적고지</h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/privacy-policy" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">개인정보처리방침</Link>
              <Link href="/terms" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">이용약관</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-6 text-center">
          <p className="text-sm text-gray-500">
            로또는 무작위 추첨이며, 본 서비스는 통계 분석 도구입니다. 과도한 구매는 삼가세요.
          </p>
          <p className="text-xs text-gray-400 mt-1">&copy; {new Date().getFullYear()} Lotto45. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
