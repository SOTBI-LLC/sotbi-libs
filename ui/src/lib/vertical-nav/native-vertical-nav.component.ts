import { ClarityIcons, angleDoubleIcon, angleIcon } from '@clr/angular/icon';
import { AccordionGroup } from '@angular/aria/accordion';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ClrIcon } from '@clr/angular';
import { NativeVerticalNavGroupComponent } from './native-vertical-nav-group.component';

let nextNavId = 0;

@Component({
  selector: 'nav[sotbiVerticalNav]',
  imports: [ClrIcon],
  templateUrl: './native-vertical-nav.component.html',
  styleUrl: './native-vertical-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: AccordionGroup, inputs: ['multiExpandable'] }],
  host: {
    class: 'clr-vertical-nav',
    '[class.is-collapsed]': 'collapsed()',
    '[class.has-nav-groups]': 'hasGroups()',
    '[class.has-icons]': 'hasIcons()',
  },
})
export class NativeVerticalNavComponent {
  public readonly collapsible = input(true);
  public readonly hasIcons = input(true);
  public readonly toggleLabel = input('Toggle vertical navigation');
  public readonly collapsed = signal(false);
  protected readonly contentId = `sotbi-nav-content-${nextNavId++}`;
  private readonly groups = contentChildren<NativeVerticalNavGroupComponent>(
    forwardRef(() => NativeVerticalNavGroupComponent),
    { descendants: true },
  );
  protected readonly hasGroups = computed(() => this.groups().length > 0);

  constructor() {
    ClarityIcons.addIcons(angleDoubleIcon, angleIcon);
    effect(() => {
      if (!this.collapsible()) this.collapsed.set(false);
    });
  }

  public expand(): void {
    this.collapsed.set(false);
  }
  protected nativeLinkKeydown(event: KeyboardEvent): void {
    if (event.target instanceof Element && event.target.closest('a.nav-link'))
      event.stopPropagation();
  }

  protected toggle(): void {
    this.collapsed.update((value) => !value);
  }
}
