import { Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router, provideRouter } from '@angular/router';
import {
  countWithChildren,
  filterItems,
  LeftNavBarComponent,
  type LeftNavBarItem,
} from './left-nav-bar.component';

describe('countWithChildren', () => {
  it('returns 0 for an empty list', () => {
    expect(countWithChildren([])).toBe(0);
  });

  it('counts a single leaf item', () => {
    const items: LeftNavBarItem[] = [{ label: 'Home', routerLink: './home' }];
    expect(countWithChildren(items)).toBe(1);
  });

  it('counts leaves of a group and a separate leaf', () => {
    const items: LeftNavBarItem[] = [
      {
        label: 'Group',
        children: [
          { label: 'A', routerLink: './a' },
          { label: 'B', routerLink: './b' },
        ],
      },
      { label: 'C', routerLink: './c' },
    ];

    expect(countWithChildren(items)).toBe(3);
  });

  it('recursively counts leaves in nested groups', () => {
    const items: LeftNavBarItem[] = [
      {
        label: 'Group',
        children: [
          { label: 'A', routerLink: './a' },
          {
            label: 'SubGroup',
            children: [{ label: 'B', routerLink: './b' }],
          },
        ],
      },
    ];

    expect(countWithChildren(items)).toBe(2);
  });

  it('treats items with empty children as a leaf', () => {
    const items: LeftNavBarItem[] = [{ label: 'Empty group', children: [] }];

    expect(countWithChildren(items)).toBe(1);
  });
});

describe('filterItems', () => {
  it('keeps a leaf with a truthy access key and does not mutate the source', () => {
    const items: LeftNavBarItem[] = [
      { label: 'Home', access: 'home', routerLink: './home' },
    ];

    const result = filterItems(items, (path) => path === 'home');

    expect(result).toEqual([{ label: 'Home', access: 'home', routerLink: './home' }]);
    expect(items).toEqual([{ label: 'Home', access: 'home', routerLink: './home' }]);
  });

  it('prefers access over routerLink when checking permissions', () => {
    const items: LeftNavBarItem[] = [
      { label: 'Home', access: 'home', routerLink: './home' },
    ];

    const checkedPaths: string[] = [];
    filterItems(items, (path) => {
      checkedPaths.push(path);
      return false;
    });

    expect(checkedPaths).toEqual(['home']);
    expect(filterItems(items, (path) => path === './home')).toEqual([]);
  });

  it('excludes a denied parent together with its subtree', () => {
    const items: LeftNavBarItem[] = [
      {
        label: 'Group',
        access: 'group',
        children: [{ label: 'A', access: 'a', routerLink: './a' }],
      },
    ];

    expect(filterItems(items, (path) => path !== 'group')).toEqual([]);
  });

  it('excludes a group whose children are all filtered out', () => {
    const items: LeftNavBarItem[] = [
      {
        label: 'Group',
        children: [{ label: 'A', access: 'a', routerLink: './a' }],
      },
    ];

    const result = filterItems(items, (path) => path !== 'a');

    expect(result).toEqual([]);
  });

  it('does not call the predicate for an item without access and routerLink', () => {
    const items: LeftNavBarItem[] = [{ label: 'NoPath' }];

    const checkedPaths: string[] = [];
    const result = filterItems(items, (path) => {
      checkedPaths.push(path);
      return true;
    });

    expect(checkedPaths).toEqual([]);
    expect(result).toEqual([{ label: 'NoPath' }]);
  });

  it('filters nested trees and keeps the source unchanged', () => {
    const items: LeftNavBarItem[] = [
      {
        label: 'Group',
        children: [
          { label: 'Allowed', access: 'allowed', routerLink: './allowed' },
          { label: 'Denied', access: 'denied', routerLink: './denied' },
        ],
      },
      { label: 'Denied leaf', access: 'denied', routerLink: './denied' },
    ];

    const result = filterItems(items, (path) => path === 'allowed');

    expect(result).toEqual([
      {
        label: 'Group',
        children: [{ label: 'Allowed', access: 'allowed', routerLink: './allowed' }],
      },
    ]);
    expect(items).toEqual([
      {
        label: 'Group',
        children: [
          { label: 'Allowed', access: 'allowed', routerLink: './allowed' },
          { label: 'Denied', access: 'denied', routerLink: './denied' },
        ],
      },
      { label: 'Denied leaf', access: 'denied', routerLink: './denied' },
    ]);
  });
});

@Component({ selector: 'lib-dummy', template: '' })
class DummyComponent {}

const routes = [
  { path: 'normal', component: DummyComponent },
  { path: 'poison/sub', component: DummyComponent },
  { path: '**', component: DummyComponent },
];

const demoItems: LeftNavBarItem[] = [
  { label: 'Normal', icon: 'user', routerLink: '/normal' },
  {
    label: 'Poison',
    icon: 'sad-face',
    expanded: false,
    children: [{ label: 'Sub Poison', icon: 'sad-face', routerLink: '/poison/sub' }],
  },
];

const createFixture = async (
  items: LeftNavBarItem[],
  colabsible = true,
): Promise<ComponentFixture<LeftNavBarComponent>> => {
  await TestBed.configureTestingModule({
    imports: [LeftNavBarComponent],
    providers: [provideNoopAnimations(), provideRouter(routes)],
  }).compileComponents();

  const fixture = TestBed.createComponent(LeftNavBarComponent);
  fixture.componentRef.setInput('items', items);
  fixture.componentRef.setInput('colabsible', colabsible);
  await fixture.whenStable();
  return fixture;
};

describe('LeftNavBarComponent', () => {
  it('creates', async () => {
    const fixture = await createFixture(demoItems);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('hides the navigation for an empty menu', async () => {
    const fixture = await createFixture([]);
    expect(fixture.debugElement.query(By.css('clr-vertical-nav'))).toBeNull();
  });

  it('hides the navigation when there is a single leaf item', async () => {
    const fixture = await createFixture([{ label: 'Home', routerLink: '/home' }]);
    expect(fixture.debugElement.query(By.css('clr-vertical-nav'))).toBeNull();
  });

  it('hides the navigation when a single leaf is an empty group', async () => {
    const fixture = await createFixture([{ label: 'Empty group', children: [] }]);
    expect(fixture.debugElement.query(By.css('clr-vertical-nav'))).toBeNull();
  });

  it('renders leaf links and group child links', async () => {
    const fixture = await createFixture(demoItems);
    const links = fixture.debugElement
      .queryAll(By.css('a[clrVerticalNavLink]'))
      .map((link) => link.nativeElement.getAttribute('href'));

    expect(fixture.debugElement.nativeElement.innerHTML).toContain('Sub Poison');
    expect(links).toEqual(['/normal', '/poison/sub']);
  });

  it('marks the active link by exact route match only', async () => {
    const fixture = await createFixture(demoItems);
    const router = TestBed.inject(Router);
    const link = fixture.debugElement
      .queryAll(By.css('a'))
      .find((a) => a.nativeElement.getAttribute('href') === '/normal')!;
    const group = fixture.debugElement.query(By.css('clr-vertical-nav-group'))!;

    await router.navigateByUrl('/normal');
    await fixture.whenStable();
    expect(link.nativeElement.className).toContain('active');
    expect(group.nativeElement.className).not.toContain('active');

    await router.navigateByUrl('/normal/deeper');
    await fixture.whenStable();
    expect(link.nativeElement.className).not.toContain('active');
  });

  it('marks the group active when its child route is active', async () => {
    const fixture = await createFixture(demoItems);
    const router = TestBed.inject(Router);
    const group = fixture.debugElement.query(By.css('clr-vertical-nav-group'))!;

    await router.navigateByUrl('/poison/sub');
    await fixture.whenStable();
    expect(group.nativeElement.className).toContain('active');

    await router.navigateByUrl('/normal');
    await fixture.whenStable();
    expect(group.nativeElement.className).not.toContain('active');
  });

  it('starts a group collapsed and lets the user expand it', async () => {
    const fixture = await createFixture(demoItems);
    const trigger = fixture.debugElement.query(By.css('button.nav-group-trigger'))!;

    expect(trigger.nativeElement.getAttribute('aria-expanded')).toBe('false');

    trigger.nativeElement.click();
    await fixture.whenStable();

    expect(trigger.nativeElement.getAttribute('aria-expanded')).toBe('true');
  });

  it('starts a group expanded when the item sets expanded', async () => {
    const fixture = await createFixture([
      {
        label: 'Poison',
        expanded: true,
        children: [{ label: 'Sub Poison', routerLink: '/poison/sub' }],
      },
      { label: 'Normal', routerLink: '/normal' },
    ]);
    const trigger = fixture.debugElement.query(By.css('button.nav-group-trigger'))!;

    expect(trigger.nativeElement.getAttribute('aria-expanded')).toBe('true');
  });

  it('collapses the panel with the nav trigger when colabsible', async () => {
    const fixture = await createFixture(demoItems, true);
    const nav = fixture.debugElement.query(By.css('clr-vertical-nav'))!;
    const trigger = nav.query(By.css('button.nav-trigger'))!;

    expect(trigger).toBeTruthy();

    trigger.nativeElement.click();
    await fixture.whenStable();

    expect(nav.nativeElement.className).toContain('is-collapsed');
  });

  it('has no collapse trigger when colabsible is false', async () => {
    const fixture = await createFixture(demoItems, false);
    const nav = fixture.debugElement.query(By.css('clr-vertical-nav'))!;

    expect(nav.query(By.css('button.nav-trigger'))).toBeNull();
  });
});
