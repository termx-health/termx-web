import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { isDefined, LoadingManager, validateForm, ApplyPipe, IncludesPipe, ToStringPipe } from '@kodality-web/core-util';
import { MuiNotificationService, MarinPageLayoutModule, MuiIconModule, MuiCoreModule, MuiDividerModule, MuiFormModule, MuiCardModule, MuiButtonModule, MuiTableModule, MuiTagModule, MuiDropdownModule, MuiPopconfirmModule, MuiNoDataModule, MuiListModule, MuiModalModule, MuiSelectModule, MuiMultiLanguageInputModule } from '@kodality-web/marina-ui';
import {saveAs} from 'file-saver';
import {forkJoin} from 'rxjs';
import {Checklist, Release, ReleaseResource, JobLog} from 'term-web/sys/_lib';
import {ChecklistService} from 'term-web/sys/checklist/services/checklist.service';
import {ReleaseService} from 'term-web/sys/release/services/release.service';
import { KeyValuePipe } from '@angular/common';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { StatusTagComponent } from 'term-web/core/ui/components/publication-status-tag/status-tag.component';
import { PrivilegeContextDirective } from 'term-web/core/auth/privileges/privilege-context.directive';
import { ResourceTasksWidgetComponent } from 'term-web/resources/resource/components/resource-tasks-widget.component';
import { CodeSystemSearchComponent } from 'term-web/resources/_lib/code-system/containers/code-system-search.component';
import { ValueSetSearchComponent } from 'term-web/resources/_lib/value-set/containers/value-set-search.component';
import { MapSetSearchComponent } from 'term-web/resources/_lib/map-set/containers/map-set-search.component';
import { StructureDefinitionSelectComponent } from 'term-web/modeler/_lib/structure-definition/structure-definition-select.component';
import { TransformationDefinitionSelectComponent } from 'term-web/modeler/_lib/transformer/transformation-definition-select.component';
import { CodeSystemVersionSelectComponent } from 'term-web/resources/_lib/code-system/containers/code-system-version-select.component';
import { ValueSetVersionSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-version-select.component';
import { MapSetVersionSelectComponent } from 'term-web/resources/_lib/map-set/containers/map-set-version-select.component';
import { TranslatePipe } from '@ngx-translate/core';
import { MarinaUtilModule } from '@kodality-web/marina-util';
import { PrivilegedPipe } from 'term-web/core/auth/privileges/privileged.pipe';

@Component({
    templateUrl: 'release-summary.component.html',
    styles: [`
    @import "../../../../styles/variables";

    @space-context-bg: var(--color-action-bar-background);
    .context-container {
      display: grid;
      grid-template-columns: auto 1fr min-content min-content;
      background: @space-context-bg;
      overflow: auto;
    }

    .context-item {
      display: flex;
      gap: .5rem;
      height: 100%;
      padding: 1rem 2rem;
      border-bottom: @mui-border;
      white-space: nowrap;
    }
  `],
    imports: [MarinPageLayoutModule, MuiIconModule, PrivilegedDirective, RouterLink, MuiCoreModule, StatusTagComponent, MuiDividerModule, PrivilegeContextDirective, MuiFormModule, MuiCardModule, MuiButtonModule, MuiTableModule, MuiTagModule, MuiDropdownModule, MuiPopconfirmModule, MuiNoDataModule, MuiListModule, ResourceTasksWidgetComponent, MuiModalModule, FormsModule, MuiSelectModule, CodeSystemSearchComponent, ValueSetSearchComponent, MapSetSearchComponent, StructureDefinitionSelectComponent, TransformationDefinitionSelectComponent, CodeSystemVersionSelectComponent, ValueSetVersionSelectComponent, MapSetVersionSelectComponent, MuiMultiLanguageInputModule, KeyValuePipe, TranslatePipe, MarinaUtilModule, ApplyPipe, IncludesPipe, ToStringPipe, PrivilegedPipe]
})
export class ReleaseSummaryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private releaseService = inject(ReleaseService);
  private checklistService = inject(ChecklistService);
  private notificationService = inject(MuiNotificationService);

  protected release?: Release;
  protected resources?: ReleaseResource[];
  protected checklists?: {[key: string]: Checklist[]} = {};
  protected syncResult?: JobLog;
  protected attachments: any[];


  protected loader = new LoadingManager();
  protected showOnlyOpenedTasks: boolean;
  protected modalData: {visible?: boolean, resource?: ReleaseResource} = {resource: new ReleaseResource()};
  protected mode: 'summary' | 'provenance' = 'summary';

  private static colorMap = {
    'question-circle': 'grey',
    'exclamation-circle': 'orange',
    'close-circle': 'red'
  };

  @ViewChild("form") public form?: NgForm;

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.loadData(Number(id));
  }

  protected loadData(id: number): void {
    this.loader.wrap('load', forkJoin([
      this.releaseService.load(id),
      this.releaseService.loadNotes(id)]))
      .subscribe(([release, notes]) => {
        this.release = release;
        this.resources = release.resources;
        this.attachments = notes;
        this.loadChecklist(this.resources);
      });
  }

  public saveResource(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loader.wrap('save-resource', this.releaseService.saveResource(this.release.id, this.modalData.resource))
      .subscribe(() => {
        this.modalData = {resource: new ReleaseResource()};
        this.loadData(this.release.id);
      });
  }

  protected deleteResource(id: number): void {
    this.loader.wrap('delete-resource', this.releaseService.deleteResource(this.release.id, id))
      .subscribe(() => this.loadData(this.release.id));
  }

  protected changeStatus(status: 'draft' | 'active' | 'retired'): void {
    this.loader.wrap('change-status', this.releaseService.changeStatus(this.release.id, status))
      .subscribe(() => this.loadData(this.release.id));
  }

  private loadChecklist(resources: ReleaseResource[]): void {
    this.checklists = {};
    resources.forEach(r => this.loader.wrap('load-checks', this.checklistService.search({
      resourceType: r.resourceType,
      resourceId: r.resourceId,
      resourceVersion: r.resourceVersion,
      assertionsDecorated: true
    })).subscribe(res => {
      const checklist = res.data?.filter(c => !c.assertions?.[0]?.passed);
      if (checklist?.length > 0) {
        this.checklists[`${r.resourceType} ${r.resourceId} ${r.resourceVersion}`] = res.data?.filter(c => !c.assertions?.[0]?.passed);
      }
    }));
  }

  protected runChecks(resourceType?: string, resourceId?: string, resourceVersion?: string): void {
    if (!resourceType && !resourceId && !resourceVersion) {
      this.resources.filter(r => isDefined(r.resourceType) && isDefined(r.resourceId))
        .forEach(r => this.runChecks(r.resourceType, r.resourceId, r.resourceVersion));
      return;
    }
    const request = {resourceType: resourceType, resourceId: resourceId, resourceVersion: resourceVersion};
    this.loader.wrap('run-check', this.checklistService.runChecks(request)).subscribe(() => this.loadChecklist(this.resources));
  }

  protected runChecksFromKey(key: string): void {
    const resource = key.split(' ');
    this.runChecks(resource[0], resource[1], resource[2]);
  }

  protected openResource(resourceType: string, resourceId: string, resourceVersion: string, action: 'summary' | 'checklists'): void {
    if (resourceType === 'CodeSystem') {
      this.router.navigate(['/resources/code-systems', resourceId, 'versions', resourceVersion, action]);
    }
    if (resourceType === 'ValueSet') {
      this.router.navigate(['/resources/value-sets', resourceId, 'versions', resourceVersion, action]);
    }
    if (resourceType === 'MapSet') {
      this.router.navigate(['/resources/map-sets', resourceId, 'versions', resourceVersion, action]);
    }
  }

  protected openResourceFromKey(key: string, action: 'summary' | 'checklists'): void {
    const resource = key.split(' ');
    this.openResource(resource[0], resource[1], resource[2], action);
  }
  protected getCheckCode = (check: Checklist): 'question-circle' | 'exclamation-circle' | 'close-circle' => {
    if (!isDefined(check.assertions) || check.assertions.length === 0) {
      return 'question-circle';
    }
    if (!check.assertions[0].passed && check.rule.severity === 'error') {
      return 'close-circle';
    }
    return 'exclamation-circle';
  };

  protected getCheckColor = (code: 'question-circle' | 'exclamation-circle' | 'close-circle'): string => {
    return ReleaseSummaryComponent.colorMap[code];
  };

  protected serverSync(): void {
    this.loader.wrap('sync', this.releaseService.serverSync(this.release.id)).subscribe(jobLog => {
      if (isDefined(jobLog.errors)) {
        jobLog.errors.forEach(err => this.notificationService.error('web.release.sync-error', err));
      } else {
        this.notificationService.success('web.release.sync-success');
      }
    });
  }

  protected validateSync(): void {
    this.loader.wrap('sync', this.releaseService.validateSync(this.release.id)).subscribe(jobLog => {
      this.syncResult = jobLog;
      if (isDefined(jobLog.errors)) {
        jobLog.errors.forEach(err => this.notificationService.error('web.release.sync-validation-error', err));
      }
    });
  }

  protected getResourceResult = (resource: ReleaseResource, result: JobLog): 'success' | 'warning' | 'error' => {
    const success = !!result.successes?.find(s => s === String(resource.id));
    const warning = !!result.warnings?.find(s => s === String(resource.id));
    return success ? 'success' : warning ? 'warning' : 'error';
  };

  protected generateNotes(): void {
    this.loader.wrap('generate-notes', this.releaseService.generateNotes(this.release.id))
      .subscribe(() => this.loadData(this.release.id));
  }

  public downloadFile(attachment: any): void {
    this.releaseService.downloadFile(this.release.id, attachment.fileName).subscribe(blob => saveAs(blob, attachment.fileName));
  }
}
