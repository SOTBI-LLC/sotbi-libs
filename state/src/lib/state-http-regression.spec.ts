import { TestBed } from '@angular/core/testing';
import { provideStore, Store } from '@ngxs/store';
import {
  InsuranceCompanyService,
  SimpleEditService,
  EfrsbMessageService,
  PaymentAttachmentService,
} from '@sotbi/data-access';
import { defer, EMPTY, firstValueFrom, of, Subject } from 'rxjs';
import { InsuranceCompanyState } from './insurance-company.state';
import {
  GetCompany,
  AddCompany,
  UpdateCompany,
} from './insurance-company.actions';
import { PersonsState } from './persons.state';
import { DeletePerson } from './persons.actions';
import { EfrsbMessageState } from './efrsb-message.state';
import { UpdateEfrsbMessage } from './efrsb-message.actions';
import { PaymentAttachmentState } from './payment-attachment.state';
import { UpdatePaymentAttachment } from './payment-attachment.actions';

class Item {
  public id = 1;
  public name = 'Обновлённый';
}
describe('insurance company HTTP actions', () => {
  it.each(['get', 'create', 'update'])(
    'executes %s and updates the selected company',
    async (operation) => {
      const result = new Item();
      const response = () => defer(() => of(result));
      TestBed.configureTestingModule({
        providers: [
          provideStore([InsuranceCompanyState], { developmentMode: true }),
          {
            provide: InsuranceCompanyService,
            useValue: {
              getall: () => EMPTY,
              getAll: () => EMPTY,
              GetAll: () => EMPTY,
              get: response,
              create: response,
              update: response,
            },
          },
        ],
      });
      const store = TestBed.inject(Store);
      const initial = store.snapshot();
      const key = Object.keys(initial)[0];
      store.reset({
        ...initial,
        [key]: {
          ...initial[key],
          items: [],
          selected: { ...result, name: 'Исходный' },
          count: 0,
        },
      });
      const action =
        operation === 'get'
          ? new GetCompany(1)
          : operation === 'create'
            ? new AddCompany(result as never)
            : new UpdateCompany(result as never);
      await firstValueFrom(store.dispatch(action));
      expect(store.selectSnapshot<Item>((s) => s[key].selected)).toEqual(
        result,
      );
      expect(store.selectSnapshot<boolean>((s) => s[key].loading)).toBe(false);
    },
  );
});

it('executes person deletion and removes the record', async () => {
  TestBed.configureTestingModule({
    providers: [
      provideStore([PersonsState], { developmentMode: true }),
      {
        provide: SimpleEditService,
        useValue: {
          getAll: () => EMPTY,
          delete: () => defer(() => of(undefined)),
        },
      },
    ],
  });
  const store = TestBed.inject(Store);
  const initial = store.snapshot();
  const key = Object.keys(initial)[0];
  store.reset({ ...initial, [key]: { ...initial[key], items: [new Item()] } });
  await firstValueFrom(store.dispatch(new DeletePerson(1)));
  expect(store.selectSnapshot<Item[]>((s) => s[key].items)).toEqual([]);
});

it('preserves list changes and a different selected card while an EFRSB save is pending', async () => {
  const response = new Subject<Item>();
  const result = new Item();
  TestBed.configureTestingModule({
    providers: [
      provideStore([EfrsbMessageState], { developmentMode: true }),
      {
        provide: EfrsbMessageService,
        useValue: {
          getall: () => EMPTY,
          getAll: () => EMPTY,
          GetAll: () => EMPTY,
          update: () => response,
        },
      },
    ],
  });
  const store = TestBed.inject(Store);
  const initial = store.snapshot();
  const key = Object.keys(initial)[0];
  const original = { ...result, name: 'Исходный' };
  const other = { id: 2, name: 'Добавленный' };
  store.reset({
    ...initial,
    [key]: { ...initial[key], items: [original], selected: original },
  });
  const pending = firstValueFrom(
    store.dispatch(new UpdateEfrsbMessage(result as never)),
  );
  const state = store.snapshot();
  store.reset({
    ...state,
    [key]: { ...state[key], items: [original, other], selected: other },
  });
  response.next(result);
  response.complete();
  await pending;
  expect(store.selectSnapshot<Item[]>((s) => s[key].items)).toEqual([
    result,
    other,
  ]);
  expect(store.selectSnapshot<Item>((s) => s[key].selected)).toEqual(other);
});

it('updates a payment attachment opened outside the current list', async () => {
  const result = new Item();
  TestBed.configureTestingModule({
    providers: [
      provideStore([PaymentAttachmentState], { developmentMode: true }),
      {
        provide: PaymentAttachmentService,
        useValue: {
          getall: () => EMPTY,
          getAll: () => EMPTY,
          GetAll: () => EMPTY,
          update: () => of(result),
        },
      },
    ],
  });
  const store = TestBed.inject(Store);
  const initial = store.snapshot();
  const key = Object.keys(initial)[0];
  store.reset({
    ...initial,
    [key]: {
      ...initial[key],
      items: [],
      selected: { ...result, name: 'Исходный' },
    },
  });
  await firstValueFrom(
    store.dispatch(new UpdatePaymentAttachment(result as never)),
  );
  expect(store.selectSnapshot<Item>((s) => s[key].selected)).toEqual(result);
  expect(store.selectSnapshot<Item[]>((s) => s[key].items)).toEqual([]);
});
