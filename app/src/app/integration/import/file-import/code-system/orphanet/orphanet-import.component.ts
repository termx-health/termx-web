import {Component, ElementRef, TemplateRef, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DestroyService, LoadingManager} from '@kodality-web/core-util';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {Router} from '@angular/router';
import {CodeSystem, CodeSystemLibService, ValueSetLibService} from '../../../../../resources/_lib';
import {FileAnalysisService} from '../../file-analysis.service';
import {JobLibService, JobLog} from 'term-web/sys/_lib';
import {CodeSystemFileImportService} from 'term-web/resources/_lib/codesystem/services/code-system-file-import.service';
import {IntegrationImportConfiguration, IntegrationOrphanetLibService} from 'term-web/integration/_lib';


@Component({
  templateUrl: 'orphanet-import.component.html',
  providers: [DestroyService, CodeSystemFileImportService]
})
export class OrphanetImportComponent {
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

  public constructor(
    private http: HttpClient,
    private notificationService: MuiNotificationService,
    private codeSystemLibService: CodeSystemLibService,
    private valueSetLibService: ValueSetLibService,
    private importService: IntegrationOrphanetLibService,
    private fileAnalysisService: FileAnalysisService,
    private jobService: JobLibService,
    private destroy$: DestroyService,
    private router: Router
  ) {}

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

    let file: Blob = this.fileInput?.nativeElement?.files?.[0];
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
