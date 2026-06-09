import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
import { importProvidersFrom, LOCALE_ID } from '@angular/core';
import { applicationConfig, type Preview } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { IntlModule } from '@progress/kendo-angular-intl';
import '@progress/kendo-angular-intl/locales/ru/all';
import {
  AllCommunityModule,
  ModuleRegistry,
  provideGlobalGridOptions,
} from 'ag-grid-community';

registerLocaleData(localeRu);
ModuleRegistry.registerModules([AllCommunityModule]);
provideGlobalGridOptions({ theme: 'legacy' });

const preview: Preview = {
  decorators: [
    applicationConfig({
      providers: [
        importProvidersFrom(IntlModule),
        { provide: LOCALE_ID, useValue: 'ru-RU' },
        provideAnimations(),
      ],
    }),
  ],
  parameters: {
    layout: 'padded',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
