import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sanitizeInput } from '@/lib/board-utils'
import bcrypt from 'bcryptjs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const postId = parseInt(id)
    if (isNaN(postId)) {
      return NextResponse.json({ error: '유효하지 않은 게시글 ID입니다.' }, { status: 400 })
    }

    const [post] = await Promise.all([
      prisma.post.findUnique({
        where: { id: postId },
        include: {
          comments: {
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              content: true,
              nickname: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { views: { increment: 1 } },
      }).catch(() => null),
    ])

    if (!post) {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({
      id: post.id,
      category: post.category,
      title: post.title,
      content: post.content,
      nickname: post.nickname,
      views: post.views + 1,
      likesCount: post.likesCount,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      comments: post.comments.map(c => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Board detail error:', error)
    return NextResponse.json({ error: '게시글 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const postId = parseInt(id)
    if (isNaN(postId)) {
      return NextResponse.json({ error: '유효하지 않은 게시글 ID입니다.' }, { status: 400 })
    }

    const body = await request.json()
    const { title, content, password } = body

    if (!password) {
      return NextResponse.json({ error: '비밀번호를 입력해주세요.' }, { status: 400 })
    }

    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 })
    }

    const isValid = await bcrypt.compare(password, post.passwordHash)
    if (!isValid) {
      return NextResponse.json({ error: '비밀번호가 일치하지 않습니다.' }, { status: 403 })
    }

    if (title !== undefined && (!title.trim() || title.trim().length > 100)) {
      return NextResponse.json({ error: '제목은 1~100자로 입력해주세요.' }, { status: 400 })
    }
    if (content !== undefined && (!content.trim() || content.trim().length > 10000)) {
      return NextResponse.json({ error: '내용은 1~10000자로 입력해주세요.' }, { status: 400 })
    }

    await prisma.post.update({
      where: { id: postId },
      data: {
        ...(title !== undefined && { title: sanitizeInput(title.trim()) }),
        ...(content !== undefined && { content: sanitizeInput(content.trim()) }),
      },
    })

    return NextResponse.json({ id: postId })
  } catch (error) {
    console.error('Board edit error:', error)
    return NextResponse.json({ error: '게시글 수정 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const postId = parseInt(id)
    if (isNaN(postId)) {
      return NextResponse.json({ error: '유효하지 않은 게시글 ID입니다.' }, { status: 400 })
    }

    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json({ error: '비밀번호를 입력해주세요.' }, { status: 400 })
    }

    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 })
    }

    const isValid = await bcrypt.compare(password, post.passwordHash)
    if (!isValid) {
      return NextResponse.json({ error: '비밀번호가 일치하지 않습니다.' }, { status: 403 })
    }

    await prisma.post.delete({ where: { id: postId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Board delete error:', error)
    return NextResponse.json({ error: '게시글 삭제 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
