export interface PostAddress {
  id: number;
  bankruptcy_manager_id?: number;
  name: string;
  default: boolean;
  type: string;
  deleted_at?: Date;
}
