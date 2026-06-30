import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'safeUrl',
})
export class SafeUrlPipe implements PipeTransform {
  transform(url: string | undefined | null): string | null {
    if (!url?.trim()) return null;
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.href;
    } catch {
      return null;
    }
    return null;
  }
}
