import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { EgrnAttachment, IAttachment } from '@sotbi/models';

@Pipe({
  name: 'attachments',
  pure: false,
  standalone: true,
})
export class AttachmentsPipe implements PipeTransform {
  public transform(
    items: (Partial<IAttachment> | Partial<EgrnAttachment>)[],
    filter: string,
  ): (Partial<IAttachment> | Partial<EgrnAttachment>)[] {
    if (!items || !filter) {
      return items;
    }
    return items.filter((item) => item.type === filter);
  }
}
