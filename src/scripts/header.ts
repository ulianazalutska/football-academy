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
