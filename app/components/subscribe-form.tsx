'use client'

import { useState } from 'react'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function SubscribeForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (honeypot) return

    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })
      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setMessage(data.message ?? '확인 이메일이 발송되었습니다.')
        setName('')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error ?? '오류가 발생했습니다.')
      }
    } catch {
      setStatus('error')
      setMessage('서버에 연결할 수 없습니다.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-3 mt-4">
      {/* honeypot: hidden from real users, filled only by bots */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        className="hidden"
        autoComplete="off"
      />

      <input
        type="text"
        placeholder="이름"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        maxLength={100}
        className="px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
      />

      <div className="flex space-x-2">
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-4 py-2 text-sm font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded hover:bg-neutral-700 dark:hover:bg-neutral-300 disabled:opacity-50 transition-colors"
        >
          {status === 'loading' ? '...' : '구독'}
        </button>
      </div>

      {status === 'success' && (
        <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
      )}
      {status === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
      )}
    </form>
  )
}
