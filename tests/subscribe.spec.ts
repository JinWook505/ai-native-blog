import { test, expect } from '@playwright/test'

test.describe('푸터 뉴스레터 링크', () => {
  test('홈페이지 푸터에 뉴스레터 링크가 표시된다', async ({ page }) => {
    await page.goto('/')
    const link = page.getByRole('link', { name: '뉴스레터' })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', '/subscribe')
  })

  test('뉴스레터 링크 클릭 시 구독 페이지로 이동한다', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: '뉴스레터' }).click()
    await expect(page).toHaveURL('/subscribe')
  })
})

test.describe('구독 페이지(/subscribe)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/subscribe')
  })

  test('페이지 타이틀에 뉴스레터 구독이 포함된다', async ({ page }) => {
    await expect(page).toHaveTitle(/뉴스레터 구독/)
  })

  test('h1 제목이 표시된다', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: '뉴스레터 구독', level: 1 })
    ).toBeVisible()
  })

  test('안내 문구가 표시된다', async ({ page }) => {
    await expect(page.getByText(/새 글이 발행되면/)).toBeVisible()
  })

  test('이름 입력 필드가 표시된다', async ({ page }) => {
    await expect(page.getByPlaceholder('이름')).toBeVisible()
  })

  test('이메일 입력 필드가 표시된다', async ({ page }) => {
    await expect(page.getByPlaceholder('이메일')).toBeVisible()
  })

  test('구독 버튼이 표시된다', async ({ page }) => {
    await expect(page.getByRole('button', { name: '구독' })).toBeVisible()
  })
})

test.describe('구독 폼 - 클라이언트 유효성 검사', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/subscribe')
  })

  test('이름과 이메일 없이 제출하면 버튼이 비활성 상태가 아니지만 브라우저 검증이 막는다', async ({
    page,
  }) => {
    const submitButton = page.getByRole('button', { name: '구독' })
    await expect(submitButton).toBeEnabled()
    await submitButton.click()
    // required 필드 미입력 시 브라우저 기본 검증이 동작 — URL 변경 없음
    await expect(page).toHaveURL('/subscribe')
  })

  test('이메일만 입력하면 이름 필드 검증이 막는다', async ({ page }) => {
    await page.getByPlaceholder('이메일').fill('test@example.com')
    await page.getByRole('button', { name: '구독' }).click()
    await expect(page).toHaveURL('/subscribe')
  })

  test('이름만 입력하면 이메일 필드 검증이 막는다', async ({ page }) => {
    await page.getByPlaceholder('이름').fill('홍길동')
    await page.getByRole('button', { name: '구독' }).click()
    await expect(page).toHaveURL('/subscribe')
  })

  test('이름 입력 필드는 최대 100자 제한이 있다', async ({ page }) => {
    const nameInput = page.getByPlaceholder('이름')
    await expect(nameInput).toHaveAttribute('maxlength', '100')
  })

  test('이메일 필드 타입이 email이다', async ({ page }) => {
    const emailInput = page.getByPlaceholder('이메일')
    await expect(emailInput).toHaveAttribute('type', 'email')
  })
})

test.describe('구독 폼 - API 응답 처리', () => {
  test('API 성공 시 성공 메시지가 표시되고 폼이 초기화된다', async ({
    page,
  }) => {
    await page.route('/api/subscribe', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: '확인 이메일이 발송되었습니다. 받은 편지함을 확인해 주세요.',
        }),
      })
    )

    await page.goto('/subscribe')
    await page.getByPlaceholder('이름').fill('홍길동')
    await page.getByPlaceholder('이메일').fill('test@example.com')
    await page.getByRole('button', { name: '구독' }).click()

    await expect(
      page.getByText('확인 이메일이 발송되었습니다. 받은 편지함을 확인해 주세요.')
    ).toBeVisible()

    await expect(page.getByPlaceholder('이름')).toHaveValue('')
    await expect(page.getByPlaceholder('이메일')).toHaveValue('')
  })

  test('API 오류 시 에러 메시지가 표시된다', async ({ page }) => {
    await page.route('/api/subscribe', (route) =>
      route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ error: '이미 구독 중인 이메일입니다.' }),
      })
    )

    await page.goto('/subscribe')
    await page.getByPlaceholder('이름').fill('홍길동')
    await page.getByPlaceholder('이메일').fill('already@example.com')
    await page.getByRole('button', { name: '구독' }).click()

    await expect(page.getByText('이미 구독 중인 이메일입니다.')).toBeVisible()
  })

  test('Rate Limit 초과 시 에러 메시지가 표시된다', async ({ page }) => {
    await page.route('/api/subscribe', (route) =>
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: '잠시 후 다시 시도해 주세요.' }),
      })
    )

    await page.goto('/subscribe')
    await page.getByPlaceholder('이름').fill('테스트')
    await page.getByPlaceholder('이메일').fill('test@example.com')
    await page.getByRole('button', { name: '구독' }).click()

    await expect(page.getByText('잠시 후 다시 시도해 주세요.')).toBeVisible()
  })

  test('제출 중 버튼이 비활성화되고 ... 로 표시된다', async ({ page }) => {
    await page.route('/api/subscribe', async (route) => {
      await new Promise((r) => setTimeout(r, 500))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: '확인 이메일이 발송되었습니다.' }),
      })
    })

    await page.goto('/subscribe')
    await page.getByPlaceholder('이름').fill('홍길동')
    await page.getByPlaceholder('이메일').fill('test@example.com')
    await page.getByRole('button', { name: '구독' }).click()

    await expect(page.getByRole('button', { name: '...' })).toBeDisabled()
  })
})

test.describe('구독 완료 페이지(/subscribe/confirmed)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/subscribe/confirmed')
  })

  test('페이지 타이틀에 구독 완료가 포함된다', async ({ page }) => {
    await expect(page).toHaveTitle(/구독 완료/)
  })

  test('확인 완료 h1 제목이 표시된다', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: '구독이 확인되었습니다', level: 1 })
    ).toBeVisible()
  })

  test('안내 문구가 표시된다', async ({ page }) => {
    await expect(page.getByText(/이메일 인증이 완료되었습니다/)).toBeVisible()
  })

  test('블로그로 돌아가기 링크가 표시된다', async ({ page }) => {
    const link = page.getByRole('link', { name: '블로그로 돌아가기' })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', '/blog')
  })

  test('블로그로 돌아가기 링크 클릭 시 /blog로 이동한다', async ({ page }) => {
    await page.getByRole('link', { name: '블로그로 돌아가기' }).click()
    await expect(page).toHaveURL('/blog')
  })
})
