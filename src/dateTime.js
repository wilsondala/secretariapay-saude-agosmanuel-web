export const ANGOLA_TIME_ZONE = 'Africa/Luanda';

export function formatAngolaDateTime(value) {
  if (!value) return '—';

  return new Intl.DateTimeFormat('pt-AO', {
    timeZone: ANGOLA_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));
}
