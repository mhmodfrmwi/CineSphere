import { environment } from '../../../environments/environment';

export function resolveAssetUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const origin = environment.apiOrigin;
  if (!origin) return url;
  return `${origin}${url.startsWith('/') ? url : `/${url}`}`;
}
