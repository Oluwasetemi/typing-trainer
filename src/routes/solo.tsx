import { createFileRoute } from '@tanstack/react-router';

import TypingTrainer from '../components/typing-trainer';
import { generateSoloOGImageUrl } from '../utils/og-image';

export const Route = createFileRoute('/solo')({
  ssr: true,
  head: () => ({
    title: 'Solo Typing Practice',
    meta: [
      {
        name: 'description',
        content: 'Practice typing solo with our typing trainer. Improve your speed and accuracy without distractions.',
      },
      {
        property: 'og:title',
        content: 'Solo Typing Practice',
      },
      {
        property: 'og:description',
        content: 'Practice typing solo with our typing trainer. Improve your speed and accuracy without distractions.',
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
        property: 'og:logo',
        content: 'https://fav.farm/🇳🇬',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: 'Solo Typing Practice',
      },
      {
        name: 'twitter:description',
        content: 'Practice typing solo with our typing trainer. Improve your speed and accuracy without distractions.',
      },
      {
        name: 'twitter:image',
        content: generateSoloOGImageUrl(),
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://deploy-preview-3--realtime-typing-trainer.netlify.app/solo',
      },
    ],
  }),
  component: SoloPage,
});

function SoloPage() {
  return <TypingTrainer />;
}
