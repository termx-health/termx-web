import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Component, ElementRef, Injectable, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {copyDeep, DestroyService, LoadingManager, validateForm} from '@kodality-web/core-util';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {environment} from 'environments/environment';
import {saveAs} from 'file-saver';
import {mergeMap, Observable} from 'rxjs';
import {JobLibService, JobLog, JobLogResponse} from 'term-web/sys/_lib';
import {FileAnalysisRequest, FileAnalysisResponseColumn, FileAnalysisService} from '../file-analysis.service';

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
  public readonly baseUrl = `${environment.termxApi}/file-importer/association`;

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

  public getTemplate(): void {
    this.http.get(`${this.baseUrl}/csv-template`, {
      responseType: 'blob',
      headers: new HttpHeaders({Accept: 'application/csv'})
    }).subscribe(res => saveAs(res, `association-import-template.csv`));
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
    associationType?: string,
    file?: string,
  } = {associationType: 'is-a'};

  protected analyzeResponse: {
    columns?: AssociationFileImportColumn[],
    origin?: FileAnalysisRequest
  } = {};

  protected loader = new LoadingManager();
  protected jobLog: JobLog;

  @ViewChild(NgForm) protected form: NgForm;
  @ViewChild('fileInput') protected fileInput: ElementRef<HTMLInputElement>;

  public constructor(
    private notificationService: MuiNotificationService,
    private importService: AssociationFileImportService,
    private fileAnalysisService: FileAnalysisService
  ) {}

  protected downloadTemplate(): void {
    this.importService.getTemplate();
  }


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
          columns: columns.map(c => ({...c, mappedColumn: ['target', 'source', 'order'].includes(c.columnName) ? c.columnName : undefined})) ?? []
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
      associationType: this.data.associationType,

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
