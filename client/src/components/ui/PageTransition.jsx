import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/scroll';

export default function PageTransition({ pageKey, children }) {
  const curtainRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Curtain slides up covering screen
      gsap.fromTo(curtainRef.current,
        { yPercent: 100 },
        { yPercent: 0, duration: 0.35, ease: 'power3.inOut',
          onComplete: () => {
            // Then slides back up revealing new content
            gsap.to(curtainRef.current, {
              yPercent: -100, duration: 0.35,
              ease: 'power3.inOut', delay: 0.05
            });
            gsap.fromTo(contentRef.current,
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out', delay: 0.1 }
            );
          }
        }
      );
    });
    return () => ctx.revert();
  }, [pageKey]);

  return (
    <>
      <div
        ref={curtainRef}
        className="pointer-events-none fixed inset-0 z-[9990] bg-[#342721]"
        style={{ transform: 'translateY(100%)' }}
      />
      <div ref={contentRef}>{children}</div>
    </>
  );
}
