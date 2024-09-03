import {CommonModule} from '@angular/common';
import {Component, Input, inject, OnChanges} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {SearchResult, CorePipesModule, group} from '@kodality-web/core-util';
import {MarinaUiModule, NgChanges} from '@kodality-web/marina-ui';
import {TranslateModule} from '@ngx-translate/core';
import {map, Observable} from 'rxjs';
import {AuthService} from '../../core/auth';
import {ValueSetLibService, CodeSystemLibModule} from '../../resources/_lib';
import {Task, TaskLibModule} from '../../task/_lib';

@Component({
  selector: 'tw-landing-task',
  standalone: true,
  imports: [
    CommonModule,
    CorePipesModule,
    FormsModule,
    MarinaUiModule,
    TranslateModule,
    CodeSystemLibModule,
    RouterLink,
    TaskLibModule,
  ],
  template: `
    <m-card class="task-card">
      <div class="m-justify-between m-items-middle subtitle">
        <span class="m-bold" *ngIf="type">
          {{('web.landing.tasks.' + type) | translate}}
        </span>

        <m-icon
            class="m-clickable m-pulse"
            mCode="setting"
            m-popover
            [mContent]="tpl"
            mPosition="leftTop"
            mTrigger="click"
        >
          <ng-template #tpl>
            <m-form-item mLabel="Statuses">
              <div *ngFor="let status of taskStatuses$ | async">
                <m-checkbox [ngModel]="statusState[status]" (ngModelChange)="toggleStatusState(status)">
                  {{status | localizedConceptName: {valueSet: 'task-status'} | async}}
                </m-checkbox>
              </div>
            </m-form-item>
          </ng-template>
        </m-icon>
      </div>

      <m-list class="borderless" [mEmpty]="!(tasks?.data | filter: filterTask: statusState)?.length">
        <m-list-item
            *ngFor="let task of tasks?.data | filter: filterTask: statusState"
            [routerLink]="task | apply: taskRoute"
            mClickable
        >
          <div class="m-items-top m-justify-between">
            <div>
              {{task.title}}
            </div>
            <tw-task-status [status]="task.status"/>
          </div>
        </m-list-item>
      </m-list>
    </m-card>
  `,
  styleUrls: ['../landing-page.component.less']
})
export class LandingTaskComponent implements OnChanges {
  @Input({required: true}) public tasks: SearchResult<Task> = SearchResult.empty();
  @Input({required: true}) public type: 'assigned-to-me' | 'created-by-me';

  private authService = inject(AuthService);
  private valueSetService = inject(ValueSetLibService);

  protected statusState: {[k: string]: boolean} = {};
  protected taskStatuses$ = this.valueSetService.expand({valueSet: 'task-status'}).pipe(
    map(r => r.map(c => c.concept.code))
  );


  public ngOnChanges({type}: NgChanges<LandingTaskComponent>): void {
    if (type) {
      this.defaultStatusState().subscribe(state => this.statusState = state);
    }
  }

  // Internal API

  protected toggleStatusState(stat: string): void {
    this.statusState = {
      ...this.statusState,
      [stat]: !this.statusState[stat]
    };

    const storeValue = group(Object.keys(this.statusState).filter(Boolean), k => k, k => this.statusState[k]);
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(storeValue));
  }

  private defaultStatusState(): Observable<LandingTaskComponent['statusState']> {
    return this.taskStatuses$.pipe(map(statuses => {
      const defaultState = group(statuses, k => k, () => true);
      try {
        return JSON.parse(localStorage.getItem(this.LOCAL_STORAGE_KEY)) ?? defaultState;
      } catch (e) {
        return defaultState;
      }
    }));
  }

  private get LOCAL_STORAGE_KEY(): string {
    return 'landing-task-statuses-' + this.type;
  }


  // Utils

  protected filterTask = (task: Task, statuses: {[k: string]: boolean}): boolean => {
    return Object.keys(statuses).filter(s => statuses[s]).includes(task.status);
  };

  protected taskRoute = (task: Task): any[] => {
    return this.authService.hasPrivilege('*.Task.edit') ? ['/tasks', task.number, 'edit'] : [];
  };
}
