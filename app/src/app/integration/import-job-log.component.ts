import {Component, Input} from '@angular/core';
import {JobLog} from 'term-web/sys/_lib';


@Component({
  selector: 'tw-import-job-log',
  template: `
    <div *ngIf="jobLog" class="tw-flex-container" style="gap: 0.5rem">
      <m-alert *ngFor="let error of jobLog.errors" mType="error" class="tw-alert-vertical" mShowIcon>
        {{error}}
      </m-alert>
      <m-alert *ngFor="let warning of jobLog.warnings" mType="warning" class="tw-alert-vertical" mShowIcon>
        {{warning}}
      </m-alert>
      <m-alert *ngFor="let success of jobLog.successes" mType="success" class="tw-alert-vertical" mShowIcon>
        {{success}}
      </m-alert>
    </div>
  `
})
export class ImportJobLogComponent {
  @Input() public jobLog: JobLog;
}
