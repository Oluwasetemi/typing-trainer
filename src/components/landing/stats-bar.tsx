import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

const ease = [0.16, 1, 0.3, 1] as const;

const stats = [
  { value: '10K+', label: 'matches played' },
  { value: '127 WPM', label: 'average improvement' },
  { value: '4', label: 'game modes' },
];

export default function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <section className="bg-zinc-950 border-y border-zinc-800/60 py-16 px-4 sm:px-6 lg:px-8">
      <div ref={ref} className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-0 sm:divide-x sm:divide-zinc-800">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, ease, delay: i * 0.1 }}
              className="text-center sm:px-12"
            >
              <div
                className="text-4xl sm:text-5xl font-bold text-white tabular-nums"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {stat.value}
              </div>
              <div
                className="text-gray-500 text-sm mt-2 tracking-wide"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
