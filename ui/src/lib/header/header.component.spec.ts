import { Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router, provideRouter } from '@angular/router';
import { ClrMainContainerModule, ClrNavigationModule } from '@clr/angular';

import {
  HeaderComponent,
  type HeaderBrand,
  type HeaderLink,
  type HeaderUser,
} from './header.component';

@Component({ selector: 'lib-dummy', template: '' })
class DummyComponent {}

const routes = [
  { path: 'catalogs', component: DummyComponent },
  { path: 'costs', component: DummyComponent },
  { path: '**', component: DummyComponent },
];

const brand: HeaderBrand = {
  title: 'Our Zoo',
  logoUrl: 'logo.svg',
  homeLink: '/',
};

const user: HeaderUser = { name: 'Tester', avatarUrl: 'avatar.svg' };

const items: HeaderLink[] = [
  { label: 'Трудозатраты', routerLink: '/costs' },
  { label: 'Справочники', routerLink: '/catalogs' },
];

const accountItems: HeaderLink[] = [{ label: 'Админка', routerLink: '/admin' }];

@Component({
  imports: [HeaderComponent, ClrMainContainerModule, ClrNavigationModule],
  template: `
    <button (click)="showSearchPanel()">show</button>
    <clr-main-container>
      <sotbi-header
        [loggedIn]="hostLoggedIn"
        [brand]="hostBrand"
        [user]="hostUser"
        [items]="hostItems"
        [accountItems]="hostAccountItems"
        [online]="hostOnline"
        [showSearch]="hostShowSearch"
        [phrase]="hostPhrase"
        (searchEvent)="hostOnSearch($event)"
        (logoutRequested)="hostLogoutRequested()"
      />
    </clr-main-container>
  `,
})
class HeaderHostComponent {
  public hostLoggedIn = true;
  public hostBrand: HeaderBrand = brand;
  public hostUser: HeaderUser | null = user;
  public hostItems: HeaderLink[] = items;
  public hostAccountItems: HeaderLink[] = accountItems;
  public hostOnline = false;
  public hostShowSearch = false;
  public hostPhrase = '';
  public searchEvents: string[] = [];
  public logoutCount = 0;
  public hostOnSearch = (phrase: string): void => {
    this.searchEvents.push(phrase);
  };
  public hostLogoutRequested = (): void => {
    this.logoutCount += 1;
  };

  public showSearchPanel(): void {
    this.hostShowSearch = true;
    this.hostPhrase = 'prefill';
  }
}

const menuLinkElements = (): HTMLAnchorElement[] =>
  Array.from(document.querySelectorAll('clr-dropdown-menu a')) as HTMLAnchorElement[];

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderHostComponent>;
  let host: HeaderHostComponent;

  beforeEach(() => {
    Element.prototype.scrollIntoView = jest.fn();
    class IntersectionObserverStub {
      public observe = (): undefined => undefined;
      public unobserve = (): undefined => undefined;
      public disconnect = (): undefined => undefined;
    }
    (globalThis as unknown as Record<string, unknown>)['IntersectionObserver'] =
      IntersectionObserverStub;
  });

  const createHost = async (
    setup: (host: HeaderHostComponent) => void = () => undefined,
  ): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [HeaderHostComponent],
      providers: [provideNoopAnimations(), provideRouter(routes)],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderHostComponent);
    host = fixture.componentInstance;
    setup(host);
    await fixture.whenStable();
  };

  it('creates', async () => {
    await createHost();
    expect(fixture.debugElement.query(By.directive(HeaderComponent)).componentInstance).toBeTruthy();
  });

  it('renders the passed brand, user, avatar and links in order', async () => {
    await createHost();
    const el: HTMLElement = fixture.nativeElement;

    const title = el.querySelector('.branding .title')!;
    expect(title.textContent).toContain('Our Zoo');
    const logo = el.querySelector('.branding img')!;
    expect(logo.getAttribute('src')).toBe('logo.svg');

    const navLinks = Array.from(el.querySelectorAll('.header-nav a')) as HTMLAnchorElement[];
    expect(navLinks.map((link) => link.textContent!.trim())).toEqual([
      'Трудозатраты',
      'Справочники',
    ]);
    expect(navLinks[0]!.getAttribute('href')).toBe('/costs');

    const avatar = el.querySelector('img[title="avatar"]')!;
    expect(avatar.getAttribute('src')).toBe('avatar.svg');
    expect(avatar.getAttribute('alt')).toBe('Tester');
  });

  it('hides the whole header when loggedIn is false', async () => {
    await createHost((h) => (h.hostLoggedIn = false));
    expect(fixture.nativeElement.querySelector('clr-header')).toBeNull();
  });

  it('renders account items in the user menu', async () => {
    await createHost();
    const trigger = fixture.nativeElement.querySelector(
      'button[aria-label="toggle settings menu"]',
    )!;
    trigger.click();
    await fixture.whenStable();

    const menuItems = [
      ...menuLinkElements(),
      ...(Array.from(
        document.querySelectorAll('clr-dropdown-menu button'),
      ) as HTMLButtonElement[]),
    ];
    expect(menuItems.map((item) => item.textContent!.trim())).toEqual(['Админка', 'Выход']);
    expect(menuLinkElements()[0]!.getAttribute('href')).toBe('/admin');
  });

  it('renders the user name in the menu header', async () => {
    await createHost();
    const trigger = fixture.nativeElement.querySelector(
      'button[aria-label="toggle settings menu"]',
    )!;
    trigger.click();
    await fixture.whenStable();

    const headerLabel = document.querySelector('.dropdown-header')!;
    expect(headerLabel.textContent).toContain('Tester');
  });

  it('renders without a user (no data yet)', async () => {
    await createHost((h) => (h.hostUser = null));
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('img[title="avatar"]')).toBeTruthy();
  });

  it('emits a single logoutRequested on the logout click and performs no navigation', async () => {
    await createHost();
    const router = TestBed.inject(Router);
    const urlBefore = router.url;

    const trigger = fixture.nativeElement.querySelector(
      'button[aria-label="toggle settings menu"]',
    )!;
    trigger.click();
    await fixture.whenStable();

    const logoutButton = Array.from(
      document.querySelectorAll('clr-dropdown-menu button[title="logout"]'),
    ) as HTMLButtonElement[];
    expect(logoutButton.length).toBe(1);
    logoutButton[0]!.click();
    await fixture.whenStable();

    expect(host.logoutCount).toBe(1);
    expect(router.url).toBe(urlBefore);
  });

  it('navigates by the passed route when a link is clicked', async () => {
    await createHost();
    const router = TestBed.inject(Router);

    const link = fixture.debugElement
      .queryAll(By.css('.header-nav a'))
      .find((a) => a.nativeElement.textContent.trim() === 'Справочники')!;
    link.nativeElement.click();
    await fixture.whenStable();

    expect(router.url).toBe('/catalogs');
    expect(link.nativeElement.className).toContain('active');
  });
});

describe('HeaderComponent search', () => {
  let fixture: ComponentFixture<HeaderHostComponent>;
  let host: HeaderHostComponent;


  const searchInputElement = (): HTMLInputElement =>
    fixture.nativeElement.querySelector('#searchinput');

  beforeEach(() => {
    Element.prototype.scrollIntoView = jest.fn();
    class IntersectionObserverStub {
      public observe = (): undefined => undefined;
      public unobserve = (): undefined => undefined;
      public disconnect = (): undefined => undefined;
    }
    (globalThis as unknown as Record<string, unknown>)['IntersectionObserver'] =
      IntersectionObserverStub;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const createSearchHost = async (
    setup: (host: HeaderHostComponent) => void = () => undefined,
  ): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [HeaderHostComponent],
      providers: [provideNoopAnimations(), provideRouter(routes)],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderHostComponent);
    host = fixture.componentInstance;
    setup(host);
    await fixture.whenStable();
  };

  it('hides the search field while showSearch is false', async () => {
    await createSearchHost();
    expect(searchInputElement()).toBeNull();
  });

  it('shows the search field with the phrase value when showSearch becomes true', async () => {
    await createSearchHost();
    expect(searchInputElement()).toBeNull();

    const toggle = fixture.nativeElement.querySelector('button')!;
    toggle.click();
    await fixture.whenStable();

    expect(searchInputElement()).toBeTruthy();
    expect(searchInputElement().value).toBe('prefill');
  });

  it('emits the typed string immediately on form submit', async () => {
    await createSearchHost((h) => (h.hostShowSearch = true));

    const input = searchInputElement();
    input.value = 'query';
    const form = fixture.nativeElement.querySelector('form')!;
    form.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(host.searchEvents).toEqual(['query']);
  });

  it('emits the last typed string 500ms after typing when online', async () => {
    await createSearchHost((h) => {
      h.hostShowSearch = true;
      h.hostOnline = true;
    });

    jest.useFakeTimers();
    const input = searchInputElement();
    input.value = 'abc';
    input.dispatchEvent(new Event('keyup'));

    jest.advanceTimersByTime(499);
    expect(host.searchEvents).toEqual([]);

    jest.advanceTimersByTime(1);
    expect(host.searchEvents).toEqual(['abc']);
  });

  it('emits only the last string after several keystrokes', async () => {
    await createSearchHost((h) => {
      h.hostShowSearch = true;
      h.hostOnline = true;
    });

    jest.useFakeTimers();
    const input = searchInputElement();
    input.value = 'a';
    input.dispatchEvent(new Event('keyup'));
    input.value = 'ab';
    input.dispatchEvent(new Event('keyup'));

    jest.advanceTimersByTime(500);
    expect(host.searchEvents).toEqual(['ab']);
  });

  it('does not emit search events from typing when online is false', async () => {
    await createSearchHost((h) => (h.hostShowSearch = true));

    jest.useFakeTimers();
    const input = searchInputElement();
    input.value = 'abc';
    input.dispatchEvent(new Event('keyup'));

    jest.advanceTimersByTime(600);
    expect(host.searchEvents).toEqual([]);
  });
});
