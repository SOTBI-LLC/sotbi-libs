enum Type {
  IMMEDIATELY,
  PERIODICALY,
}

export interface Task {
  id?: number;
  name: string;
  type: Type;
  first_run: Date;
  intervals: number;
  current: number;
  max: number;
  status: boolean;
}
