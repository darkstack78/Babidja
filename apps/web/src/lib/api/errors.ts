/** Extrait un message lisible depuis une erreur axios renvoyée par le backend NestJS. */
export function extractErrorMessage(error: unknown, fallback = 'Une erreur est survenue. Réessayez.'): string {
  const data = (error as { response?: { data?: { message?: unknown } } })?.response?.data;
  const raw = data?.message;

  if (Array.isArray(raw) && raw.length > 0) return String(raw[0]);
  if (raw && typeof raw === 'object' && 'message' in raw) {
    const nested = (raw as { message?: unknown }).message;
    return Array.isArray(nested) ? String(nested[0]) : String(nested ?? fallback);
  }
  if (typeof raw === 'string') return raw;
  return fallback;
}
