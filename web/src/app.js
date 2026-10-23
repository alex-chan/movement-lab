import { installLocaleUI } from './localeUI.js'
import { localeRedirect } from './localePreference.js'
import { resolveRoute } from './routes.js'
import { applyPageMetadata } from './pageMeta.js'
const route = resolveRoute(location.href, import.meta.env.BASE_URL)
let savedLocale
try { savedLocale = localStorage.getItem('movement.locale') } catch {}
const redirect = localeRedirect(location.href, {
  base: import.meta.env.BASE_URL,
  languages: navigator.languages?.length ? navigator.languages : [navigator.language],
  saved: savedLocale,
})
if (redirect) {
  location.replace(redirect)
} else {
  applyPageMetadata(route)
  // Legacy query links retain their animation but use the same canonical path.
  if (route.type !== 'missing') {
    const clean = new URL(route.path, new URL(import.meta.env.BASE_URL, location.origin))
    const params = new URLSearchParams(location.search)
    params.delete('exercise'); params.delete('view')
    clean.search = params.toString()
    clean.hash = location.hash
    if (clean.pathname !== location.pathname || clean.search !== location.search) history.replaceState(null, '', clean)
  }
  const isViewer = route.type === 'exercise' || route.type === 'atlas'
  document.documentElement.classList.toggle('library-root', !isViewer)
  if (route.type === 'missing') {
    document.querySelector('#viewer-shell')?.remove()
    const content = document.querySelector('#seo-content')
    if (content) content.innerHTML = '<h1>页面未找到</h1><p>这个动作尚不存在。</p><a href="./">返回动作库</a>'
  } else if (isViewer) {
    const shell = document.querySelector('#viewer-shell')
    if (route.type === 'exercise') document.body.classList.add('bench-mode')
    try {
      await import('./main.js')
    } catch (error) {
      // Keep the static instructions usable if the viewer module cannot load.
      document.documentElement.classList.remove('js')
      throw error
    }
    document.querySelector('#seo-content')?.remove()
    if (shell) shell.hidden = false
  } else {
    const { renderExerciseLibrary } = await import('./exerciseLibrary.js')
    renderExerciseLibrary(route.locale)
  }

  installLocaleUI(route)
}
