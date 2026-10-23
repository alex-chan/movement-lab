import { supportedLocale, localePath } from './localization.js'
import { resolveRoute } from './routes.js'

export function preferredLocale(languages = [], saved) {
  if (supportedLocale(saved)) return saved
  for (const language of languages) {
    const locale = String(language).toLowerCase().split(/[-_]/)[0]
    if (supportedLocale(locale)) return locale
  }
  return 'en'
}

export function localeRedirect(href, { base = '/', languages = [], saved } = {}) {
  const url = new URL(href)
  const prefix = url.pathname.slice(base.length).split('/')[0]
  // A shared, explicitly localized URL must keep its requested language.
  if (supportedLocale(prefix)) return null
  const route = resolveRoute(href, base)
  if (route.type === 'missing') return null
  const locale = preferredLocale(languages, saved)
  if (locale === route.locale) return null
  url.pathname = base + localePath(route.basePath, locale)
  return url.href
}
