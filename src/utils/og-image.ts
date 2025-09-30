/**
 * Generate OG image URL for different types and contexts
 */
export function generateOGImageUrl(type: 'default' | 'session' | 'spectator' | 'solo', title: string, description: string, sessionId?: string): string {
  // Get the base URL - use localhost in development, production URL in production
  const baseUrl = import.meta.env.DEV
    ? (import.meta.env.VITE_API_URL || 'http://localhost:3004') // Allow override via env var
    : 'https://typing-trainer.vercel.app';

  const params = new URLSearchParams({
    type,
    title,
    description,
    ...(sessionId && { sessionId }),
  });

  return `${baseUrl}/api/og?${params.toString()}`;
}

/**
 * Generate OG image URL for session pages
 */
export function generateSessionOGImageUrl(sessionId: string): string {
  return generateOGImageUrl(
    'session',
    `Typing Session - ${sessionId}`,
    'Real-time typing practice session. Join and start typing to improve your speed and accuracy.',
    sessionId,
  );
}

/**
 * Generate OG image URL for spectator pages
 */
export function generateSpectatorOGImageUrl(sessionId: string): string {
  return generateOGImageUrl(
    'spectator',
    `Watch Typing Session - ${sessionId}`,
    'Spectate a real-time typing session. Watch live typing progress and learn from others.',
    sessionId,
  );
}

/**
 * Generate OG image URL for solo practice
 */
export function generateSoloOGImageUrl(): string {
  return generateOGImageUrl(
    'solo',
    'Solo Typing Practice',
    'Practice typing solo with our typing trainer. Improve your speed and accuracy without distractions.',
  );
}

/**
 * Generate OG image URL for default/home page
 */
export function generateDefaultOGImageUrl(): string {
  return generateOGImageUrl(
    'default',
    'Real-time Typing Trainer',
    'Practice typing with real-time collaboration. Create sessions, join as spectator, or practice solo.',
  );
}
