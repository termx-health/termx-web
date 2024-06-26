import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {DestroyService, LoadingManager, validateForm} from '@kodality-web/core-util';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {Observable} from 'rxjs';
import {FhirCodeSystemLibService, FhirConceptMapLibService, FhirParameters, FhirValueSetLibService} from 'term-web/fhir/_lib';
import {MapSetFileImportService} from 'term-web/resources/_lib';
import {CodeSystemFileImportService} from 'term-web/resources/_lib/code-system/services/code-system-file-import.service';
import {ValueSetFileImportService} from 'term-web/resources/_lib/value-set/services/value-set-file-import.service';
import {JobLibService, JobLog} from 'term-web/sys/_lib';


@Component({
  selector: 'tw-resource-fhir-import-modal',
  templateUrl: './resource-fhir-import-modal-component.html',
  providers: [DestroyService]
})
export class ResourceFhirImportModalComponent {
  @Input() public resourceType: 'CodeSystem' | 'ValueSet' | 'ConceptMap';
  @Output() public imported: EventEmitter<boolean> = new EventEmitter();

  protected loader = new LoadingManager();
  protected jobResponse?: JobLog;

  protected modalVisible = false;
  public params: {id?: string, source: 'url' | 'file', type?: 'json' | 'fsh', url?: string, file?: any, settings?: any} = {source: 'url', settings: {}};

  @ViewChild("form") public form?: NgForm;
  @ViewChild("fileInput") public fileInput?: ElementRef<HTMLInputElement>;

  public constructor(
    private jobService: JobLibService,
    private notificationService: MuiNotificationService,
    private fhirCodeSystemService: FhirCodeSystemLibService,
    private fhirValueSetService: FhirValueSetLibService,
    private fhirConceptMapService: FhirConceptMapLibService,
    private codeSystemFileImportService: CodeSystemFileImportService,
    private valueSetFileImportService: ValueSetFileImportService,
    private mapSetFileImportService: MapSetFileImportService,
    private destroy$: DestroyService
  ) { }

  public toggleModal(visible: boolean = false): void {

    const settings: {[k: string]: any} = {
      'ConceptMap': {'cleanRun': false, 'cleanAssociationRun': false}
    };

    this.modalVisible = visible;
    this.params = this.modalVisible ? {source: 'url', settings: settings[this.resourceType]} : undefined;
  }

  public import(): void {
    if (!validateForm(this.form)) {
      return;
    }

    this.jobResponse = undefined;

    if (this.params.source == 'url') {
      this.importFromURL();
    }

    if (this.params.source == 'file') {
      this.importFromFile();
    }

  }

  private importFromURL(): void {
    const fhirSyncParameters: FhirParameters = {
      parameter: [{
        name: "resources",
        part: [{name: "url", valueString: this.params.url}, {name: "id", valueString: this.params.id}]
      }],
      resourceType: 'Parameters'};

    const importRequestMap: {[k: string]: Observable<FhirParameters>} = {
      'CodeSystem': this.fhirCodeSystemService.import(fhirSyncParameters),
      'ValueSet': this.fhirValueSetService.import(fhirSyncParameters),
      'ConceptMap': this.fhirConceptMapService.import(fhirSyncParameters)
    };

    this.notificationService.info('Sync started!');
    this.loader.wrap('import', importRequestMap[this.resourceType])
      .subscribe(resp => this.pollJobStatus(Number(resp.parameter.find(p => p.name === 'jobId').valueString)));
  }

  private importFromFile(): void {
    const file = this.fileInput?.nativeElement?.files?.[0];
    const importRequestMap: {[k: string]: Observable<JobLog>} = {
      'CodeSystem': this.codeSystemFileImportService.processRequest({type: this.params.type, codeSystem: {id: this.params.id}}, file, this.destroy$),
      'ValueSet': this.valueSetFileImportService.processRequest({type: this.params.type, valueSet: {id: this.params.id}}, file, this.destroy$),
      'ConceptMap': this.mapSetFileImportService.processRequest({
        type: this.params.type,
        mapSet: {id: this.params.id},
        cleanRun: this.params.settings?.['cleanRun'],
        cleanAssociationRun: this.params.settings?.['cleanAssociationRun']
      }, file, this.destroy$)
    };
    this.loader.wrap('import',importRequestMap[this.resourceType])
      .subscribe(resp => this.processJobResult(resp));
  }

  private pollJobStatus(jobId: number): void {
    this.loader.wrap('poll', this.jobService.pollFinishedJobLog(jobId, this.destroy$)).subscribe(jobResp => this.processJobResult(jobResp));
  }

  private processJobResult(jobResp: JobLog): void {
    if (!jobResp.errors && !jobResp.warnings) {
      jobResp.successes?.forEach(success => this.notificationService.success('Sync successful!', success, {duration: 0, closable: true}));
      this.toggleModal();
      this.imported.emit();
      return;
    }
    jobResp.errors?.forEach(error => this.notificationService.error('Sync failed!', error, {duration: 0, closable: true}));
    jobResp.warnings?.forEach(warning => this.notificationService.warning('Sync failed!', warning, {duration: 0, closable: true}));
  }
}
