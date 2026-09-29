const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;

  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export function relativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.round(diffMs / SECOND_MS);

  if (diffSec < 5) return 'только что';

  if (diffMs < MINUTE_MS) {
    return `${diffSec} ${plural(diffSec, 'секунду', 'секунды', 'секунд')} назад`;
  }
  if (diffMs < HOUR_MS) {
    const minutes = Math.round(diffMs / MINUTE_MS);
    return `${minutes} ${plural(minutes, 'минуту', 'минуты', 'минут')} назад`;
  }
  if (diffMs < DAY_MS) {
    const hours = Math.round(diffMs / HOUR_MS);
    return `${hours} ${plural(hours, 'час', 'часа', 'часов')} назад`;
  }

  const days = Math.round(diffMs / DAY_MS);
  return `${days} ${plural(days, 'день', 'дня', 'дней')} назад`;
}
