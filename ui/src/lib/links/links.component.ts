import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import type { itemMap, ShortLink, SimpleEditModel } from '@sotbi/models';
import { Link } from '@sotbi/models';
import { deepEqual } from '@sotbi/utils';

export const getLinks = (arr: Link[], links: itemMap): ShortLink[] => {
  if (!arr) {
    return [];
  }
  return arr.reduce((accum: { name: string; uri: string }[], curr: Link) => {
    const simpleEditName = links.get(curr.type_id) ?? 'н/д';
    accum.push({ name: simpleEditName, uri: curr.uri });
    return accum;
  }, []);
};

export const styleClassesForLinks = [
  'table-aggrid--cell-wrap-text',
  'table-aggrid--overflow-auto',
];

@Component({
  selector: 'app-links-wrap',
  imports: [FormsModule, ClarityModule, CommonModule],
  templateUrl: './links.component.html',
  styleUrls: ['./links.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinksComponent implements OnInit {
  public readonly isDisabled = input<boolean>(false);
  public readonly showAsTable = input<boolean>(true);
  public readonly linkRefs = input<Link[]>([]);
  public readonly isEditMode = input<boolean>(false);
  public readonly debtorId = input.required<number>();
  public readonly isChanged = output<void>();

  public readonly links = input.required<SimpleEditModel[]>();

  private selected = new Link();
  protected create = new Link();

  private old: Link[] = [];

  public get shortLinkRefs(): Set<number> {
    return new Set(this.linkRefs().map(({ type_id }: Link) => type_id));
  }

  protected getLinksForSelect(links: SimpleEditModel[]): SimpleEditModel[] {
    return (
      (Array.isArray(links) &&
        links.filter(({ id }) => !this.shortLinkRefs.has(id))) ||
      []
    );
  }

  public ngOnInit(): void {
    this.reset();
    this.old = structuredClone(this.linkRefs());
  }

  private reset() {
    this.selected = new Link({ id: 0 });
    this.create = new Link({ id: 0, uri: '', type_id: -1 });
  }

  private isSelectedItem(item: Link) {
    return this.selected.id === item.id;
  }

  protected canEdit(item: Link) {
    return this.isEditMode() || this.isSelectedItem(item);
  }

  protected add() {
    if (this.isDisabled()) {
      return;
    }
    if (this.create.uri && this.create.type_id > 0) {
      this.create.debtor_id = this.debtorId();
      this.linkRefs().push(this.create);
      this.isChangedEmit();
      this.reset();
    }
  }

  private isChangedEmit() {
    if (!deepEqual(this.old, this.linkRefs())) {
      this.isChanged.emit();
    }
  }

  protected onTryEdit(item: Link) {
    if (this.isDisabled()) {
      return;
    }
    this.selected = item;
  }

  protected onSave() {
    if (this.isDisabled()) {
      return;
    }
    for (const item of this.linkRefs()) {
      if (item.id === this.selected.id) {
        this.isChangedEmit();
        this.reset();
        break;
      }
    }
  }

  protected clickedInside($event: Event) {
    $event.preventDefault();
    $event.stopPropagation(); // <- that will stop propagation on lower layers
  }

  @HostListener('document:click')
  public clickedOutside() {
    this.isChangedEmit();
  }

  protected async del(link: Link, index: number) {
    if (link.id === 0) {
      this.linkRefs().splice(index, 1);
      this.isChangedEmit();
      return;
    }
    try {
      this.linkRefs().splice(index, 1);
      this.isChangedEmit();
      this.old = structuredClone(this.linkRefs());
    } catch (e) {
      console.error(e);
    }
  }
}
