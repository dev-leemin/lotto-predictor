import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sanitizeInput } from '@/lib/board-utils'
import { checkRateLimit } from '@/lib/rate-limit'
import bcrypt from 'bcryptjs'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(`comment:${ip}`, 10, 60000)) {
      return NextResponse.json({ error: '잠시 후 다시 시도해주세요.' }, { status: 429 })
    }

    const { id } = await params
    const postId = parseInt(id)
    if (isNaN(postId)) {
      return NextResponse.json({ error: '유효하지 않은 게시글 ID입니다.' }, { status: 400 })
    }

    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 })
    }

    const body = await request.json()
    const { content, nickname, password } = body

    if (!content?.trim() || content.trim().length > 500) {
      return NextResponse.json({ error: '댓글은 1~500자로 입력해주세요.' }, { status: 400 })
    }
    if (!nickname?.trim() || nickname.trim().length > 20) {
      return NextResponse.json({ error: '닉네임은 1~20자로 입력해주세요.' }, { status: 400 })
    }
    if (!password || password.length < 4 || password.length > 20) {
      return NextResponse.json({ error: '비밀번호는 4~20자로 입력해주세요.' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const comment = await prisma.comment.create({
      data: {
        postId,
        content: sanitizeInput(content.trim()),
        nickname: sanitizeInput(nickname.trim()),
        passwordHash,
      },
      select: {
        id: true,
        content: true,
        nickname: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
    }, { status: 201 })
  } catch (error) {
    console.error('Comment create error:', error)
    return NextResponse.json({ error: '댓글 작성 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
