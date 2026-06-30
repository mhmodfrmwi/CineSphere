export function parseApiError(error: unknown, fallback: string): string {
  const err = error as { error?: unknown; message?: string };
  const body = err?.error;
  if (typeof body === 'string' && body.trim()) return body;
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>;
    const message = record['message'] ?? record['Message'] ?? record['title'];
    if (typeof message === 'string' && message.trim()) return message;
  }
  if (typeof err?.message === 'string' && err.message.trim()) return err.message;
  return fallback;
}

export function sanitizeReturnUrl(returnUrl: string | null | undefined): string {
  if (!returnUrl || !returnUrl.startsWith('/') || returnUrl.startsWith('//')) return '/';
  return returnUrl;
}
