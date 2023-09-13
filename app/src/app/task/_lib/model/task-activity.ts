export class TaskActivity {
  public id?: string;
  public taskId?: number;
  public note?: string;
  public transition?: {[key: string]: {from?: string, to?: string}};
  public context?: TaskActivityContextItem[];
  public updatedBy?: string;
  public updatedAt?: Date;
}

export class TaskActivityContextItem {
  public type?: string;
  public id?: any;
}
