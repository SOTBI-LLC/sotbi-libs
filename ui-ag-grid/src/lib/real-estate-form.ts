import type { FormControl } from '@angular/forms';

/**
 * Публичный контракт формы строки недвижимости. Приложение создаёт контролы
 * своими фабриками и валидаторами; библиотека описывает только структуру.
 */
export interface RealEstateForm {
  id?: FormControl<number | null>;
  cadastral_no: FormControl<string>;
  parameters: FormControl<string>;
  request_num: FormControl<string>;
  key: FormControl<string>;
  file: FormControl<string>;
  original_file_name: FormControl<string>;
  description: FormControl<string>;
}
