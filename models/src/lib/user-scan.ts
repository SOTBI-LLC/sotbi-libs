export interface UserScan {
  id?: number;
  user_id: number;
  scan: string;
  original_file_name?: string;
  crypted?: boolean;
  scan_type: ScanType;
}

export enum ScanType {
  Photo = 0,
  Passport = 1,
  Diploma = 2,
}
