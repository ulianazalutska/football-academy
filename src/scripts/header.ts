import { t } from '../i18n';

/* 01 Шапка: ховання при скролі вниз, показ при скролі вгору, активний пункт меню */
export function initHeader(): void {
  const header = document.getElementById('header');
  if (!header) return;

  let lastY = window.scrollY;
  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY;
      const delta = y - lastY;
      if (Math.abs(delta) < 6) return;
      header.classList.toggle('header--hidden', delta > 0 && y > header.offsetHeight);
      lastY = y;
    },
    { passive: true },
  );

  const burger = header.querySelector<HTMLButtonElement>('.header__burger');
  const setMenu = (open: boolean): void => {
    header.classList.toggle('header--menu-open', open);
    document.documentElement.classList.toggle('is-menu-open', open);
    burger?.setAttribute('aria-expanded', String(open));
    burger?.setAttribute('aria-label', t(open ? 'Закрити меню' : 'Відкрити меню'));
  };
  burger?.addEventListener('click', () => setMenu(!header.classList.contains('header--menu-open')));
  header.querySelectorAll('.header__link, .header__cta, .header__menu-cta').forEach((el) => el.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
  });
  window.matchMedia('(min-width: 1069px)').addEventListener('change', (e) => {
    if (e.matches) setMenu(false);
  });

  const links = Array.from(header.querySelectorAll<HTMLAnchorElement>('.header__link'));
  const targets = links
    .map((link) => document.querySelector<HTMLElement>(link.hash))
    .filter((el): el is HTMLElement => el !== null);
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        links.forEach((link) => link.classList.toggle('is-active', link.hash === `#${entry.target.id}`));
      }
    },
    { rootMargin: '-40% 0px -55% 0px' },
  );
  targets.forEach((el) => observer.observe(el));
}
