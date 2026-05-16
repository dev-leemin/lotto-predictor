import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '로또 커뮤니티 - 번호 공유·당첨 후기·자유 토론',
  description: '로또 번호 공유하고, 당첨 후기 올리고, 자유롭게 얘기해요! Lotto45 커뮤니티 게시판.',
}

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
