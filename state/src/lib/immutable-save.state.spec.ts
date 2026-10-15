import { SimpleEdit2Service, DepositService } from '@sotbi/data-access';
import { ProcedureState } from './procedure.state';
import { EditProcedure } from './procedure.actions';
import { FlowState } from './flow.state';
import { EditFlow } from './flow.actions';
import { AdvertTypesState } from './adverttype.state';
import { EditAdvertType } from './adverttype.actions';
import { CategoryState } from './category.state';
import { EditCategory } from './category.actions';
import { DepositsState } from './deposits.state';
import { EditDeposit } from './deposits.actions';
import { TestBed } from '@angular/core/testing';
import type { Type } from '@angular/core';
import { provideStore, Store } from '@ngxs/store';
import {
  MessageTypeService,
  InsurancePolicyService,
  CounterpartyService,
  SubMessageTypeService,
  TransitionService,
  DefraymentService,
  HelpFileService,
  StaffTypeService,
  SimpleEditService,
  LabelService,
} from '@sotbi/data-access';
import { firstValueFrom, EMPTY, of, Subject } from 'rxjs';
import { EfrsbMessageTypeState } from './message-type.state';
import { UpdateMessageType } from './message-type.actions';
import { InsurancePolicyState } from './insurance-policy.state';
import { UpdateInsurancePolicy } from './insurance-policy.actions';
import { CounterpartyState } from './counterparty.state';
import { UpdateCounterparty } from './counterparty.actions';
import { EfrsbSubMessageTypeState } from './sub-message-type.state';
import { UpdateSubMessageType } from './sub-message-type.actions';
import { TransitionState } from './transition.state';
import { UpdateTransition } from './transition.actions';
import { DefraymentState } from './defrayment.state';
import { UpdateDefrayment } from './defrayment.actions';
import { HelpFileState } from './help-file.state';
import { UpdateHelpFile } from './help-file.actions';
import { StaffTypeState } from './staff-type.state';
import { EditStaffItem } from './staff-type.actions';
import { TargetsState } from './targets.state';
import { EditTarget } from './targets.actions';
import { StageState } from './stages.state';
import { EditStage } from './stages.actions';
import { ClientsState } from './clients.state';
import { EditClient } from './clients.actions';
import { AssetsState } from './assets.state';
import { EditAsset } from './assets.actions';
import { AccountTypesState } from './accounttypes.state';
import { EditAccountType } from './accounttypes.actions';
import { ProfitsState } from './profits.state';
import { EditProfit } from './profits.actions';
import { AttachmentTypesState } from './attachmenttypes.state';
import { EditAttachmentType } from './attachmenttypes.actions';
import { LabelsState } from './labels.state';
import { EditLabel } from './labels.actions';
import { LinkState } from './links.state';
import { EditLink } from './links.actions';

class TestItem {
  public id = 1;
  public name = 'Обновлённый';
  public kind = true;
  public dirty = false;
}
class TestState {
  public items: TestItem[] = [];
  public selected: TestItem | null = null;
}
const cases = [
  {
    name: 'ProcedureState',
    state: ProcedureState,
    service: SimpleEdit2Service,
    action: (item: TestItem) => new EditProcedure(item as never),
  },
  {
    name: 'FlowState',
    state: FlowState,
    service: SimpleEdit2Service,
    action: (item: TestItem) => new EditFlow(item as never),
  },
  {
    name: 'AdvertTypesState',
    state: AdvertTypesState,
    service: SimpleEdit2Service,
    action: (item: TestItem) => new EditAdvertType(item as never),
  },
  {
    name: 'CategoryState',
    state: CategoryState,
    service: SimpleEdit2Service,
    action: (item: TestItem) => new EditCategory(item as never),
  },
  {
    name: 'DepositsState',
    state: DepositsState,
    service: DepositService,
    action: (item: TestItem) => new EditDeposit(item as never),
  },
  {
    name: 'EfrsbMessageTypeState',
    state: EfrsbMessageTypeState,
    service: MessageTypeService,
    action: (item: TestItem) => new UpdateMessageType(item as never),
  },
  {
    name: 'InsurancePolicyState',
    state: InsurancePolicyState,
    service: InsurancePolicyService,
    action: (item: TestItem) => new UpdateInsurancePolicy(item as never),
  },
  {
    name: 'CounterpartyState',
    state: CounterpartyState,
    service: CounterpartyService,
    action: (item: TestItem) => new UpdateCounterparty(item as never),
  },
  {
    name: 'EfrsbSubMessageTypeState',
    state: EfrsbSubMessageTypeState,
    service: SubMessageTypeService,
    action: (item: TestItem) => new UpdateSubMessageType(item as never),
  },
  {
    name: 'TransitionState',
    state: TransitionState,
    service: TransitionService,
    action: (item: TestItem) => new UpdateTransition(item as never),
  },
  {
    name: 'DefraymentState',
    state: DefraymentState,
    service: DefraymentService,
    action: (item: TestItem) => new UpdateDefrayment(item as never),
  },
  {
    name: 'HelpFileState',
    state: HelpFileState,
    service: HelpFileService,
    action: (item: TestItem) => new UpdateHelpFile(item as never),
  },
  {
    name: 'StaffTypeState',
    state: StaffTypeState,
    service: StaffTypeService,
    action: (item: TestItem) => new EditStaffItem(item as never),
  },
  {
    name: 'TargetsState',
    state: TargetsState,
    service: SimpleEditService,
    action: (item: TestItem) => new EditTarget(item as never),
  },
  {
    name: 'StageState',
    state: StageState,
    service: SimpleEditService,
    action: (item: TestItem) => new EditStage(item as never),
  },
  {
    name: 'ClientsState',
    state: ClientsState,
    service: SimpleEditService,
    action: (item: TestItem) => new EditClient(item as never),
  },
  {
    name: 'AssetsState',
    state: AssetsState,
    service: SimpleEditService,
    action: (item: TestItem) => new EditAsset(item as never),
  },
  {
    name: 'AccountTypesState',
    state: AccountTypesState,
    service: SimpleEditService,
    action: (item: TestItem) => new EditAccountType(item as never),
  },
  {
    name: 'ProfitsState',
    state: ProfitsState,
    service: SimpleEditService,
    action: (item: TestItem) => new EditProfit(item as never),
  },
  {
    name: 'AttachmentTypesState',
    state: AttachmentTypesState,
    service: SimpleEditService,
    action: (item: TestItem) => new EditAttachmentType(item as never),
  },
  {
    name: 'LabelsState',
    state: LabelsState,
    service: LabelService,
    action: (item: TestItem) => new EditLabel(item as never),
  },
  {
    name: 'LinkState',
    state: LinkState,
    service: SimpleEditService,
    action: (item: TestItem) => new EditLink(item as never),
  },
];

describe.each(cases)('$name saving', ({ state, service, action }) => {
  it.each([true, false])(
    'saves an existing or directly opened item without changing previous state (in list: %s)',
    async (present) => {
      const updated = new TestItem();
      const api = {
        save: jest.fn(() => of(updated)),
        update: jest.fn(() => of(updated)),
        save$: jest.fn(() => of(updated)),
        GetAll: () => EMPTY,
        getAll: () => EMPTY,
        getall: () => EMPTY,
        getall$: () => EMPTY,
        getItems$: () => EMPTY,
        getList$: () => EMPTY,
        get: () => EMPTY,
      };
      TestBed.configureTestingModule({
        providers: [
          provideStore([state as Type<unknown>], { developmentMode: true }),
          { provide: service, useValue: api },
        ],
      });
      const store = TestBed.inject(Store);
      const initial: Record<string, TestState> = store.snapshot();
      const key = Object.keys(initial)[0];
      const original = { ...updated, name: 'Исходный' };
      const other = { ...updated, id: 2, name: 'Другой' };
      const items = present ? [original, other] : [other];
      store.reset({
        ...initial,
        [key]: { ...initial[key], items, selected: original },
      });
      const previous = store.selectSnapshot<TestItem[]>((s) => s[key].items);
      await firstValueFrom(store.dispatch(action(updated)));
      expect(store.selectSnapshot<TestItem[]>((s) => s[key].items)).toEqual(
        present ? [updated, other] : [other],
      );
      expect(previous).toEqual(items);
    },
  );

  it('keeps a different card selected while a save response is pending', async () => {
    const response = new Subject<TestItem>();
    const api = {
      update: () => response,
      save: () => response,
      save$: () => response,
      GetAll: () => EMPTY,
      getAll: () => EMPTY,
      getall: () => EMPTY,
    };
    TestBed.configureTestingModule({
      providers: [
        provideStore([state as Type<unknown>], { developmentMode: true }),
        { provide: service, useValue: api },
      ],
    });
    const store = TestBed.inject(Store);
    const initial = store.snapshot();
    const key = Object.keys(initial)[0];
    const updated = new TestItem();
    const original = { ...updated, name: 'Исходный' };
    const other = { ...updated, id: 2, name: 'Другая карточка' };
    store.reset({
      ...initial,
      [key]: { ...initial[key], items: [original], selected: original },
    });
    const pending = firstValueFrom(store.dispatch(action(updated)));
    const current = store.snapshot();
    store.reset({
      ...current,
      [key]: { ...current[key], items: [original, other], selected: other },
    });
    response.next(updated);
    response.complete();
    await pending;
    expect(store.selectSnapshot<TestItem>((s) => s[key].selected)).toEqual(
      other,
    );
    expect(store.selectSnapshot<TestItem[]>((s) => s[key].items)).toEqual([
      updated,
      other,
    ]);
  });
});
