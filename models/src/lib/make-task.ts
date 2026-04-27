import type { FilterModel } from 'ag-grid-community';

export interface TaskResponse {
  task_id: bigint;
  status: string;
}

export interface DebtorDownloadRequest {
  accounts: string; // или string[] — если forLink возвращает массив
  start: string;
  end: string;
  filterModel: FilterModel; // лучше уточнить тип, если знаешь структуру
}
