import { expect, test, type Locator, type Page } from '@playwright/test'

// Regression test for a specificity bug: .sidebar__link:hover (0-2-0) beat
// .sidebar__link--active (0-1-0) on background-color while leaving
// --active's white text color untouched, making text disappear whenever
// the currently-active link was hovered.
//
// Sidebar only renders behind a protected route, and there's no test
// account set up yet to log in with (see CLAUDE.md Backlog), so this
// loads the real source CSS files directly into a blank page instead of
// going through the full authenticated app - still a real browser, real
// :hover, real cascade, just without auth in the way.
const NAV_LABELS = ['Rekrytering', 'Jobb', 'Kandidater', 'Kunder & konton', 'Inställningar']
const MIN_CONTRAST_RATIO = 4.5 // WCAG AA for normal-size text

function parseRgb(value: string): [number, number, number] {
  const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!match) {
    throw new Error(`Could not parse color: ${value}`)
  }
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((channel) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function contrastRatio(colorA: string, colorB: string): number {
  const luminanceA = relativeLuminance(parseRgb(colorA))
  const luminanceB = relativeLuminance(parseRgb(colorB))
  const lighter = Math.max(luminanceA, luminanceB)
  const darker = Math.min(luminanceA, luminanceB)
  return (lighter + 0.05) / (darker + 0.05)
}

// Walks up from the link to find the color it's actually painted against -
// the link itself has no background in the rest state (only :hover/
// --active set one directly), so the effective background is .sidebar's.
async function getEffectiveColors(link: Locator) {
  return link.evaluate((el) => {
    function isTransparent(color: string) {
      return color === 'rgba(0, 0, 0, 0)' || color === 'transparent'
    }
    let node: Element | null = el
    let backgroundColor = 'rgba(0, 0, 0, 0)'
    while (node) {
      const style = getComputedStyle(node)
      if (!isTransparent(style.backgroundColor)) {
        backgroundColor = style.backgroundColor
        break
      }
      node = node.parentElement
    }
    return { color: getComputedStyle(el).color, backgroundColor }
  })
}

async function renderSidebar(page: Page, activeLabel: string | null) {
  const items = NAV_LABELS.map((label) => {
    const activeClass = label === activeLabel ? ' sidebar__link--active' : ''
    return `<li><a href="#" class="sidebar__link${activeClass}">${label}</a></li>`
  }).join('')
  await page.setContent(`<nav class="sidebar"><ul class="sidebar__list">${items}</ul></nav>`)
  // Real source files, not hand-copied CSS - stays correct if tokens or
  // the sidebar's styles change later.
  await page.addStyleTag({ path: 'src/styles/tokens.css' })
  await page.addStyleTag({ path: 'src/components/Sidebar.css' })
}

test.describe('sidebar nav link text contrast', () => {
  for (const activeLabel of [null, ...NAV_LABELS] as const) {
    const description = activeLabel ? `"${activeLabel}" is the active link` : 'no link is active'

    test(`every link stays readable at rest and on hover (${description})`, async ({ page }) => {
      await renderSidebar(page, activeLabel)

      for (const label of NAV_LABELS) {
        const link = page.getByRole('link', { name: label, exact: true })

        const rest = await getEffectiveColors(link)
        expect(
          contrastRatio(rest.color, rest.backgroundColor),
          `${label} at rest: ${rest.color} on ${rest.backgroundColor}`,
        ).toBeGreaterThanOrEqual(MIN_CONTRAST_RATIO)

        await link.hover()
        const hovered = await getEffectiveColors(link)
        expect(
          contrastRatio(hovered.color, hovered.backgroundColor),
          `${label} on hover: ${hovered.color} on ${hovered.backgroundColor}`,
        ).toBeGreaterThanOrEqual(MIN_CONTRAST_RATIO)

        // So the next link's rest-state check isn't itself still hovered.
        await page.mouse.move(0, 0)
      }
    })
  }
})
