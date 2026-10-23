import './styles/legal.css';
import { initI18n } from './i18n';
import { enLegal } from './i18n/en-legal';

initI18n(enLegal);

/* «На головну» і логотип: повертають на те місце головної, звідки користувачка прийшла (див. scroll-restore.ts) */
document.querySelectorAll<HTMLAnchorElement>('.legal-header a[href="/"]').forEach((link) => {
  link.addEventListener('click', () => {
    try {
      sessionStorage.setItem('restoreMain', '1');
    } catch {
      /* без sessionStorage відкриється верх головної */
    }
  });
});
