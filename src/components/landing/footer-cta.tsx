import { Link } from '@tanstack/react-router';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

const ease = [0.16, 1, 0.3, 1] as const;

const footerLinks = [
  { name: 'Solo', href: '/solo' },
  { name: 'Compete', href: '/competition' },
  { name: 'Sessions', href: '/session' },
  { name: 'Tournament', href: '/tournament' },
  { name: 'Settings', href: '/settings' },
];

export default function FooterCta() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <section className="bg-zinc-950 py-28 px-4 sm:px-6 lg:px-8">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease }}
        className="max-w-3xl mx-auto text-center"
      >
        <h2
          className="text-5xl sm:text-6xl font-bold text-white tracking-tight mb-8"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Ready to get fast?
        </h2>
        <p className="text-gray-400 text-lg mb-10 max-w-md mx-auto leading-relaxed">
          Jump in — no account required. Start your first session in seconds.
        </p>
        <Link
          to="/solo"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-violet-900/40 text-base"
        >
          Start for free
          <span aria-hidden="true" className="text-violet-300">→</span>
        </Link>
      </motion.div>

      {/* Footer nav + copyright */}
      <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-zinc-800/60">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <span
            className="text-white font-bold text-lg"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            ⚡ KeyRush
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            {footerLinks.map(link => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <p
            className="text-xs text-gray-600"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            © 2026 KeyRush
          </p>
        </div>
      </div>
    </section>
  );
}
