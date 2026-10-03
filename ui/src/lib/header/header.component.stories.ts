import { provideRouter } from '@angular/router';
import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular';
import { ClarityIcons, angleIcon, userIcon, boltIcon } from '@clr/angular/icon';

import { HeaderComponent, type HeaderLink } from '@sotbi/ui';
import { type HeaderBrand, type HeaderUser } from '@sotbi/ui';
import { LeftNavBarComponent, type LeftNavBarItem } from '@sotbi/ui';

ClarityIcons.addIcons(angleIcon, userIcon, boltIcon);

// Собственный ресурс логотипа истории, без assets приложений
const logoUrl =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='20' cy='20' r='18' fill='%233b82f6'/%3E%3C/svg%3E";

const brand: HeaderBrand = {
  title: 'Our Zoo',
  logoUrl,
  homeLink: '/',
};

const user: HeaderUser = { name: 'Tester', avatarUrl: logoUrl };

const items: HeaderLink[] = [
  { label: 'Мотивация', routerLink: '/motivation' },
  { label: 'Трудозатраты', routerLink: '/costs' },
  { label: 'Банкротство', routerLink: '/bankruptcy' },
  { label: 'Платежи', routerLink: '/payments' },
  { label: 'Сотрудники', routerLink: '/staff' },
];

const accountItems: HeaderLink[] = [
  { label: 'Админка', routerLink: '/admin' },
  { label: 'Персональная информация', routerLink: '/staff/users/1' },
];

const meta: Meta<HeaderComponent> = {
  title: 'Header',
  component: HeaderComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideRouter([])],
    }),
  ],
  render: (args) => ({
    props: args,
    template: `
      <clr-main-container class="story-main-container">
        <sotbi-header
          [loggedIn]="loggedIn"
          [brand]="brand"
          [user]="user"
          [items]="items"
          [accountItems]="accountItems"
          [online]="online"
          [showSearch]="showSearch"
          [phrase]="phrase"
        />
      </clr-main-container>
    `,
    styles: [
      `
        .story-main-container {
          min-height: 320px;
        }
      `,
    ],
  }),
};

export default meta;

type Story = StoryObj<HeaderComponent>;

export const Authenticated: Story = {
  args: {
    loggedIn: true,
    brand,
    user,
    items,
    accountItems,
    online: false,
    showSearch: false,
    phrase: '',
  },
};

export const WithSearch: Story = {
  args: {
    ...Authenticated.args,
    showSearch: true,
    phrase: 'должник',
  },
};

export const NotLoggedIn: Story = {
  args: {
    ...Authenticated.args,
    loggedIn: false,
  },
};

export const NarrowWidth: Story = {
  args: { ...Authenticated.args, showSearch: true },
  render: (args) => ({
    props: args,
    template: `
      <div class="narrow-wrapper">
        <clr-main-container class="story-main-container">
          <sotbi-header
            [loggedIn]="true"
            [brand]="brand"
            [user]="user"
            [items]="items"
            [accountItems]="accountItems"
            [showSearch]="true"
          />
        </clr-main-container>
      </div>
    `,
    styles: [
      `
        .narrow-wrapper {
          width: 720px;
          max-width: 100%;
          border: 1px dashed #b3b3b3;
        }
        .narrow-wrapper .story-main-container {
          min-height: 280px;
        }
      `,
    ],
  }),
};

const navItems: LeftNavBarItem[] = [
  { label: 'Трудозатраты', icon: 'user', routerLink: '/costs' },
  {
    label: 'Банкротство',
    icon: 'bolt',
    expanded: true,
    children: [
      { label: 'Должники', icon: 'bolt', routerLink: '/bankruptcy/debtors' },
      { label: 'Торги', icon: 'bolt', routerLink: '/bankruptcy/auctions' },
    ],
  },
  { label: 'Платежи', icon: 'user', routerLink: '/payments' },
];

export const WithLeftNav: Story = {
  args: { ...Authenticated.args },
  render: (args) => ({
    props: { ...args, navItems },
    template: `
      <clr-main-container class="story-main-container">
        <sotbi-header
          [loggedIn]="true"
          [brand]="brand"
          [user]="user"
          [items]="items"
          [accountItems]="accountItems"
        />
        <div class="content-container story-content-container">
          <left-nav-bar [items]="navItems" [colabsible]="true" />
          <div class="content-area wide"></div>
        </div>
      </clr-main-container>
    `,
    styles: [
      `
        .story-main-container {
          min-height: 480px;
        }
        .story-content-container {
          height: 420px;
          background: #e4e7ea;
        }
        .story-content-container .clr-vertical-nav {
          height: 100%;
        }
      `,
    ],
  }),
};
