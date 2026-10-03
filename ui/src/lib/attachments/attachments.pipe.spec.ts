import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import type { IAttachment } from '@sotbi/models';

import { AttachmentsPipe } from './attachments.pipe';

type AttachmentLike = Partial<IAttachment>;

describe('AttachmentsPipe', () => {
  const buildItem = (type: string): AttachmentLike => ({ type });

  describe('transform', () => {
    it('returns only items whose type matches the filter', () => {
      const pipe = new AttachmentsPipe();
      const items = [buildItem('egrn'), buildItem('payment'), buildItem('egrn')];

      const result = pipe.transform(items, 'egrn');

      expect(result).toEqual([items[0], items[2]]);
    });

    it('returns the input list unchanged when the filter is empty', () => {
      const pipe = new AttachmentsPipe();
      const items = [buildItem('egrn'), buildItem('payment')];

      expect(pipe.transform(items, '')).toBe(items);
    });

    it('returns the input list unchanged when the filter argument is omitted', () => {
      const pipe = new AttachmentsPipe();
      const items = [buildItem('egrn')];

      expect(pipe.transform(items, undefined as unknown as string)).toBe(items);
    });

    it('returns the absent list as-is', () => {
      const pipe = new AttachmentsPipe();

      expect(pipe.transform(null as unknown as AttachmentLike[], 'egrn')).toBeNull();
    });

    it('returns an empty result when no item matches the filter', () => {
      const pipe = new AttachmentsPipe();
      const items = [buildItem('payment')];

      expect(pipe.transform(items, 'egrn')).toEqual([]);
    });
  });

  describe('impure rendering', () => {
    @Component({
      imports: [AttachmentsPipe],
      template: `
        @for (item of items | attachments: 'egrn'; track item) {
          <span class="item">{{ $index }}:{{ item.type }}</span>
        }
        <button type="button" (click)="noop()">tick</button>
      `,
    })
    class HostComponent {
      public items: AttachmentLike[] = [{ type: 'egrn' }];
      public noop(): void {
        /* event only: triggers a change detection cycle */
      }
    }

    let fixture: ComponentFixture<HostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [HostComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
    });

    const tick = async () => {
      (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
      await fixture.whenStable();
    };

    const rendered = () =>
      Array.from(
        fixture.nativeElement.querySelectorAll('.item') as NodeListOf<Element>,
      ).map((el) => el.textContent!.trim());

    it('re-evaluates the filtered view when the array is mutated in place', async () => {
      expect(rendered()).toEqual(['0:egrn']);

      fixture.componentInstance.items.push({ type: 'egrn' }, { type: 'payment' });
      await tick();

      expect(rendered()).toEqual(['0:egrn', '1:egrn']);
    });

    it('reflects in-place removals without a new array reference', async () => {
      fixture.componentInstance.items.push({ type: 'egrn' });
      await tick();
      expect(rendered()).toEqual(['0:egrn', '1:egrn']);

      fixture.componentInstance.items.pop();
      await tick();

      expect(rendered()).toEqual(['0:egrn']);
    });
  });
});
