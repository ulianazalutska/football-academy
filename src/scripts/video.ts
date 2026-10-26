import { bindVideoToggle } from './video-toggle';

/* 07 Відео: грає на місці по кліку, без звуку, без автозапуску. Клік: відео йде, ▶ зникає; ще клік: пауза, ▶ повертається. */
export function initVideo(): void {
  const box = document.querySelector<HTMLElement>('.video__box');
  const video = box?.querySelector<HTMLVideoElement>('.video__el');
  if (!box || !video) return;
  bindVideoToggle(box, video);
}
