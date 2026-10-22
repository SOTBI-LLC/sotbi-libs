import {
  AccordionContent,
  AccordionPanel,
  AccordionTrigger,
} from '@angular/aria/accordion';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  effect,
  untracked,
} from '@angular/core';
import { NativeVerticalNavComponent } from './native-vertical-nav.component';
import { LucideChevronUp } from '@lucide/angular';

@Component({
  selector: 'div[sotbiVerticalNavGroup]',
  imports: [
    AccordionTrigger,
    AccordionPanel,
    AccordionContent,
    LucideChevronUp,
  ],
  templateUrl: './native-vertical-nav-group.component.html',
  styleUrl: './native-vertical-nav-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'nav-group',
    '[class.is-expanded]': 'isExpanded()',
    '(click)': 'selectLink($event)',
  },
})
export class NativeVerticalNavGroupComponent {
  protected readonly nav = inject(NativeVerticalNavComponent);
  public readonly initiallyExpanded = input(false);
  private readonly userExpanded = linkedSignal(() => this.initiallyExpanded());
  protected readonly isExpanded = computed(
    () => !this.nav.collapsed() && this.userExpanded(),
  );

  constructor() {
    effect(() => {
      const expanded = this.initiallyExpanded();
      untracked(() => {
        if (expanded) this.nav.expand();
      });
    });
  }

  protected selectLink(event: MouseEvent): void {
    if (event.target instanceof Element && event.target.closest('a.nav-link')) {
      this.userExpanded.set(true);
      this.nav.expand();
    }
  }

  protected changed(expanded: boolean): void {
    this.userExpanded.set(expanded);
  }
}
