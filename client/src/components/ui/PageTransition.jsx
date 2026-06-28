import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/scroll';

export default function PageTransition({ pageKey, children }) {
  const contentRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.28, ease: 'power3.out' },
      );
    });
    return () => ctx.revert();
  }, [pageKey]);

  return <div ref={contentRef}>{children}</div>;
}
