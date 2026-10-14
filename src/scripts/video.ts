/* 07 Відео: грає на місці по кліку, без звуку, без автозапуску. Клік: відео йде, ▶ зникає; ще клік: пауза, ▶ повертається. */
export function initVideo(): void {
  const box = document.querySelector<HTMLElement>('.video__box');
  const video = box?.querySelector<HTMLVideoElement>('.video__el');
  if (!box || !video) return;

  const toggle = (): void => {
    if (video.paused) void video.play().catch(() => undefined);
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
