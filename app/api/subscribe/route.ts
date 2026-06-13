import { NextRequest, NextResponse } from 'next/server'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NAME_REGEX = /^[\p{L}\p{M}\s'\-.]{1,100}$/u

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  'tempmail.com',
  'throwam.com',
  'sharklasers.com',
  'spam4.me',
  'trashmail.com',
  'yopmail.com',
])

const ipRequestMap = new Map<string, number[]>()
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000
const RATE_LIMIT_MAX = 5

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (ipRequestMap.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  )
  if (recent.length >= RATE_LIMIT_MAX) return true
  ipRequestMap.set(ip, [...recent, now])
  return false
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: '잠시 후 다시 시도해 주세요.' },
      { status: 429 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as Record<string, unknown>).email !== 'string' ||
    typeof (body as Record<string, unknown>).name !== 'string'
  ) {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  const { name, email } = body as { name: string; email: string }
  const trimmedEmail = email.trim().toLowerCase()
  const trimmedName = name.trim()

  if (!NAME_REGEX.test(trimmedName)) {
    return NextResponse.json(
      { error: '이름에 사용할 수 없는 문자가 포함되어 있습니다.' },
      { status: 400 }
    )
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return NextResponse.json(
      { error: '유효하지 않은 이메일 형식입니다.' },
      { status: 400 }
    )
  }

  const domain = trimmedEmail.split('@')[1]
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return NextResponse.json(
      { error: '일회용 이메일은 사용할 수 없습니다.' },
      { status: 400 }
    )
  }

  const apiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER_EMAIL

  if (!apiKey || !senderEmail) {
    return NextResponse.json(
      { error: '서비스 설정이 완료되지 않았습니다.' },
      { status: 503 }
    )
  }

  try {
    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { name: '블로그', email: senderEmail },
        to: [{ name: trimmedName, email: trimmedEmail }],
        subject: '구독해 주셔서 감사합니다!',
        htmlContent: `
          <p>안녕하세요, ${trimmedName}님!</p>
          <p>블로그를 구독해 주셔서 감사합니다. 새 글이 올라오면 알려드릴게요.</p>
        `,
      }),
    })

    if (brevoRes.ok) {
      return NextResponse.json({
        message: '구독해 주셔서 감사합니다! 확인 이메일을 발송했습니다.',
      })
    }

    const errorData = await brevoRes.json().catch(() => ({}))
    console.error('[Brevo 오류]', brevoRes.status, JSON.stringify(errorData))
    return NextResponse.json(
      { error: '이메일 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.' },
      { status: 500 }
    )
  } catch {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
