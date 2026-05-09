export function calcWPM(charsTyped: number, elapsedMs: number): number {
  if (elapsedMs === 0)
    return 0;

  // WPM = (characters typed / 5) / (time in minutes)
  // 5 characters is the standard word length for typing tests
  const wordsTyped = charsTyped / 5;
  const timeInMinutes = elapsedMs / 60000;

  return Math.round(wordsTyped / timeInMinutes);
}

export function calcAccuracy(errors: number, total: number): number {
  if (total === 0)
    return 100;
  return Math.round(((total - errors) / total) * 100);
}

export function formatTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${remainingSeconds}s`;
}
