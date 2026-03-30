import {Component, Input} from '@angular/core';
import {JobLog} from 'term-web/sys/_lib';

import { MuiAlertModule } from '@termx-health/ui';


@Component({
    selector: 'tw-import-job-log',
    template: `
    @if (jobLog) {
      <div class="tw-flex-container" style="gap: 0.5rem">
        @for (error of jobLog.errors; track error) {
          <m-alert mType="error" class="tw-alert--vertical" mShowIcon>
            {{error}}
          </m-alert>
        }
        @for (warning of jobLog.warnings; track warning) {
          <m-alert mType="warning" class="tw-alert--vertical" mShowIcon>
            {{warning}}
          </m-alert>
        }
        @for (success of jobLog.successes; track success) {
          <m-alert mType="success" class="tw-alert--vertical" mShowIcon>
            {{success}}
          </m-alert>
        }
        @if (!jobLog.errors?.length) {
          <m-alert class="tw-alert--vertical" mType="success" mTitle="No errors found"/>
        }
      </div>
    }
    `,
    imports: [MuiAlertModule]
})
export class ImportJobLogComponent {
  @Input() public jobLog: JobLog;
}
