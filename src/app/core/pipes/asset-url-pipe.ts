import { Pipe, PipeTransform } from '@angular/core';
import { resolveAssetUrl } from '../utils/asset-url';

@Pipe({
  name: 'assetUrl',
})
export class AssetUrlPipe implements PipeTransform {
  transform(url: string | undefined | null): string {
    return resolveAssetUrl(url);
  }
}
