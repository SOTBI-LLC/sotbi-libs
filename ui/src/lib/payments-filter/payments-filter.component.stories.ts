import { provideAnimations } from '@angular/platform-browser/animations';
import {
  BeetwenType,
  PaymentsFilter,
  type ActualAccount,
  type Label,
} from '@sotbi/models';
import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { fn } from 'storybook/test';

import { PaymentsFilterComponent } from './payments-filter.component';

const mockLabels: Label[] = [
  {
      "id": 1,
      "name": "Вознаграждение",
      "color": "#ccccff",
      "description": "Одновременное выполнение условий: \n(1) ИНН плательщика = ИНН должника \n(2) В назначение платежа входит строка \"возн\" и/или \"услуг\""
  },
  {
      "id": 2,
      "name": "Возмещение",
      "color": "#ccccff",
      "description": "Одновременное выполенение условий: (1) ИНН плательщика = ИНН должника (2) В назначение платежа входит строка \"возм\" и/или \"расх\""
  },
  {
      "id": 3,
      "name": "КоммерсантЪ",
      "color": "#bfad6f",
      "description": "ИНН получателя  = 7707120552 "
  },
  {
      "id": 4,
      "name": "Местный источник",
      "color": "#e0a8e1",
      "description": "ИНН получателя =  ИНН Московский комсомолец = 7719464149"
  },
  {
      "id": 5,
      "name": "Комиссии банка",
      "color": "#d88b85",
      "description": "Одновременное выполнение условий:\n(1) ИНН получателя = 7702070139\n(2) Вхождение строки \"комиссия\" в назначение платежа"
  },
  {
      "id": 6,
      "name": "ЭТП",
      "color": "#d2f9ec",
      "description": "Одновременное выполнение двух условий: (1) ИНН получателя = 7725752265 (2) Вхождение строки \"услуг\" и/или \"доступ\" и/или \"счет\""
  },
  {
      "id": 7,
      "name": "Задатки",
      "color": "#eaeaea",
      "description": "Вхождение строк \"задаток\" и/или \"задатки\" в назначение платежа"
  },
  {
      "id": 9,
      "name": "Интерфакс",
      "color": "#a7d5dc",
      "description": "ИНН получателя = 7710137066"
  },
  {
      "id": 15,
      "name": "Депонирование",
      "color": "#b3cfa0",
      "description": "Одновременное выполнение условий: \n(1) ИНН плательщика = 7702070139 \n(2) Вхождение строки \"процент\" и/или \"депозит\""
  },
  {
      "id": 16,
      "name": "СРО",
      "color": "#ffca95",
      "description": "ИНН Получателя = ИНН СРО из справочника СРО"
  },
  {
      "id": 17,
      "name": "Задепонированные",
      "color": "#dcdcad",
      "description": "Вхождение строки"
  },
  {
      "id": 999,
      "name": "Не распознанные",
      "description": "Вхождение строки",
      "color": "#e0f5fc"
  },
  {
      "id": 1000,
      "name": "Займы",
      "color": "#e0f5fc",
      "description": "Вхождение строки \"займ\" в назначение платежа"
  }
]

const mockActuals: ActualAccount[] = [
  {
      "id": 1,
      "name": "40702810600000024981, \"НИС\" АО, ВТБ24, 05.11.2020"
  },
  {
      "id": 59,
      "name": "40702810200000085058, \"Агора\" ООО, ВТБ, 05.11.2020"
  },
  {
      "id": 81,
      "name": "40702810400000141459, \"ПарадизГрупп\" ООО, ВТБ, 05.11.2020"
  },
  {
      "id": 102,
      "name": "40702810802390003538, \"Аукционный дом \"ФОРУМ\" ООО - ликвидирован, Альфа, 12.08.2025"
  },
  {
      "id": 104,
      "name": "40702810701480004521, \"Агора\" ООО, ФК Открытие 701, 17.02.2021"
  },
  {
      "id": 547,
      "name": "40702810420010004447, \"Ассет Менеджмент\" ООО, Ассет ЮниКредит, 17.02.2025"
  },
  {
      "id": 623,
      "name": "40702810600000141459, \"ПарадизГрупп\" ООО, ВТБ , 27.05.2026"
  },
  {
      "id": 624,
      "name": "40702810400000085058, \"Агора\" ООО, ВТБ, 27.05.2026"
  },
  {
      "id": 625,
      "name": "40702810800000024981, \"НИС\" АО, ВТБ, 03.06.2026"
  },
  {
      "id": 730,
      "name": "40702810138110101030, \"Ассет Менеджмент\" ООО, Ассет ПАО Сбербанк, 24.05.2026"
  },
  {
      "id": 16827355172416,
      "name": "40702810100249212571, \"Ассет Менеджмент\" ООО, Ассет ВТБ, 24.05.2026"
  },
  {
      "id": 18599368458304,
      "name": "40702810412010689563, \"Ассет Менеджмент\" ООО, Ассет Совкомбанк, 27.05.2026"
  },
  {
      "id": 43662614504512,
      "name": "40702810800240001243, \"Аукционный дом \"ФОРУМ\" ООО - ликвидирован, ВТБ, 12.05.2024"
  }
];

const meta: Meta<PaymentsFilterComponent> = {
  title: 'PaymentsFilter',
  component: PaymentsFilterComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
  args: {
    labels: mockLabels,
    actuals: mockActuals,
    filterEvent: fn(),
  },
};

export default meta;

type Story = StoryObj<PaymentsFilterComponent>;

export const Default: Story = {
  args: {
    filter: new PaymentsFilter({
      start: new Date(),
      end: new Date(),
      between: BeetwenType.TODAY,
    }),
  },
};

export const CustomDateRange: Story = {
  args: {
    filter: new PaymentsFilter({
      start: new Date(2025, 0, 1),
      end: new Date(2025, 0, 31),
      between: BeetwenType.CUSTOM,
    }),
  },
};

export const CurrentMonth: Story = {
  args: {
    filter: new PaymentsFilter({
      start: new Date(),
      end: new Date(),
      between: BeetwenType.CURR_MONTH,
    }),
  },
};

export const LastSevenDays: Story = {
  args: {
    filter: new PaymentsFilter({
      start: new Date(),
      end: new Date(),
      between: BeetwenType.LAST_7DAYS,
    }),
  },
};

export const WithSelections: Story = {
  args: {
    filter: new PaymentsFilter({
      start: new Date(2025, 5, 1),
      end: new Date(2025, 5, 15),
      between: BeetwenType.CUSTOM,
      label_id: [1, 2],
      bank_detail_id: [1],
    }),
  },
};

export const EmptyOptions: Story = {
  args: {
    labels: [],
    actuals: [],
    filter: new PaymentsFilter({
      start: new Date(),
      end: new Date(),
      between: BeetwenType.TODAY,
    }),
  },
};
