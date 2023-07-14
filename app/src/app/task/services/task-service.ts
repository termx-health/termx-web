import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Task, TaskActivity, TaskLibService} from 'term-web/task/_lib';

@Injectable()
export class TaskService extends TaskLibService {

  public save(task: Task): Observable<Task> {
    if (task.number) {
      return this.http.put<Task>(`${this.baseUrl}/tasks/${task.number}`, task);
    }
    return this.http.post<Task>(`${this.baseUrl}/tasks`, task);
  }

  public createActivity(number: string, note: string): Observable<TaskActivity> {
    return this.http.post<TaskActivity>(`${this.baseUrl}/tasks/${number}/activities`, {note: note});
  }

  public updateActivity(number: string, id: string, note: string): Observable<TaskActivity> {
    return this.http.put<TaskActivity>(`${this.baseUrl}/tasks/${number}/activities/${id}`, {note: note});
  }

  public deleteActivity(number: string, id: string): Observable<TaskActivity> {
    return this.http.delete<TaskActivity>(`${this.baseUrl}/tasks/${number}/activities/${id}`);
  }
}
