/* Перемикач UA/EN. Українські тексти лишаються в index.html, переклади лежать у en.ts (ключ — український текст).
   При перемиканні проходимо всі текстові вузли й атрибути (alt, aria-label, placeholder, title, content мета-тегів)
   і підставляємо переклад; вибір запам'ятовується в localStorage. Вузли, створені скриптами, теж підхоплюються. */
import { en } from './en';

export type Lang = 'uk' | 'en';

const STORAGE_KEY = 'lang';
const ATTRS = ['alt', 'aria-label', 'placeholder', 'title', 'content'];
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA']);
const CYRILLIC = /[А-Яа-яІіЇїЄєҐґ]/;

const norm = (s: string): string => s.replace(/\s+/g, ' ').trim();

const dict = new Map<string, string>(Object.entries(en).map(([k, v]) => [norm(k), v]));
const reverse = new Map<string, string>();
dict.forEach((v, k) => reverse.has(v) || reverse.set(v, k));

let lang: Lang = 'uk';
const textSrc = new WeakMap<Text, string>();
const attrSrc = new WeakMap<Element, Map<string, string>>();
const warned = new Set<string>();

/* український першоджерельний ключ для рядка, який зараз показано (українського або англійського) */
function sourceOf(shown: string): string {
  const key = norm(shown);
  if (dict.has(key)) return key;
  return reverse.get(key) ?? key;
}

function translate(src: string): string {
  if (lang !== 'en') return src;
  const out = dict.get(src);
  if (out === undefined) {
    if (import.meta.env.DEV && CYRILLIC.test(src) && !warned.has(src)) {
      warned.add(src);
      console.warn('[i18n] немає перекладу:', src);
    }
    return src;
  }
  return out;
}

export function getLang(): Lang {
  return lang;
}

/* переклад рядка з коду: t('Закрити меню') */
export function t(uk: string): string {
  return lang === 'en' ? (dict.get(norm(uk)) ?? uk) : uk;
}

/* повертає український оригінал для показаного рядка (потрібен, коли значення йдуть у форму) */
export function toUk(shown: string): string {
  return sourceOf(shown);
}

function applyText(node: Text): void {
  const raw = node.nodeValue ?? '';
  if (!norm(raw)) return;
  let src = textSrc.get(node);
  if (src === undefined || translate(src) !== norm(raw)) {
    /* вузол новий або його текст змінив скрипт: пересчитуємо першоджерело */
    src = sourceOf(raw);
    textSrc.set(node, src);
  }
  const lead = raw.match(/^\s*/)?.[0] ?? '';
  const trail = raw.match(/\s*$/)?.[0] ?? '';
  const next = lead + translate(src) + trail;
  if (next !== raw) node.nodeValue = next;
}

function applyAttrs(el: Element): void {
  let saved = attrSrc.get(el);
  for (const name of ATTRS) {
    const raw = el.getAttribute(name);
    if (!raw || !norm(raw)) continue;
    if (name === 'content' && el.tagName !== 'META') continue;
    if (!saved) attrSrc.set(el, (saved = new Map()));
    let src = saved.get(name);
    if (src === undefined || translate(src) !== norm(raw)) {
      src = sourceOf(raw);
      saved.set(name, src);
    }
    const next = translate(src);
    if (next !== raw) el.setAttribute(name, next);
  }
}

function applyAll(): void {
  const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.parentElement && SKIP_TAGS.has(n.parentElement.tagName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  const nodes: Text[] = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) nodes.push(n as Text);
  nodes.forEach(applyText);
  document.querySelectorAll('[alt], [aria-label], [placeholder], [title], meta[content]').forEach(applyAttrs);
}

function applyLang(next: Lang): void {
  lang = next;
  document.documentElement.lang = next;
  document.querySelector('meta[property="og:locale"]')?.setAttribute('content', next === 'en' ? 'en_US' : 'uk_UA');
  applyAll();
  document.querySelectorAll<HTMLButtonElement>('.lang-switch__btn[lang]').forEach((btn) => {
    const on = btn.lang === next;
    btn.setAttribute('aria-pressed', String(on));
    /* поточна мова сіра, інша — зелена (як у макеті, де активна UA) */
    btn.classList.toggle('lang-switch__btn--green', !on);
  });
}

let switching = false;

/* перехід як при перезавантаженні: біла завіса проявляється, під нею міняється мова, завіса плавно знімається */
export function setLang(next: Lang): void {
  if (next === lang || switching) return;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* приватний режим: мова просто не запам'ятається */
  }
  let committed = false;
  const commit = (): void => {
    if (committed) return;
    committed = true;
    applyLang(next);
    document.dispatchEvent(new CustomEvent<Lang>('langchange', { detail: next }));
  };
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('animate' in Element.prototype)) {
    commit();
    return;
  }
  switching = true;
  const veil = document.createElement('div');
  veil.setAttribute('aria-hidden', 'true');
  veil.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#fff;opacity:0;pointer-events:all';
  document.body.append(veil);
  const fade = (to: number, ms: number): Promise<unknown> =>
    veil.animate([{ opacity: 1 - to }, { opacity: to }], { duration: ms, easing: 'ease-in-out', fill: 'forwards' }).finished;
  const done = (): void => {
    veil.remove();
    switching = false;
  };
  fade(1, 320)
    .then(() => {
      commit();
      return new Promise((r) => window.setTimeout(r, 120));
    })
    .then(() => fade(0, 520))
    .finally(done);
  /* запобіжник: якщо анімація не завершилась (вкладка у фоні), завіса все одно зникне */
  window.setTimeout(() => {
    commit();
    done();
  }, 1800);
}

export function initI18n(extra: Record<string, string> = {}): void {
  Object.entries(extra).forEach(([k, v]) => {
    dict.set(norm(k), v);
    reverse.has(v) || reverse.set(v, norm(k));
  });
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch {
    /* localStorage недоступний */
  }
  applyLang(saved === 'en' ? 'en' : 'uk');
  document.querySelectorAll<HTMLButtonElement>('.lang-switch__btn[lang]').forEach((btn) => {
    btn.addEventListener('click', () => setLang(btn.lang === 'en' ? 'en' : 'uk'));
  });
}
