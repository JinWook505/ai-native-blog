import { test, expect } from '@playwright/test'

test.describe('홈페이지 접속 및 기본 요소 확인', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('페이지 타이틀이 올바르게 표시된다', async ({ page }) => {
    await expect(page).toHaveTitle('Next.js Portfolio Starter')
  })

  test('h1 제목이 표시된다', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'My Portfolio', level: 1 })).toBeVisible()
  })

  test('소개 문단이 표시된다', async ({ page }) => {
    await expect(page.getByText(/Vim enthusiast/)).toBeVisible()
  })

  test('네비게이션 링크가 모두 표시된다', async ({ page }) => {
    const nav = page.getByRole('navigation')
    await expect(nav.getByRole('link', { name: 'home' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'blog' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'deploy' })).toBeVisible()
  })

  test('홈페이지에 최신 블로그 포스트 목록이 표시된다', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Embracing Vim/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Spaces vs. Tabs/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Static Typing/ })).toBeVisible()
  })

  test('푸터의 저작권 문구가 표시된다', async ({ page }) => {
    await expect(page.getByText(/MIT Licensed/)).toBeVisible()
  })
})

test.describe('블로그 목록 페이지에서 포스트 확인', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog')
  })

  test('페이지 타이틀에 Blog가 포함된다', async ({ page }) => {
    await expect(page).toHaveTitle(/Blog/)
  })

  test('블로그 목록 h1 제목이 표시된다', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'My Blog', level: 1 })).toBeVisible()
  })

  test('세 개의 블로그 포스트가 모두 표시된다', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Embracing Vim/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Spaces vs\. Tabs/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Static Typing/ })).toBeVisible()
  })

  test('포스트에 발행일이 표시된다', async ({ page }) => {
    await expect(page.getByText('April 9, 2024')).toBeVisible()
    await expect(page.getByText('April 8, 2024')).toBeVisible()
    await expect(page.getByText('April 7, 2024')).toBeVisible()
  })

  test('포스트 링크가 올바른 URL을 가진다', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Embracing Vim/ })).toHaveAttribute('href', '/blog/vim')
    await expect(page.getByRole('link', { name: /Spaces vs\. Tabs/ })).toHaveAttribute('href', '/blog/spaces-vs-tabs')
    await expect(page.getByRole('link', { name: /Static Typing/ })).toHaveAttribute('href', '/blog/static-typing')
  })

  test('포스트가 최신순으로 정렬된다', async ({ page }) => {
    const links = page.getByRole('link', { name: /\d{4}/ })
    const texts = await links.allTextContents()
    expect(texts[0]).toMatch(/April 9/)
    expect(texts[1]).toMatch(/April 8/)
    expect(texts[2]).toMatch(/April 7/)
  })

  test('홈 네비게이션으로 이동할 수 있다', async ({ page }) => {
    await page.getByRole('navigation').getByRole('link', { name: 'home' }).click()
    await expect(page).toHaveURL('/')
  })
})

test.describe('개별 블로그 포스트 페이지 접근 및 콘텐츠 확인', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog/vim')
  })

  test('페이지 타이틀에 포스트 제목이 포함된다', async ({ page }) => {
    await expect(page).toHaveTitle(/Embracing Vim/)
  })

  test('포스트 제목이 h1으로 표시된다', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Embracing Vim: The Unsung Hero of Code Editors', level: 1 })
    ).toBeVisible()
  })

  test('발행일이 표시된다', async ({ page }) => {
    await expect(page.getByText('April 9, 2024')).toBeVisible()
  })

  test('본문 아티클이 렌더링된다', async ({ page }) => {
    const article = page.getByRole('article')
    await expect(article).toBeVisible()
    await expect(article.getByRole('heading', { name: 'Efficiency and Speed' })).toBeVisible()
    await expect(article.getByRole('heading', { name: 'Highly Customizable' })).toBeVisible()
    await expect(article.getByRole('heading', { name: 'Conclusion' })).toBeVisible()
  })

  test('본문 첫 문단이 표시된다', async ({ page }) => {
    await expect(page.getByText(/timeless classic/)).toBeVisible()
  })

  test('작성자 프로필이 표시된다', async ({ page }) => {
    await expect(page.getByText('Your Name Sir')).toBeVisible()
    await expect(page.getByText(/Software engineer/)).toBeVisible()
  })

  test('블로그 목록 페이지로 이동할 수 있다', async ({ page }) => {
    await page.getByRole('navigation').getByRole('link', { name: 'blog' }).click()
    await expect(page).toHaveURL('/blog')
    await expect(page.getByRole('heading', { name: 'My Blog', level: 1 })).toBeVisible()
  })

  test('블로그 목록에서 포스트 클릭으로 진입한다', async ({ page }) => {
    await page.goto('/blog')
    await page.getByRole('link', { name: /Spaces vs\. Tabs/ }).click()
    await expect(page).toHaveURL('/blog/spaces-vs-tabs')
    await expect(
      page.getByRole('heading', { name: /Spaces vs. Tabs/, level: 1 })
    ).toBeVisible()
  })
})
