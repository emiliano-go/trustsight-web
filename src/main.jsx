import './styles.css'

const INSTALL = {
  https: 'git clone https://github.com/emiliano-go/trustsight.git\ncd trustsight/packaging/aur && makepkg -si\ntrustsight review',
  ssh: 'git clone git@github.com:emiliano-go/trustsight.git\ncd trustsight/packaging/aur && makepkg -si\ntrustsight review',
}

const root = document.documentElement

function saved(key) {
  try { return localStorage.getItem(key) } catch { return null }
}

function persist(key, value) {
  try { localStorage.setItem(key, value) } catch {}
}

function setTheme(theme) {
  root.dataset.theme = theme
  const dark = theme === 'dark'
  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.classList.toggle('is-dark', dark)
    button.setAttribute('aria-checked', String(dark))
    button.querySelector('[data-theme-sun]')?.classList.toggle('is-active', !dark)
    button.querySelector('[data-theme-moon]')?.classList.toggle('is-active', dark)
  })
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.content = dark ? '#0D1117' : '#FBFBF9'
  persist('ts-theme', theme)
}

function setPreference(kind, value) {
  if (kind === 'font-size') root.dataset.fontSize = value
  else root.dataset.contrast = value
  persist(`ts-${kind}`, value)
  document.querySelectorAll(`[data-${kind}]`).forEach((button) => {
    const active = button.dataset[kind] === value
    button.classList.toggle('is-on', active)
    button.setAttribute('aria-pressed', String(active))
  })
}

function selectPreference(kind, value) {
  document.querySelectorAll(`[data-${kind}]`).forEach((button) => {
    const active = button.dataset[kind] === value
    button.classList.toggle('is-on', active)
    button.setAttribute('aria-pressed', String(active))
  })
}

function setProtocol(card, protocol) {
  const ssh = protocol === 'ssh'
  card.dataset.protocol = protocol
  card.querySelector('[data-protocol-toggle]')?.classList.toggle('is-ssh', ssh)
  card.querySelector('[data-protocol-toggle]')?.setAttribute('aria-checked', String(ssh))
  card.querySelector('[data-protocol-toggle]')?.setAttribute('aria-label', `Switch to ${ssh ? 'HTTPS' : 'SSH'} clone URL`)
  card.querySelector('[data-protocol-https]')?.classList.toggle('is-active', !ssh)
  card.querySelector('[data-protocol-ssh]')?.classList.toggle('is-active', ssh)
  const url = card.querySelector('[data-install-url]')
  if (url) url.textContent = INSTALL[protocol].split('\n')[0]
  const label = card.querySelector('[data-install-protocol]')
  if (label) label.textContent = `Install using ${protocol}: `
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.cssText = 'position:fixed;opacity:0'
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  textarea.remove()
  return copied
}

async function copy(card) {
  const text = INSTALL[card.dataset.protocol || 'https']
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    if (!fallbackCopy(text)) return
  }
  const button = card.querySelector('[data-copy]')
  const status = card.querySelector('[data-copy-status]')
  if (button) button.textContent = 'copied ✓'
  if (status) status.textContent = 'Install commands copied to clipboard.'
  window.setTimeout(() => { if (button) button.textContent = 'copy' }, 2000)
}

function setA11yOpen(open, focus = false) {
  const panel = document.getElementById('accessibility-settings')
  const button = document.querySelector('[data-a11y-toggle]')
  if (!panel || !button) return
  panel.hidden = !open
  button.classList.toggle('is-open', open)
  button.setAttribute('aria-expanded', String(open))
  if (focus) button.focus()
}

setTheme(root.dataset.theme === 'light' ? 'light' : 'dark')
setPreference('font-size', saved('ts-font-size') === 'large' ? 'large' : 'normal')
const contrast = saved('ts-contrast')
if (contrast === 'high' || contrast === 'normal') setPreference('contrast', contrast)
else selectPreference('contrast', 'normal')
document.querySelectorAll('[data-install]').forEach((card) => setProtocol(card, 'https'))

document.addEventListener('click', (event) => {
  const target = event.target.closest('button')
  if (!target) return
  if (target.matches('[data-theme-toggle]')) {
    setTheme(root.dataset.theme === 'light' ? 'dark' : 'light')
    return
  }
  if (target.matches('[data-a11y-toggle]')) {
    setA11yOpen(target.getAttribute('aria-expanded') !== 'true')
    return
  }
  if (target.matches('[data-font-size]')) return setPreference('font-size', target.dataset.fontSize)
  if (target.matches('[data-contrast]')) return setPreference('contrast', target.dataset.contrast)
  const card = target.closest('[data-install]')
  if (!card) return
  if (target.matches('[data-protocol-toggle]')) {
    setProtocol(card, card.dataset.protocol === 'ssh' ? 'https' : 'ssh')
  } else if (target.matches('[data-copy]')) {
    copy(card)
  }
})

document.addEventListener('pointerdown', (event) => {
  const wrap = document.querySelector('[data-a11y-wrap]')
  if (wrap && !wrap.contains(event.target)) setA11yOpen(false)
})
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setA11yOpen(false, true)
})
