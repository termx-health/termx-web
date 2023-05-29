import {Component, ElementRef, Injectable, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from 'app/src/environments/environment';
import {copyDeep, DestroyService, LoadingManager, validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {mergeMap, Observable} from 'rxjs';
import {FileAnalysisRequest, FileAnalysisResponseColumn, FileAnalysisService} from '../file-analysis.service';
import {JobLibService, JobLog, JobLogResponse} from 'term-web/job/_lib';
import {CodeSystemLibService} from 'term-web/resources/_lib';

interface AssociationFileImportRequest {
  codeSystemId?: string;
  codeSystemVersionId?: number;
  associationType?: string;
  separator?: string;

  sourceColumn?: string;
  sourceColumnSeparator?: string;
  targetColumn?: string;
  orderColumn?: string;
}

type AssociationFileImportColumn = FileAnalysisResponseColumn & {
  mappedColumn?: string;
  columnSeparator?: string;
}


@Injectable()
class AssociationFileImportService {
  public readonly baseUrl = `${environment.terminologyApi}/file-importer/association`;

  public constructor(
    private http: HttpClient,
    private jobService: JobLibService,
    private destroy$: DestroyService
  ) { }


  public processRequest(req: AssociationFileImportRequest, file: Blob): Observable<JobLog> {
    const fd = new FormData();
    fd.append('request', JSON.stringify(req));
    if (file) {
      fd.append('file', file, 'files');
    }

    return this.http.post<JobLogResponse>(`${this.baseUrl}/process`, fd).pipe(
      mergeMap(resp => this.jobService.pollFinishedJobLog(resp.jobId, this.destroy$)),
    );
  };
}

@Component({
  templateUrl: 'association-file-import.component.html',
  providers: [DestroyService, AssociationFileImportService]
})
export class AssociationFileImportComponent {
  protected data: {
    codeSystem?: string,
    codeSystemVersion?: number,
    file?: string,
  } = {};

  protected analyzeResponse: {
    columns?: AssociationFileImportColumn[],
    origin?: FileAnalysisRequest
  } = {};

  protected loader = new LoadingManager();
  protected jobLog: JobLog;

  @ViewChild(NgForm) protected form: NgForm;
  @ViewChild('fileInput') protected fileInput: ElementRef<HTMLInputElement>;

  public constructor(
    private http: HttpClient,
    private notificationService: MuiNotificationService,
    private codeSystemLibService: CodeSystemLibService,
    private importService: AssociationFileImportService,
    private fileAnalysisService: FileAnalysisService
  ) {}


  protected analyze(): void {
    this.analyzeResponse = {};

    const file: Blob = this.fileInput?.nativeElement?.files?.[0];
    const req: FileAnalysisRequest = {
      type: 'csv',
      link: this.data.file
    };

    if (file) {
      this.loader.wrap('analyze', this.fileAnalysisService.analyze(req, file)).subscribe(({columns}) => {
        this.analyzeResponse = {
          origin: copyDeep(req),
          columns: columns.map(c => ({...c})) ?? []
        };
      });
    }
  }

  protected process(): void {
    this.jobLog = undefined;
    if (!this.validate()) {
      return;
    }

    const file: Blob = this.fileInput?.nativeElement?.files?.[0];
    const req: AssociationFileImportRequest = {
      codeSystemId: this.data.codeSystem,
      codeSystemVersionId: this.data.codeSystemVersion,
      associationType: 'is-a',

      sourceColumn: this.column('source')?.columnName,
      sourceColumnSeparator: this.column('source')?.columnSeparator,
      targetColumn: this.column('target')?.columnName,
      orderColumn: this.column('order')?.columnName
    };

    this.processRequest(req, file);
  }

  private processRequest(req: AssociationFileImportRequest, file: Blob): void {
    this.jobLog = undefined;
    this.loader.wrap('process', this.importService.processRequest(req, file)).subscribe(resp => {
      this.jobLog = resp;
      if (!resp.errors?.length && !resp.warnings?.length) {
        this.notificationService.success("web.integration.file-import.success-message", undefined, {duration: -1, closable: true});
      }
    });
  };

  private validate(): boolean {
    const cols = ['target', 'source', 'order'];
    const missingColumns = cols.filter(c => !this.column(c));
    if (missingColumns.length) {
      this.notificationService.error("Please select columns", missingColumns.join(', '));
      return false;
    }
    return validateForm(this.form);
  }


  private column = (t: 'target' | 'source' | 'order' | string): AssociationFileImportColumn => {
    return this.analyzeResponse.columns.find(c => c.mappedColumn === t);
  };

  protected filterUnused = (els: string[], selected): string[] => {
    return els.filter(e => e === selected || !this.column(e));
  };

  protected get isSourceSelected(): boolean {
    return !!this.column('source');
  }
}
