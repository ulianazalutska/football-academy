/* 09 Тренерки: слайдер на 5 слайдів, стрілки без циклу (ліва неактивна на 1-му, права на 5-му),
   мініатюра показує наступну тренерку. Перехід: плавне згасання з легким зсувом, потім поява нової тренерки (моє припущення). Без автопрокрутки. */
import { gsap } from 'gsap';
import { t } from '../i18n';

const COACHES = [
  { name: 'Олена Коваль', role: 'засновниця, головна тренерка', quote: 'У тринадцять я була єдиною дівчиною в команді хлопців. Тепер я хочу, щоб жодна дівчина не мусила доводити все сама', alt: 'Олена Коваль, засновниця й головна тренерка GIRLS XI, з планшетом під час тренування' },
  { name: 'Ганна Мельник', role: 'керівниця спортивної науки', quote: 'Жіноче тіло росте інакше, і тренування мають це враховувати. Ми бережемо коліна гравчинь із дванадцяти, щоб вони грали роками', alt: 'Ганна Мельник, керівниця спортивної науки GIRLS XI, на футбольному полі' },
  { name: 'Софія Литвин', role: 'тренерка програми «Еліт»', quote: "Талант відкриває двері, але далі грає характер. Я шукаю тих, хто після помилки просить м'яч знову", alt: 'Софія Литвин, тренерка програми «Еліт» академії GIRLS XI' },
  { name: 'Марія Бондар', role: 'тренерка воротарок', quote: 'Воротарка бачить усе поле першою. Тому для мене вона не остання лінія оборони, а перша лідерка команди', alt: 'Марія Бондар, тренерка воротарок академії GIRLS XI' },
  { name: 'Дарина Ткаченко', role: 'спортивна психологиня', quote: 'Впевненість тренують, як удар чи пас. Голова часто вирішує матч раніше, ніж ноги', alt: 'Дарина Ткаченко, спортивна психологиня академії GIRLS XI' },
];

export function initCoaches(): void {
  const root = document.querySelector<HTMLElement>('.coaches');
  if (!root) return;
  const photo = root.querySelector<HTMLImageElement>('.coaches__photo')!;
  const thumb = root.querySelector<HTMLImageElement>('.coaches__thumb')!;
  const quote = root.querySelector<HTMLElement>('.coaches__quote')!;
  const name = root.querySelector<HTMLElement>('.coaches__name')!;
  const cur = root.querySelector<HTMLElement>('.coaches__cur')!;
  const prev = root.querySelector<HTMLButtonElement>('.coaches__arrow--prev')!;
  const next = root.querySelector<HTMLButtonElement>('.coaches__arrow--next')!;
  let i = 0;
  COACHES.forEach((_, k) => {
    new Image().src = `/images/coach-${k + 1}.webp`;
    new Image().src = `/images/coach-${k + 1}-thumb.webp`;
  });

  const render = (): void => {
    const c = COACHES[i];
    const n = COACHES[(i + 1) % COACHES.length];
    photo.src = `/images/coach-${i + 1}.webp`;
    photo.alt = t(c.alt);
    quote.textContent = t(c.quote);
    name.textContent = `${t(c.name)} / ${t(c.role)}`;
    thumb.src = `/images/coach-${((i + 1) % COACHES.length) + 1}-thumb.webp`;
    thumb.alt = `${t(n.name)}, ${t(n.role)}`;
    cur.textContent = String(i + 1);
    prev.disabled = i === 0;
    next.disabled = i === COACHES.length - 1;
  };

  const photoEls = [photo, thumb];
  const textEls = [quote, name, cur];
  let busy = false;

  const go = (dir: 1 | -1): void => {
    const target = i + dir;
    if (busy || target < 0 || target >= COACHES.length) return;
    busy = true;
    const shift = dir * 24;
    gsap
      .timeline({ onComplete: () => { busy = false; } })
      .to(photoEls, { opacity: 0, duration: 0.35, ease: 'power2.in' }, 0)
      .to(textEls, { opacity: 0, x: -shift, duration: 0.3, ease: 'power2.in' }, 0)
      .add(() => { i = target; render(); gsap.set(textEls, { x: shift }); })
      .to(photoEls, { opacity: 1, duration: 0.55, ease: 'power2.out' })
      .to(textEls, { opacity: 1, x: 0, duration: 0.55, ease: 'power2.out' }, '<');
  };

  document.addEventListener('langchange', render);
  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
}
