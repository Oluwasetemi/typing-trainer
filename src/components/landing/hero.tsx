import { Link } from '@tanstack/react-router';
import { animate } from 'motion';
import { motion } from 'motion/react';
import { useEffect, useRef } from 'react';

const ease = [0.16, 1, 0.3, 1] as const;

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

function WpmCounter() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const controls = animate(0, 127, {
      duration: 2.4,
      ease: 'easeOut',
      delay: 0.6,
      onUpdate(v) {
        if (node) node.textContent = Math.round(v).toString();
      },
    });

    return () => controls.stop();
  }, []);

  return <span ref={ref} className="tabular-nums">0</span>;
}

export default function Hero() {
  return (
    <section
      className="relative bg-zinc-950 min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{
        backgroundImage:
          'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)',
        backgroundSize: '28px 28px',
      }}
    >
      {/* Subtle gradient wash at bottom to transition to features section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent" />

      <motion.div
        className="relative max-w-4xl mx-auto text-center z-10"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Eyebrow */}
        <motion.p
          variants={item}
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-violet-400 mb-8 border border-violet-500/30 rounded-full px-4 py-1.5"
        >
          <span className="size-1.5 rounded-full bg-violet-400 animate-pulse" />
          Now with Tournament Mode
        </motion.p>

        {/* Headline */}
        <motion.h1
          variants={item}
          className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-6"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <span className="block text-white">Type faster.</span>
          <span className="block bg-gradient-to-br from-violet-300 via-violet-400 to-purple-500 bg-clip-text text-transparent">
            Win every room.
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={item}
          className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Real-time multiplayer typing competitions, solo practice, and tournament
          brackets — built for professionals who move fast.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={item}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-20"
        >
          <Link
            to="/solo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-900/40"
          >
            Start Practicing
          </Link>
          <Link
            to="/competition"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-zinc-700 text-gray-300 hover:text-white hover:border-zinc-500 font-semibold rounded-xl transition-all duration-200"
          >
            Compete Now
          </Link>
        </motion.div>

        {/* WPM stat */}
        <motion.div variants={item} className="text-center">
          <div
            className="text-5xl sm:text-6xl font-bold text-white mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <WpmCounter />
            <span className="text-violet-400"> WPM</span>
          </div>
          <p className="text-gray-500 text-sm tracking-wide font-medium">
            average improvement gained by users in 30 days
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
