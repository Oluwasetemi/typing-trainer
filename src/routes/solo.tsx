import { createFileRoute } from '@tanstack/react-router';

import TypingTrainer from '../components/typing-trainer';
import { generateSoloOGImageUrl } from '../utils/og-image';

export const Route = createFileRoute('/solo')({
  ssr: true,
  head: () => ({
    title: 'Solo Practice — KeyRush',
    meta: [
      {
        name: 'description',
        content: 'Practice typing solo with real-time error feedback and keyboard visualization. Improve your speed and accuracy.',
      },
      {
        property: 'og:title',
        content: 'Solo Practice — KeyRush',
      },
      {
        property: 'og:description',
        content: 'Practice typing solo with real-time error feedback and keyboard visualization.',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:image',
        content: generateSoloOGImageUrl(),
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: 'Solo Practice — KeyRush',
      },
      {
        name: 'twitter:description',
        content: 'Practice typing solo with real-time error feedback and keyboard visualization.',
      },
      {
        name: 'twitter:image',
        content: generateSoloOGImageUrl(),
      },
    ],
  }),
  component: SoloPage,
});

function SoloPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-8 pb-6 border-b border-gray-100 dark:border-zinc-800 mb-8">
          <h1
            className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Solo Practice
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Train at your own pace. No distractions.
          </p>
        </div>
        <TypingTrainer />
      </div>
    </div>
  );
}
