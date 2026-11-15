'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { site } from '../config/site';

const positions = [
  {top: '24%', left: '8%'}, {top: '43%', left: '92%'},
  {top: '62%', left: '5%'}, {top: '76%', left: '95%'},
  {top: '34%', left: '14%'}, {top: '54%', left: '82%'},
];

export function RadarGame() {
  const [placement, setPlacement] = useState<{page: HTMLElement; index: number}>();
  const [reading, setReading] = useState<{angle: number; distance: number}>();
  const target = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const page = document.getElementById('landing');
    if (!page) return;
    const frame = requestAnimationFrame(() => {
      setPlacement({page, index: Math.floor(Math.random() * positions.length)});
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!placement) return;
    let pointer: {x: number; y: number} | undefined;
    let frame = 0;

    function measure() {
      if (!pointer || !target.current) return;
      const rect = target.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2 - pointer.x;
      const y = rect.top + rect.height / 2 - pointer.y;
      setReading({angle: Math.atan2(x, -y) * 180 / Math.PI, distance: Math.round(Math.hypot(x, y))});
    }
    function schedule() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    }
    function track(event: PointerEvent) {
      pointer = {x: event.clientX, y: event.clientY};
      schedule();
    }

    window.addEventListener('pointermove', track, {passive: true});
    window.addEventListener('pointerdown', track, {passive: true});
    window.addEventListener('scroll', schedule, {passive: true});
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', track);
      window.removeEventListener('pointerdown', track);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [placement]);

  const compose = new URL('https://mail.google.com/mail/');
  compose.search = new URLSearchParams({
    view: 'cm', fs: '1',
    ...(site.email ? {to: site.email} : {}),
    body: 'I completed the challenge',
  }).toString();

  const distance = reading?.distance;
  const feedback = distance === undefined ? 'Move or tap to locate the signal'
    : distance <= 30 ? 'Signal locked'
    : distance <= 100 ? 'Very close'
    : distance <= 250 ? 'Getting warmer'
    : 'Signal far away';
  const strength = distance === undefined ? 0 : Math.max(0, 1 - distance / 600);
  const wave = Array.from({length: 101}, (_, index) => {
    const x = index * 2.4;
    const y = 18 - (2 + strength * 13) * Math.sin(index / 100 * Math.PI * 2 * (2 + strength * 5));
    return (index === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
  }).join(' ');

  return <>
    <div className="radar-locator">
      <div className="radar" aria-hidden="true">
        <div className="radar-sweep"/>
        <b/><b/><b/>
        {reading && <span className="locator-needle" style={{rotate: reading.angle + 'deg'}}/>}
      </div>
      <svg className="locator-wave" viewBox="0 0 240 36" aria-hidden="true">
        <path className="locator-wave-base" d="M0 18H240"/>
        <path className="locator-wave-signal" d={wave}/>
      </svg>
      <p className="locator-readout">{feedback}</p>
    </div>
    {placement && createPortal(
      <button ref={target} type="button" className="hidden-signal" style={{...positions[placement.index], top: `min(${positions[placement.index].top}, max(20px, calc(100dvh - var(--header-height, 4.5rem) - 24px)))`}}
        onClick={() => dialog.current?.showModal()} aria-label="Hidden challenge"/>,
      placement.page,
    )}
    <dialog ref={dialog} className="challenge-dialog" aria-labelledby="challenge-title">
      <div className="challenge-burst" aria-hidden="true">{Array.from({length: 12}, (_, index) => <i key={index} style={{rotate: index * 30 + 'deg'}}/>)}</div>
      <h2 id="challenge-title">You completed the challenge</h2>
      <p>Open Gmail to send your completion message.</p>
      <div className="hero-actions">
        <a className="button" href={compose.href} target="_blank" rel="noopener noreferrer">Open Gmail</a>
        <form method="dialog"><button className="text-link" type="submit">Close</button></form>
      </div>
    </dialog>
  </>;
}