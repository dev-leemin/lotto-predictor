import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { commentId } = await params
    const cid = parseInt(commentId)
    if (isNaN(cid)) {
      return NextResponse.json({ error: '유효하지 않은 댓글 ID입니다.' }, { status: 400 })
    }

    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json({ error: '비밀번호를 입력해주세요.' }, { status: 400 })
    }

    const comment = await prisma.comment.findUnique({ where: { id: cid } })
    if (!comment) {
      return NextResponse.json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 })
    }

    const isValid = await bcrypt.compare(password, comment.passwordHash)
    if (!isValid) {
      return NextResponse.json({ error: '비밀번호가 일치하지 않습니다.' }, { status: 403 })
    }

    await prisma.comment.delete({ where: { id: cid } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Comment delete error:', error)
    return NextResponse.json({ error: '댓글 삭제 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
