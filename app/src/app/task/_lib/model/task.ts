import {CodeName} from '@kodality-web/marina-util';
import {TaskActivity} from './task-activity';

export class Task {
  public id?: number;
  public project?: CodeName;
  public workflow?: string;
  public parentId?: number;
  public number?: string;
  public type?: string;
  public status?: string;
  public businessStatus?: string;
  public priority?: string;
  public createdBy?: string;
  public createdAt?: Date;
  public assignee?: string;
  public updatedBy?: string;
  public updatedAt?: Date;
  public title?: string;
  public content?: string;
  public context?: TaskContextItem[];
  public activities?: TaskActivity[];
}

export class TaskContextItem {
  public type?: string;
  public id?: any;
}
