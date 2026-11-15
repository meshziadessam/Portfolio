'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function Effects() {
  const path = usePathname();
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let cancelled = false;
    let dispose = () => {};
    void import('gsap').then(({gsap}) => {
      if (cancelled) return;
      const context = gsap.context(() => {
        gsap.fromTo('.entrance', {opacity: .35, y: 18}, {opacity:1, y:0, duration:.62, stagger:.08, clearProps:'all'});
      });
      const observer = new IntersectionObserver(entries => {
        entries.forEach(({target,isIntersecting}) => {
          if (!isIntersecting) return;
          observer.unobserve(target);
          context.add(() => gsap.fromTo(target, {y:14}, {y:0,duration:.6,clearProps:'all'}));
        });
      }, {threshold:.12});
      document.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));
      dispose = () => {observer.disconnect(); context.revert();};
    });
    return () => {cancelled = true; dispose();};
  }, [path]);
  return null;
}