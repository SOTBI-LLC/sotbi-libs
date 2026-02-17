export const maskForSumm = {
  mask: Number,
  scale: 2,
  signed: false,
  thousandsSeparator: ' ',
  padFractionalZeros: true, // добавляет нули после запятой
  normalizeZeros: false, // убирает 0 после запятой
  radix: '.',
  mapToRadix: [','],
};

// tslint:disable: no-bitwise
export enum Level {
  GUEST = 1, // 1 = Без доступа в систему (для уволенных или утративших доверие)
  OFFICE = 1 << 1, // 2 = Холдинг: Сотрудник вне ПГ (только заполняет трудозатраты)
  LAWYER = 1 << 2, // 4 = Холдинг: Сотрудник ПГ (видит проекты своей ПГ)
  SELLER_UNTRUSTED = 1 << 3, // 8 = Торги: Организатор недоверенный
  SELLER_TRUSTED = 1 << 4, // 16 = Организатор торгов / Торги: Организатор
  RPG = 1 << 5, // 32 = Холдинг: РПГ/АУ/Менеджер
  SELLER_ACCOUNTANT = 1 << 6, // 64 = Торги: Бухгалтер
  SELLER_RPG = 1 << 7, // 128 = РПГ организаторов торгов / Торги: РПГ ОТ
  ADMIN = 1 << 8, // 256 = Админ
  HR = 1 << 9, // 512 = Холдинг: HR
  ACCOUNTANT_OPERATION = 1 << 10, // 1024 = Холдинг: Операционист
  FINMANAGER = 1 << 11, // 2048 = Холдинг: Финансовый директор
  BOSS = 1 << 12, // 4096 = Холдинг: Шеф и партнеры
  SELLER_FINANCE = 1 << 13, // 8192 = Торги: Финансист ОТ
  ACCOUNTANT_CHIEF = 1 << 14, // 16384 =  Холдинг: Бухгалтер
  CORP = 1 << 15, // 32768 = Корп. юрист / Холдинг: Корп.юрист
}
// tslint:enable: no-bitwise
