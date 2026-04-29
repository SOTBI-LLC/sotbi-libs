import type { FilterModel } from 'ag-grid-community';

export interface TaskResponse {
  task_id: bigint;
  status: string;
}

export interface DebtorDownloadRequest {
  accounts: string[];
  start: string;
  end: string;
  filterModel: FilterModel;
}
