import Link from 'next/link'

export const metadata = {
  title: '구독 완료',
  description: '이메일 구독이 확인되었습니다.',
}

export default function ConfirmedPage() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">
        구독이 확인되었습니다
      </h1>
      <p className="text-neutral-600 dark:text-neutral-400 mb-4">
        이메일 인증이 완료되었습니다. 새 글이 발행되면 알림을 보내드립니다.
      </p>
      <Link
        href="/blog"
        className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors underline"
      >
        블로그로 돌아가기
      </Link>
    </section>
  )
}
