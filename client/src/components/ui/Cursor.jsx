import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/scroll';

export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return undefined;

    // Hide default cursor
    document.body.style.cursor = 'none';

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return undefined;

    let mouseX = 0, mouseY = 0;

    const moveDot = gsap.quickTo(dot, 'css', { duration: 0.1 });
    const moveRing = gsap.quickTo(ring, 'css', { duration: 0.45, ease: 'power2.out' });

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      moveDot({ x: mouseX - 6, y: mouseY - 6 });
      moveRing({ x: mouseX - 20, y: mouseY - 20 });
    };

    const onEnterInteractive = () => {
      gsap.to(ring, { scale: 1.8, borderColor: '#E8C97A', duration: 0.3 });
      gsap.to(dot, { scale: 0, duration: 0.2 });
    };

    const onLeaveInteractive = () => {
      gsap.to(ring, { scale: 1, borderColor: 'rgba(232,201,122,0.6)', duration: 0.3 });
      gsap.to(dot, { scale: 1, duration: 0.2 });
    };

    window.addEventListener('mousemove', onMove);

    const interactives = document.querySelectorAll('button, a, [data-cursor-hover]');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', onEnterInteractive);
      el.addEventListener('mouseleave', onLeaveInteractive);
    });

    return () => {
      document.body.style.cursor = '';
      gsap.killTweensOf([dot, ring]);
      window.removeEventListener('mousemove', onMove);
      interactives.forEach(el => {
        el.removeEventListener('mouseenter', onEnterInteractive);
        el.removeEventListener('mouseleave', onLeaveInteractive);
      });
    };
  }, []);

  // Hide on touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return null;

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] h-3 w-3 rounded-full bg-[#E8C97A]"
        style={{ willChange: 'transform' }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] h-10 w-10 rounded-full border-2"
        style={{ borderColor: 'rgba(232,201,122,0.6)', willChange: 'transform' }}
      />
    </>
  );
}
