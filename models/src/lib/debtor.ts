import type { ActionPlan } from './actionplan';
import type { Arbitration } from './arbitration';
import type { BankDetail } from './bankdetail';
import type { Bankruptcy } from './bankruptcy';
import type { Bidding } from './bidding';
import type { InsurancePolicy } from './insurance-policy';
import type { Link } from './link';
import type { Project } from './project';
import type { Property } from './property';
import type { SimpleEdit2Model, SimpleEditModel } from './simple-edit';
import type { ClrSelectedState } from './staff';

export class Debtor {
  public id = 0;
  public name = ''; // Должник (наименование)
  public full_name = '';
  public inn = '';
  public kpp = '';
  public ogrn = '';
  public address = '';
  public post_address = '';
  public post_address_match = false;
  public arbitration: Arbitration | null = null;
  public arbitration_id = '';
  public case_no = '';
  public decision_date: Date | null = null;
  public initiation_date: Date | null = null;
  public procedure_date: Date | null = null;
  public bankruptcy_manager_id = 0;
  public bankruptcy_manager: Bankruptcy | null = null;
  public biddings: Bidding[] = [];
  public contacts = '';
  public bank_details: BankDetail[] = [];
  public project_id = 0;
  public project: Project | null = null;
  public project_name = '';
  public stage_id: number | null = null; // Стадия
  public stage: SimpleEditModel | null = null;
  public kind: boolean | null = null; // Вид, TRUE=физ.лицо FALSE=юр.лицо
  public reportable: boolean | null = null; // Выводить ли должника в отчет для клиента
  public category_id = 0;
  public category: SimpleEdit2Model | null = null;
  public procedure_id = 0;
  public procedure: SimpleEdit2Model | null = null;
  public links: Link[] = []; // Таблица ссылок: Тип | Значение
  public registry = 0; //          Общий РТК (все очереди)
  public deposit = 0; //           Общая сумма сопровождаемых требований
  public not_deposit = 0; //       Сумма сопровождаемых требований, обеспеченных залогом
  public deposit_share = 0; //     от реестра с залогом (наблюдение)
  public not_deposit_share = 0; // от реестра без залога (конкурс)
  public assets: SimpleEditModel[] = []; // Виды ценного имущества
  public properties: Property[] = []; // Список имущества
  public targets: SimpleEditModel[] = []; //     Поставленные цели
  public persons: SimpleEditModel[] = []; //    Представляемые лица
  public incomes: SimpleEdit2Model[] = []; //    Источники дохода
  public expenses: SimpleEdit2Model[] = []; //  Статьи расходов
  public income_date: Date | null = null; //    Плановая дата получения прибыли
  public comments = ''; //     Комментарий к финансовому плану
  public profit_cat: SimpleEditModel | null = null; // Категория прибыльности
  public profit_cat_id = 0;
  public created_at: Date | null = null; // Дата добавления должника в базу
  public action_plans: ActionPlan[] = []; // Планируемые процедуры
  public insurance_policies: InsurancePolicy[] = []; // Страховые полисы
  public updated_at: Date | null = null;
  public selected: boolean | ClrSelectedState | null = null;

  constructor(data: Partial<Debtor> = {}) {
    Object.assign(this, data);
  }
}

export class DebtorsList {
  public id = 0;
  public name = ''; // Должник (наименование)
  public debtor_created_at: Date | null = null;
  public full_name = '';
  public koordinator = '';
  public group1 = '';
  public group2 = '';
  public state = '';
  public inn = '';
  public kpp = '';
  public ogrn = '';
  public address = '';
  public post_address = '';
  public arbitration_name = '';
  public case_no = '';
  public decision_date: Date | null = null;
  public initiation_date: Date | null = null;
  public procedure_date: Date | null = null;
  public bankruptcy_name = '';
  public bankruptcy_manager_id = 0;
  public sro = '';
  public contacts: string | null = null;
  public project_id = 0;
  public project: Project | null = null;
  public project_name = '';
  public project_created_at: Date | null = null;
  public stage_name = ''; // Стадия
  public kind = '';
  public category_name = '';
  public procedure_name = '';
  public registry = 0; //          Общий РТК (все очереди)
  public deposit = 0; //           Общая сумма сопровождаемых требований
  public not_deposit = 0; //       Сумма сопровождаемых требований, обеспеченных залогом
  public deposit_share = 0; //     от реестра с залогом (наблюдение)
  public not_deposit_share = 0; // от реестра без залога (конкурс)
  public reportable = '';
  public comments = ''; //     Комментарий к финансовому плану
  public profit_cat_name = '';
  public links: Link[] = []; // Таблица ссылок: Тип | Значение
  public property: Property[] = []; // Список имущества
  public assets: SimpleEditModel[] = []; // Виды ценного имущества
  public created_at: Date | null = null; // Дата добавления должника в базу

  constructor(data: Partial<DebtorsList> = {}) {
    Object.assign(this, data);
  }
}
