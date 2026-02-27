import {HttpClient} from '@angular/common/http';
import { Component, ElementRef, TemplateRef, ViewChild, inject } from '@angular/core';
import {Router} from '@angular/router';
import {DestroyService, LoadingManager} from '@kodality-web/core-util';
import { MuiNotificationService, MuiCardModule, MuiFormModule, MuiRadioModule, MuiInputModule, MuiButtonModule, MuiCoreModule } from '@kodality-web/marina-ui';
import {IntegrationImportConfiguration, IntegrationOrphanetLibService} from 'term-web/integration/_lib';
import {CodeSystemFileImportService} from 'term-web/resources/_lib/code-system/services/code-system-file-import.service';
import {JobLibService, JobLog} from 'term-web/sys/_lib';
import {CodeSystem, CodeSystemLibService, ValueSetLibService} from 'term-web/resources/_lib';
import {FileAnalysisService} from 'term-web/integration/import/file-import/file-analysis.service';
import { CodeSystemFileImportFormComponent } from 'term-web/integration/import/file-import/code-system/code-system-file-import-form.component';
import { FormsModule } from '@angular/forms';

import { TranslatePipe } from '@ngx-translate/core';


@Component({
    templateUrl: 'orphanet-import.component.html',
    providers: [DestroyService, CodeSystemFileImportService],
    imports: [CodeSystemFileImportFormComponent, MuiCardModule, MuiFormModule, MuiRadioModule, FormsModule, MuiInputModule, MuiButtonModule, MuiCoreModule, TranslatePipe]
})
export class OrphanetImportComponent {
  private http = inject(HttpClient);
  private notificationService = inject(MuiNotificationService);
  private codeSystemLibService = inject(CodeSystemLibService);
  private valueSetLibService = inject(ValueSetLibService);
  private importService = inject(IntegrationOrphanetLibService);
  private fileAnalysisService = inject(FileAnalysisService);
  private jobService = inject(JobLibService);
  private destroy$ = inject(DestroyService);
  private router = inject(Router);

  public breadcrumbs = ['web.integration.systems.orphanet', 'web.integration.import.orphanet'];

  public sourceCodeSystem: CodeSystem;

  public data: {
    // general
    codeSystem: CodeSystem,
    codeSystemVersion?: {
      version?: string;
      status?: string;
      releaseDate?: Date;
    },
    generateValueSet?: boolean;
    cleanRun?: boolean
    cleanConceptRun?: boolean
    // source
    source?: {
      type?: string,
      file?: string,
    }
  } = {
    codeSystem: {},
    codeSystemVersion: {},
    generateValueSet: false,
    cleanRun: false,
    source: {
      type: 'link',
      file: undefined
    }
  };


  public loader = new LoadingManager();
  public jobLog: JobLog;

  @ViewChild('fileInput') public fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('successNotificationContent') public successNotificationContent?: TemplateRef<any>;

  protected process(): void {
    const req: IntegrationImportConfiguration = {
      // request
      generateValueSet: this.data.generateValueSet,
      cleanRun: this.data.cleanRun,
      cleanConceptRun: this.data.cleanConceptRun,
      sourceUrl: this.data.source.file,

      // meta
      uri: this.data.codeSystem.uri,
      codeSystem: this.data.codeSystem.id,
      codeSystemName: this.data.codeSystem.title,
      codeSystemDescription: this.data.codeSystem.description,
      version: this.data.codeSystemVersion.version,
      status: this.data.codeSystemVersion.status,
      validFrom: this.data.codeSystemVersion.releaseDate,
    };

    const file: Blob = this.fileInput?.nativeElement?.files?.[0];
    this.processRequest(req, file);
  }

  protected processRequest(req: IntegrationImportConfiguration, file: Blob): void {
    this.jobLog = undefined;
    this.loader.wrap('process', this.importService.import(req, file, this.destroy$)).subscribe(resp => {
      this.jobLog = resp;
      if (resp.execution?.status === 'completed') {
        this.notificationService.success("web.integration.file-import.success-message", this.successNotificationContent!, {duration: 0, closable: true});
      }
      resp.errors?.forEach(error => this.notificationService.error('Import failed!', error, {duration: 0, closable: true}));
    });
  };

  /* Utils */
  protected openCodeSystem(id: string): void {
    this.router.navigate(['/resources/code-systems', id, 'summary']);
  }
}
