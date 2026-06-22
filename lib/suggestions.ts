export function pickRandomSuggestions(
  pool: string[],
  count: number
): string[] {
  const shuffled = [...pool];

  for (let index = shuffled.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const current = shuffled[index];
    shuffled[index] = shuffled[randomIndex];
    shuffled[randomIndex] = current;
  }

  return shuffled.slice(0, Math.min(count, pool.length));
}
