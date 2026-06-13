import { SubscribeForm } from 'app/components/subscribe-form'

export const metadata = {
  title: '뉴스레터 구독',
  description: '새 글이 올라오면 이메일로 알려드립니다.',
}

export default function SubscribePage() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">
        뉴스레터 구독
      </h1>
      <p className="text-neutral-600 dark:text-neutral-400 mb-2">
        새 글이 발행되면 이메일로 알려드립니다. 언제든지 구독을 취소할 수
        있습니다.
      </p>
      <SubscribeForm />
    </section>
  )
}
