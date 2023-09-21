import {Component, ElementRef, TemplateRef, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {of} from 'rxjs';
import {DestroyService, LoadingManager} from '@kodality-web/core-util';
import {Router} from '@angular/router';
import {ValueSet, ValueSetLibService, ValueSetVersion} from '../../../../resources/_lib';
import {JobLog} from 'term-web/sys/_lib';
import {ValueSetFileImportService, FileProcessingRequest} from 'term-web/resources/_lib/value-set/services/value-set-file-import.service';
import {
  FileAnalysisRequest,
  FileAnalysisResponse,
  FileAnalysisService
} from 'term-web/integration/import/file-import/file-analysis.service';

@Component({
  templateUrl: 'value-set-file-import.component.html',
  providers: [DestroyService]
})
export class ValueSetFileImportComponent {
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


  public constructor(
    private notificationService: MuiNotificationService,
    private valueSetService: ValueSetLibService,
    private valueSetFileImportService: ValueSetFileImportService,
    private fileAnalysisService: FileAnalysisService,
    private router: Router
  ) {}

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
