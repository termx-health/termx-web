import {TaskflowUser} from 'term-web/taskflow/_lib';

export class Task {
  public id?: number;
  public projectId?: number;
  public workflowId?: number;
  public parentId?: number;
  public number?: string;
  public type?: string;
  public status?: string;
  public businessStatus?: string;
  public priority?: string;
  public createdBy?: TaskflowUser;
  public createdAt?: Date;
  public assignee?: TaskflowUser;
  public updatedBy?: TaskflowUser;
  public updatedAt?: Date;
  public title?: string;
  public content?: string;
  public context?: TaskContextItem[];
  public attachments?: TaskAttachment[];
}

export class TaskContextItem {
  public type?: string;
  public id?: any;

}

export class TaskAttachment {
  public fileId?: string;
  public fileName?: string;
  public description?: string;
  public attachmentKey?: string;
}
