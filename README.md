# 개인 블로그

Next.js App Router 기반의 개인 블로그입니다.

## 기능

- MDX 기반 블로그 포스트 작성
- 다크 모드 토글
- 작성자 프로필
- 이메일 구독 기능 (Brevo 연동)
- RSS 피드 (`/rss`)
- 동적 OG 이미지 생성
- 코드 신택스 하이라이팅
- SEO 최적화 (sitemap, robots.txt, JSON-LD)
- CSP 및 보안 헤더
- Vercel Speed Insights / Web Analytics
- Tailwind v4 / Geist 폰트

## 시작하기

```bash
pnpm install
pnpm dev
```

## 이메일 구독 설정

구독 기능을 사용하려면 [Brevo](https://brevo.com) 무료 계정이 필요합니다.

프로젝트 루트에 `.env.local` 파일을 생성하고 아래 값을 입력하세요:

```bash
BREVO_API_KEY=발급받은_API_키
BREVO_SENDER_EMAIL=Brevo에서_인증한_이메일
```

**Brevo 설정 방법**
1. `brevo.com`에서 무료 가입
2. 우측 상단 프로필 → SMTP & API → API Keys → Generate a new API key
3. 우측 상단 프로필 → Senders & IP → Senders → Add a sender → 이메일 인증

## 블로그 포스트 작성

`app/blog/posts/` 폴더에 `.mdx` 파일을 추가합니다.

```mdx
---
title: '포스트 제목'
publishedAt: '2024-01-01'
summary: '포스트 요약'
---

본문 내용
```

## 테스트

```bash
pnpm playwright test
```

E2E 테스트 43개 (Playwright, Chromium)

## 기술 스택

- **프레임워크**: Next.js 16 (App Router)
- **언어**: TypeScript
- **스타일**: Tailwind CSS v4
- **테스트**: Playwright
- **패키지 매니저**: pnpm
- **배포**: Vercel
