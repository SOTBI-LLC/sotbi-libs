import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
import { LOCALE_ID } from '@angular/core';
import { applicationConfig, type Preview } from '@storybook/angular';

registerLocaleData(localeRu);
const preview: Preview = {
  decorators: [
    applicationConfig({
      providers: [{ provide: LOCALE_ID, useValue: 'ru-RU' }],
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
