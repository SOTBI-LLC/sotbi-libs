import { NativeNavLevelDirective } from '../shell/native-nav-level.directive';
import { NativeVerticalNavComponent } from '../vertical-nav/native-vertical-nav.component';
import { NativeVerticalNavGroupComponent } from '../vertical-nav/native-vertical-nav-group.component';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideDynamicIcon, type LucideIconData } from '@lucide/angular';

export interface LeftNavBarItem {
  label: string;
  icon?: LucideIconData;
  routerLink?: string;
  access?: string;
  expanded?: boolean;
  children?: LeftNavBarItem[];
}

export const countWithChildren = (items: LeftNavBarItem[]): number => {
  return items.reduce((acc, item) => {
    if (item.children && item.children.length > 0) {
      return acc + countWithChildren(item.children);
    }
    return acc + 1;
  }, 0);
};

// filter items by access with children
export const filterItems = (
  items: LeftNavBarItem[],
  checkAccess: (path: string) => boolean,
): LeftNavBarItem[] => {
  return items
    .map((item) => {
      const path = item.access || item.routerLink;
      if (path && !checkAccess(path)) {
        return null;
      }
      if (item.children) {
        const children = filterItems(item.children, checkAccess);
        return children.length > 0 ? { ...item, children } : null;
      }
      return item;
    })
    .filter((item): item is LeftNavBarItem => item !== null);
};

@Component({
  selector: 'left-nav-bar',
  imports: [
    NativeVerticalNavComponent,
    NativeVerticalNavGroupComponent,
    NativeNavLevelDirective,
    LucideDynamicIcon,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './left-nav-bar.component.html',
  styleUrl: './left-nav-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeftNavBarComponent {
  protected readonly colabsible = input<boolean>(true);
  protected readonly items = input.required<LeftNavBarItem[]>();
  protected readonly countWithChildren = countWithChildren;
}
