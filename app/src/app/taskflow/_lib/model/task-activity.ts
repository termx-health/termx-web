import {TaskflowUser} from 'term-web/taskflow/_lib';

export class TaskActivity {
  public id?: number;
  public taskId?: number;
  public note?: string;
  public transition?: {[key: string]: TaskActivityTransition};
  public updatedBy?: TaskflowUser;
  public updatedAt?: Date;
}

export class TaskActivityTransition {
  public from?: string;
  public to?: string;
}
