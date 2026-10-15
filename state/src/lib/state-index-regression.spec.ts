import { TestBed } from '@angular/core/testing';
import type { Type } from '@angular/core';
import { provideStore, Store } from '@ngxs/store';
import {
  AccessService,
  UsergroupService,
  BankruptcyService,
  InsuranceCompanyService,
  DebtorService,
  DepositService,
  LabelService,
} from '@sotbi/data-access';
import { EMPTY, firstValueFrom, of } from 'rxjs';
import { AccessState } from './access.state';
import { DeleteAccess } from './access.actions';
import { UserGroupState } from './usergroup.state';
import { DeleteUserGroup } from './usergroup.actions';
import { BankruptcyState } from './bankruptcy.state';
import { DeleteBankruptcyPolicy } from './bankruptcy.actions';
import { InsuranceCompanyState } from './insurance-company.state';
import { DeleteInsurancePolicy } from './insurance-company.actions';
import { DebtorsState } from './debtors.state';
import { DeleteDebtorPolicy, UpdateDebtorPolicy } from './debtors.actions';
import { DepositsState } from './deposits.state';
import { GetDeposit } from './deposits.actions';
import { LabelsState } from './labels.state';
import { GetLabel } from './labels.actions';

class Item {
  public id = 1;
  public name = 'Первый';
}
class Selection {
  public id = 1;
  public insurance_policies: Item[] = [];
}
function setup(
  state: Type<unknown>,
  service: Type<unknown>,
  seed: Record<string, unknown>,
  api: Record<string, unknown> = {},
) {
  TestBed.configureTestingModule({
    providers: [
      provideStore([state], { developmentMode: true }),
      {
        provide: service,
        useValue: {
          getall: () => EMPTY,
          getAll: () => EMPTY,
          GetAll: () => EMPTY,
          getList: () => EMPTY,
          delete: () => of(undefined),
          ...api,
        },
      },
    ],
  });
  const store = TestBed.inject(Store);
  const initial = store.snapshot();
  const key = Object.keys(initial)[0];
  store.reset({ ...initial, [key]: { ...initial[key], ...seed } });
  return { store, key };
}

describe.each([
  {
    state: AccessState,
    service: AccessService,
    action: () => new DeleteAccess(999),
  },
  {
    state: UserGroupState,
    service: UsergroupService,
    action: () => new DeleteUserGroup(999),
  },
])('deleting an id absent from $state.name', ({ state, service, action }) => {
  it('preserves other visible records', async () => {
    const item = new Item();
    const { store, key } = setup(state, service, {
      items: [item],
      selected: item,
      count: 1,
    });
    await firstValueFrom(store.dispatch(action()));
    expect(store.selectSnapshot<Item[]>((s) => s[key].items)).toEqual([item]);
  });
});

describe.each([
  {
    state: BankruptcyState,
    service: BankruptcyService,
    action: (id: number) => new DeleteBankruptcyPolicy(id),
  },
  {
    state: InsuranceCompanyState,
    service: InsuranceCompanyService,
    action: (id: number) => new DeleteInsurancePolicy(id),
  },
  {
    state: DebtorsState,
    service: DebtorService,
    action: (id: number) => new DeleteDebtorPolicy(id),
  },
])('removing policies from $state.name', ({ state, service, action }) => {
  it.each([1, 999])(
    'removes the first policy or leaves unknown ids alone (%s)',
    async (id) => {
      const first = new Item();
      const last = { id: 2, name: 'Последний' };
      const selected = { id: 1, insurance_policies: [first, last] };
      const { store, key } = setup(state, service, {
        selected,
        items: [],
        debtors: [],
      });
      await firstValueFrom(store.dispatch(action(id)));
      expect(
        store.selectSnapshot<Selection>((s) => s[key].selected)
          .insurance_policies,
      ).toEqual(id === 1 ? [last] : [first, last]);
    },
  );
});

it('updates the first debtor policy without mutating the previous selection', async () => {
  const original = { id: 1, insurance_policies: [new Item()] };
  const updated = { id: 1, name: 'Обновлённый' };
  const { store, key } = setup(DebtorsState, DebtorService, {
    selected: original,
    debtors: [],
  });
  const previous = store.selectSnapshot<Selection>((s) => s[key].selected);
  await firstValueFrom(
    store.dispatch(new UpdateDebtorPolicy(updated as never)),
  );
  expect(
    store.selectSnapshot<Selection>((s) => s[key].selected).insurance_policies,
  ).toEqual([updated]);
  expect(previous.insurance_policies[0].name).toBe('Первый');
});

describe.each([
  {
    state: DepositsState,
    service: DepositService,
    action: () => new GetDeposit(7),
  },
  { state: LabelsState, service: LabelService, action: () => new GetLabel(7) },
])('opening an uncached $state.name record', ({ state, service, action }) => {
  it('loads the selected record without adding it to the filtered list', async () => {
    const selected = { id: 7, name: 'Загруженный' };
    const { store, key } = setup(
      state,
      service,
      { items: [] },
      { get: () => of(selected) },
    );
    await firstValueFrom(store.dispatch(action()));
    expect(store.selectSnapshot<Item>((s) => s[key].selected)).toEqual(
      selected,
    );
    expect(store.selectSnapshot<Item[]>((s) => s[key].items)).toEqual([]);
  });
});
