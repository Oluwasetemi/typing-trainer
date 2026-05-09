import { Link } from '@tanstack/react-router';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

const ease = [0.16, 1, 0.3, 1] as const;

const features = [
  {
    label: '01',
    title: 'Solo Practice',
    description:
      'Train at your own pace with real-time error feedback, keyboard visualization, and detailed per-session stats. No pressure. Full focus.',
    href: '/solo',
    cta: 'Start training',
    span: 'tall',
  },
  {
    label: '02',
    title: 'Live Competitions',
    description:
      'Race others in real-time. The leaderboard updates keystroke-by-keystroke as you type.',
    href: '/competition',
    cta: null,
    span: 'normal',
  },
  {
    label: '03',
    title: 'Tournaments',
    description:
      'Single elimination, double elimination, round-robin, and swiss brackets. Serious competition for serious typists.',
    href: '/tournament',
    cta: null,
    span: 'normal',
  },
  {
    label: '04',
    title: 'Sessions',
    description:
      'Shared typing sessions with spectator mode and live participant stats. Perfect for teams, pair practice, and live demos.',
    href: '/session',
    cta: 'Join a session',
    span: 'wide',
  },
] as const;

function FeatureCard({
  feature,
  index,
  className,
}: {
  feature: (typeof features)[number];
  index: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease, delay: index * 0.08 }}
      className={`group relative bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-7 flex flex-col hover:border-violet-200 dark:hover:border-violet-800 transition-colors duration-300 ${className ?? ''}`}
    >
      {/* Card number */}
      <span
        className="text-xs font-semibold tracking-widest text-gray-300 dark:text-zinc-600 mb-4 block"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {feature.label}
      </span>

      {/* Title */}
      <h3
        className="text-xl font-bold text-gray-900 dark:text-white mb-3"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {feature.title}
      </h3>

      {/* Description */}
      <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm flex-1">
        {feature.description}
      </p>

      {/* CTA */}
      {feature.cta && (
        <Link
          to={feature.href}
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:gap-3 transition-all duration-200"
        >
          {feature.cta}
          <span aria-hidden="true">→</span>
        </Link>
      )}
    </motion.div>
  );
}

export default function FeaturesGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="bg-gray-50 dark:bg-zinc-900/50 py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease }}
          className="mb-14"
        >
          <p
            className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Everything you need to type faster
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Four modes.
            <br />
            <span className="text-gray-400 dark:text-zinc-500">One platform.</span>
          </h2>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Solo — tall, left column, spans 2 rows */}
          <FeatureCard feature={features[0]} index={0} className="md:row-span-2" />

          {/* Compete — top right */}
          <FeatureCard feature={features[1]} index={1} />

          {/* Tournament — bottom right */}
          <FeatureCard feature={features[2]} index={2} />

          {/* Sessions — full width bottom */}
          <FeatureCard feature={features[3]} index={3} className="md:col-span-2" />
        </div>
      </div>
    </section>
  );
}
