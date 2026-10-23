/* Повернення на те саме місце головної: при виході зі сторінки запам'ятовуємо прокрутку, а при поверненні
   (кнопка «На головну» на юридичних сторінках або «Назад» у браузері) повертаємо її. Висота сторінки ще росте
   (картинки, анімації), тому кілька разів уточнюємо позицію, поки користувачка сама не почала прокручувати. */
const Y_KEY = 'mainScrollY';
const BACK_KEY = 'restoreMain';

function read(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function initScrollRestore(): void {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  window.addEventListener('pagehide', () => {
    try {
      sessionStorage.setItem(Y_KEY, String(Math.round(window.scrollY)));
    } catch {
      /* без sessionStorage просто відкриється верх сторінки */
    }
  });

  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  const fromLegal = read(BACK_KEY) === '1';
  try {
    sessionStorage.removeItem(BACK_KEY);
  } catch {
    /* ігноруємо */
  }
  const y = Number(read(Y_KEY));
  if (!(fromLegal || nav?.type === 'back_forward') || location.hash || !Number.isFinite(y) || y <= 0) return;

  let userScrolled = false;
  const stop = (): void => {
    userScrolled = true;
  };
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach((ev) => window.addEventListener(ev, stop, { once: true, passive: true }));

  const go = (): void => {
    if (userScrolled || Math.abs(window.scrollY - y) < 2) return;
    window.scrollTo({ top: y, behavior: 'instant' });
  };
  go();
  window.addEventListener('load', go, { once: true });
  [150, 400, 900, 1600].forEach((ms) => window.setTimeout(go, ms));
}
