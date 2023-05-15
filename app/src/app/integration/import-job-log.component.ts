import {Component, Input} from '@angular/core';
import {JobLog} from 'term-web/job/_lib';


@Component({
  selector: 'tw-import-job-log',
  template: `
    <div *ngIf="jobLog" class="tw-flex-container" style="gap: 0.5rem">
      <m-alert *ngFor="let error of jobLog.errors" mType="error" class="import-alert" mShowIcon>
        {{error}}
      </m-alert>
      <m-alert *ngFor="let warning of jobLog.warnings" mType="warning" class="import-alert" mShowIcon>
        {{warning}}
      </m-alert>
      <m-alert *ngFor="let success of jobLog.successes" mType="success" class="import-alert" mShowIcon>
        {{success}}
      </m-alert>
    </div>
  `,
  styles: [`
    .import-alert {
      margin: 0;

      &:after {
        height: 100%;
        width: 2px;
      }
    }
  `],
})
export class ImportJobLogComponent {
  @Input() public jobLog: JobLog;
}
