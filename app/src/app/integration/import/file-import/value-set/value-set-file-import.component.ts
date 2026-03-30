import { Component, ElementRef, TemplateRef, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {Router} from '@angular/router';
import { DestroyService, LoadingManager, AutofocusDirective, ApplyPipe, FilterPipe, JoinPipe } from '@termx-health/core-util';
import { MuiNotificationService, MuiCardModule, MuiFormModule, MuiCoreModule, MuiAlertModule, MuiTextareaModule, MuiMultiLanguageInputModule, MuiSelectModule, MuiDatePickerModule, MuiDividerModule, MuiRadioModule, MuiInputModule, MuiButtonModule } from '@termx-health/ui';
import {of} from 'rxjs';
import {FileAnalysisRequest, FileAnalysisResponse, FileAnalysisService} from 'term-web/integration/import/file-import/file-analysis.service';
import {ValueSetFileImportService, FileProcessingRequest} from 'term-web/resources/_lib/value-set/services/value-set-file-import.service';
import {JobLog} from 'term-web/sys/_lib';
import {ValueSet, ValueSetLibService, ValueSetVersion} from 'term-web/resources/_lib';
import { NzBreadCrumbComponent, NzBreadCrumbItemComponent } from 'ng-zorro-antd/breadcrumb';

import { ValueSetSearchComponent } from 'term-web/resources/_lib/value-set/containers/value-set-search.component';
import { SemanticVersionSelectComponent } from 'term-web/core/ui/components/inputs/version-select/semantic-version-select.component';
import { ValueSetConceptSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-concept-select.component';
import { CodeSystemSearchComponent } from 'term-web/resources/_lib/code-system/containers/code-system-search.component';
import { CodeSystemVersionSelectComponent } from 'term-web/resources/_lib/code-system/containers/code-system-version-select.component';
import { ImportJobLogComponent } from 'term-web/integration/import-job-log.component';
import { TranslatePipe } from '@ngx-translate/core';
import { MarinaUtilModule } from '@termx-health/util';

@Component({
    templateUrl: 'value-set-file-import.component.html',
    providers: [DestroyService],
    imports: [FormsModule, MuiCardModule, NzBreadCrumbComponent, NzBreadCrumbItemComponent, MuiFormModule, ValueSetSearchComponent, AutofocusDirective, MuiCoreModule, MuiAlertModule, MuiTextareaModule, MuiMultiLanguageInputModule, MuiSelectModule, SemanticVersionSelectComponent, ValueSetConceptSelectComponent, MuiDatePickerModule, MuiDividerModule, CodeSystemSearchComponent, CodeSystemVersionSelectComponent, MuiRadioModule, MuiInputModule, MuiButtonModule, ImportJobLogComponent, TranslatePipe, MarinaUtilModule, ApplyPipe, FilterPipe, JoinPipe]
})
export class ValueSetFileImportComponent {
  private notificationService = inject(MuiNotificationService);
  private valueSetService = inject(ValueSetLibService);
  private valueSetFileImportService = inject(ValueSetFileImportService);
  private fileAnalysisService = inject(FileAnalysisService);
  private router = inject(Router);

  public data: FileProcessingRequest & {file?: string, loadedValueSet?: ValueSet, concepts?: string, sourceType?: 'link' | 'file'} = {
    type: 'csv',
    sourceType: 'file',
    valueSet: {},
    version: {rule: {}},
    mapping: {},
    dryRun: true,
    concepts: 'exact'
  };
  protected analyzeResponse: FileAnalysisResponse;
  public jobResponse: JobLog | null = null;
  public loader = new LoadingManager();

  @ViewChild('fileInput') public fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('form') public form?: NgForm;
  @ViewChild('successNotificationContent') public successNotificationContent?: TemplateRef<any>;

  public createValueSet(): void {
    this.data.loadedValueSet = undefined;
    this.data.valueSet = new ValueSet();
    this.data.valueSet['_new'] = true;

    this.createValueSetVersion();
  }

  public createValueSetVersion(): void {
    this.data.version = {
      status: 'draft',
      rule: {}
    };
    this.data.version['_new'] = true;
    this.createValueSetVersionRule();
  }

  public createValueSetVersionRule(): void {
    this.data.version.rule['_new'] = true;
  }

  protected onValueSetSelect(id: string): void {
    const req$ = id ? this.valueSetService.load(id, true) : of(undefined);

    this.loader.wrap('vs', req$).subscribe(vs => {
      this.data.loadedValueSet = vs;
      this.data.version = {rule: {}};

      const draftVersions = vs?.versions?.filter(v => this.filterVersion(v, 'draft'));
      if (!draftVersions?.length) {
        this.createValueSetVersion();
      }
    });
  }

  protected filterVersion = (v: ValueSetVersion, status: string): boolean => {
    return v.status === status;
  };

  protected getVersions = (versions: ValueSetVersion[]): string[] => {
    return versions?.map(v => v.version);
  };

  protected getSelectedVersion = (versions: ValueSetVersion[], number: string): ValueSetVersion => {
    return versions?.find(v => v.version === number);
  };

  public process(): void {
    const file = this.fileInput?.nativeElement?.files?.[0];
    this.jobResponse = null;
    this.loader.wrap('processing', this.valueSetFileImportService.processRequest(this.data, file)).subscribe(resp => {
      this.jobResponse = resp;
      if (!resp.errors && !resp.warnings && !this.data.dryRun) {
        this.notificationService.success("web.integration.file-import.success-message", this.successNotificationContent, {duration: 0, closable: true});
      }
    });
  }

  protected openValueSet(id: string): void {
    this.router.navigate(['/resources/value-sets/', id, 'summary']);
  }


  protected get isNewResource(): boolean {
    return this.data?.valueSet?.['_new'];
  }

  protected get isNewVersion(): boolean {
    return this.data?.version?.['_new'];
  }

  protected get isNewRule(): boolean {
    return this.data?.version?.rule?.['_new'];
  }

  protected analyze(): void {
    this.analyzeResponse = {};

    const file: Blob = this.fileInput?.nativeElement?.files?.[0];
    const req: FileAnalysisRequest = {
      type: this.data.type,
      link: this.data.link
    };

    if (file) {
      this.loader.wrap('analyze', this.fileAnalysisService.analyze(req, file)).subscribe(resp => {
        this.analyzeResponse = resp;
      });
    }
  }

}
