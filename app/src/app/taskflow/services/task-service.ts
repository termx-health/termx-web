import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Task, TaskActivity, TaskLibService} from 'term-web/taskflow/_lib';

@Injectable()
export class TaskService extends TaskLibService {

  public save(task: Task): Observable<Task> {
    if (task.id) {
      return this.http.put<Task>(`${this.baseUrl}/${task.id}`, task);
    }
    return this.http.post<Task>(`${this.baseUrl}`, task);
  }

  public createActivity(id: number, note: string): Observable<TaskActivity> {
    return this.http.post<TaskActivity>(`${this.baseUrl}/${id}/activities`, {note: note});
  }
}
