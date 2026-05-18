import {Component, EventEmitter, Input, Output, ViewChild, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {LoadingManager} from '@termx-health/core-util';
import {TranslatePipe} from '@ngx-translate/core';
import {MuiButtonModule, MuiCheckboxModule, MuiFormModule, MuiModalModule, MuiNotificationService, MuiTableModule, MuiTagModule} from '@termx-health/ui';
import {Observable} from 'rxjs';
import {StatusTagComponent} from 'term-web/core/ui/components/publication-status-tag/status-tag.component';
import {CodingValueUpdateCandidate} from 'term-web/resources/_lib/code-system/model/coding-value-update-candidate';

export type CodingRefreshScope =
  | {kind: 'entity-version'; csevId: number}
  | {kind: 'cs-version'; codeSystemId: string; version: string};

export interface CodingRefreshApi {
  findCandidates(scope: CodingRefreshScope, allowedStatuses: string[]): Observable<CodingValueUpdateCandidate[]>;
  refresh(scope: CodingRefreshScope, allowedStatuses: string[]): Observable<{applied?: number; queued?: number}>;
}

@Component({
  selector: 'tw-coding-value-refresh-modal',
  templateUrl: './coding-value-refresh-modal.component.html',
  imports: [
    MuiModalModule,
    MuiFormModule,
    MuiCheckboxModule,
    MuiButtonModule,
    MuiTableModule,
    MuiTagModule,
    FormsModule,
    StatusTagComponent,
    TranslatePipe
  ]
})
export class CodingValueRefreshModalComponent {
  private notificationService = inject(MuiNotificationService);

  @Input() public api?: CodingRefreshApi;
  @Output() public refreshed: EventEmitter<{applied?: number; queued?: number}> = new EventEmitter();

  protected modalVisible = false;
  protected step: 'select' | 'preview' = 'select';
  protected scope?: CodingRefreshScope;
  protected allow = {active: true, draft: true};
  protected candidates: CodingValueUpdateCandidate[] = [];
  protected loader = new LoadingManager();

  public open(scope: CodingRefreshScope): void {
    this.scope = scope;
    this.step = 'select';
    this.allow = {active: true, draft: true};
    this.candidates = [];
    this.modalVisible = true;
  }

  protected close(): void {
    this.modalVisible = false;
    this.scope = undefined;
    this.candidates = [];
  }

  protected previewCandidates(): void {
    if (!this.api || !this.scope) {
      return;
    }
    const statuses = this.selectedStatuses();
    if (statuses.length === 0) {
      return;
    }
    this.loader.wrap('candidates', this.api.findCandidates(this.scope, statuses)).subscribe(list => {
      this.candidates = list ?? [];
      if (this.candidates.length === 0) {
        this.notificationService.success('web.code-system.coding-refresh.up-to-date', 'web.code-system.coding-refresh.up-to-date-desc');
        this.close();
        return;
      }
      this.step = 'preview';
    });
  }

  protected applyRefresh(): void {
    if (!this.api || !this.scope) {
      return;
    }
    const statuses = this.selectedStatuses();
    this.loader.wrap('apply', this.api.refresh(this.scope, statuses)).subscribe(result => {
      this.refreshed.emit(result);
      if (result?.queued) {
        this.notificationService.success('web.code-system.coding-refresh.queued', String(result.queued));
      } else {
        this.notificationService.success('web.code-system.coding-refresh.applied', String(result?.applied ?? 0));
      }
      this.close();
    });
  }

  private selectedStatuses(): string[] {
    const s: string[] = [];
    if (this.allow.active) {
      s.push('active');
    }
    if (this.allow.draft) {
      s.push('draft');
    }
    return s;
  }
}
