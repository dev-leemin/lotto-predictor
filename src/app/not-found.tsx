import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 min-h-[60vh]">
      <div className="text-center max-w-2xl mx-auto">
        {/* 404 큰 글자 */}
        <h1 className="text-[8rem] sm:text-[12rem] font-black leading-none tracking-tighter text-indigo-600 select-none">
          404
        </h1>

        {/* 구분선 */}
        <div className="w-24 h-1 mx-auto my-6 bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 rounded-full" />

        {/* 메시지 */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-gray-500 text-base sm:text-lg mb-10 leading-relaxed">
          요청하신 페이지가 존재하지 않거나, 이동되었거나, 삭제되었을 수 있습니다.
        </p>

        {/* 버튼 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-sm
              bg-indigo-600 hover:bg-indigo-700 text-white
              transition-all duration-200 text-center"
          >
            홈으로 가기
          </Link>
          <Link
            href="/blog"
            className="w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-sm
              border border-gray-300 text-gray-700
              hover:bg-gray-100 hover:border-gray-400
              transition-all duration-200 text-center"
          >
            블로그 보기
          </Link>
          <Link
            href="/faq"
            className="w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-sm
              border border-gray-300 text-gray-700
              hover:bg-gray-100 hover:border-gray-400
              transition-all duration-200 text-center"
          >
            FAQ 보기
          </Link>
        </div>

        {/* 하단 검색 안내 */}
        <div className="border-t border-gray-200 pt-8">
          <p className="text-gray-500 text-sm mb-4">
            찾으시는 내용이 있으신가요?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <Link
              href="/blog"
              className="text-indigo-600 hover:text-indigo-700 transition-colors underline underline-offset-4"
            >
              블로그
            </Link>
            <Link
              href="/guide"
              className="text-indigo-600 hover:text-indigo-700 transition-colors underline underline-offset-4"
            >
              가이드
            </Link>
            <Link
              href="/faq"
              className="text-indigo-600 hover:text-indigo-700 transition-colors underline underline-offset-4"
            >
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
