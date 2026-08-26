/**
 * Per-page SEO. Wraps useSeoMeta so every page also emits the OpenGraph and
 * Twitter Card tags, which were previously missing everywhere: only the
 * i18n module's automatic og:url / og:locale were present, so a link shared
 * on LinkedIn, WhatsApp or X rendered with no image, no title and no
 * description.
 *
 * Title and description are passed as getters (not plain strings) so they
 * re-evaluate when the locale changes — the same contract useSeoMeta itself
 * uses, and the reason the pages already declared them that way.
 */
interface PageSeoOptions {
  title: () => string
  description: () => string
}

export function usePageSeo({ title, description }: PageSeoOptions) {
  const siteUrl = useSiteConfig().url

  // Absolute URL required: crawlers do not resolve relative og:image paths.
  // 1200x630 is the size LinkedIn/X/WhatsApp all crop from cleanly.
  const ogImage = `${siteUrl.replace(/\/$/, '')}/og-image.png`

  useSeoMeta({
    title,
    description,

    ogTitle: title,
    ogDescription: description,
    ogType: 'website',
    ogSiteName: 'CorosDev',
    ogImage,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageType: 'image/png',
    ogImageAlt: 'CorosDev',

    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: ogImage,
    twitterImageAlt: 'CorosDev',
  })
}
