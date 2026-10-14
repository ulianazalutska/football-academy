import { gsap } from 'gsap';

/* 02 Hero: вступна поява (спокійна, ~2,5 с). Без анімації, якщо користувач просить менше руху. */
function playIntro(): void {
  const root = document.documentElement;
  if (!root.classList.contains('has-intro')) return;

  const q = <T extends Element>(sel: string): T[] => Array.from(document.querySelectorAll<T>(sel));
  const header = document.getElementById('header');
  const frame = document.querySelector<HTMLElement>('.hero__frame');
  const bg = document.querySelector<HTMLElement>('.hero__bg');
  const titleLines = q('.hero__title .hero__line-break');
  const textLines = q('.hero__text .hero__line-break');
  const thumbs = q('.hero__thumb');
  const tab = document.querySelector<HTMLElement>('.hero__tab');
  const paths = q<SVGPolylineElement>('.hero__line polyline');
  if (!header || !frame || !bg || !tab) return;

  /* лінії-виноски малюються від фото до гравчині */
  paths.forEach((p) => p.setAttribute('pathLength', '1'));
  gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 });

  const done = (): void => {
    root.classList.remove('has-intro');
    gsap.set([header, frame, ...titleLines, ...textLines, ...thumbs, tab], { clearProps: 'all' });
    gsap.set(paths, { clearProps: 'all' });
  };

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: done });

  /* показуємо елементи вже у стартовому стані, тож блимання немає */
  gsap.set(frame, { opacity: 0, y: 48, scale: 0.97 });
  gsap.set(bg, { scale: 1.18 });
  gsap.set(titleLines, { opacity: 0, y: 36, filter: 'blur(8px)' });
  gsap.set(textLines, { opacity: 0, y: 24 });
  gsap.set(thumbs, { opacity: 0, y: 28, scale: 0.9 });
  gsap.set(tab, { opacity: 0, yPercent: 100 });
  gsap.set(header, { opacity: 0, y: -24, transition: 'none' });
  root.classList.remove('has-intro');

  tl.to(frame, { opacity: 1, y: 0, scale: 1, duration: 1.4, ease: 'power3.out' }, 0)
    .to(bg, { scale: 1, duration: 2.8, ease: 'power2.out' }, 0)
    .to(header, { opacity: 1, y: 0, duration: 1, clearProps: 'transform' }, 0.5)
    .to(titleLines, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, stagger: 0.16 }, 0.7)
    .to(textLines, { opacity: 1, y: 0, duration: 1, stagger: 0.1 }, 1.15)
    .to(thumbs, { opacity: 1, y: 0, scale: 1, duration: 1.1, stagger: 0.18, ease: 'back.out(1.3)' }, 1.5)
    .to(paths, { strokeDashoffset: 0, duration: 1.1, stagger: 0.18, ease: 'power2.inOut' }, 1.9)
    .to(tab, { opacity: 1, yPercent: 0, duration: 0.9 }, 2.1);
}

/* 02 Hero: відео-мініатюра. Наведення: лише cursor pointer. Клік: відео йде, кнопка ▶ зникає; ще клік: пауза, кнопка повертається. */
export function initHero(): void {
  playIntro();

  const box = document.querySelector<HTMLElement>('.hero__video');
  const video = box?.querySelector<HTMLVideoElement>('.hero__video-el');
  if (!box || !video) return;

  const play = (): void => {
    void video.play().catch(() => undefined);
  };
  const toggle = (): void => {
    if (video.paused) play();
    else video.pause();
  };

  video.addEventListener('play', () => box.classList.add('is-playing'));
  video.addEventListener('pause', () => box.classList.remove('is-playing'));

  box.addEventListener('click', toggle);
  box.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  });
}
