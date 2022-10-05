import {Component, ElementRef, TemplateRef, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {NgForm} from '@angular/forms';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {MapSet, MapSetLibService} from 'terminology-lib/resources';
import {LocalizedName} from '@kodality-web/marina-util';
import {filter, merge, Subject, switchMap, takeUntil, timer} from 'rxjs';
import {JobLibService, JobLog, JobLogResponse} from 'terminology-lib/job';
import {DestroyService} from '@kodality-web/core-util';
import {Router} from '@angular/router';


// processing
interface FileProcessingRequest {
  map: {
    id?: string;
    names?: LocalizedName;
    uri?: string;
  };
  version: {
    version?: string;
    releaseDate?: Date;
  };

  sourceValueSet?: string;
  targetValueSet?: string;
}


@Component({
  templateUrl: 'concept-map-file-import.component.html',
  providers: [DestroyService]
})
export class ConceptMapFileImportComponent {
  public data: FileProcessingRequest & {file?: string, loadedMapSet?: MapSet} = {
    map: {},
    version: {},
  };
  public jobResponse: JobLog | null = null;
  public isNewMapSet: boolean = false;
  public loading: {[k: string]: boolean} = {};

  @ViewChild('fileInput') public fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('form') public form?: NgForm;
  @ViewChild('successNotificationContent') public successNotificationContent?: TemplateRef<any>;


  public constructor(
    private http: HttpClient,
    private notificationService: MuiNotificationService,
    private mapSetService: MapSetLibService,
    private destroy$: DestroyService,
    private jobService: JobLibService,
    private router: Router
  ) {}

  public iniMapSet(): void {
    this.data.map = {};
    this.isNewMapSet = true;
  }

  public loadMapSet(id: string): void {
    this.data.loadedMapSet = undefined;
    if (id) {
      this.loading['ms'] = true;
      this.mapSetService.load(id).subscribe(resp => this.data.loadedMapSet = resp).add(() => this.loading['ms'] = false);
    }
  }

  public process(): void {
    const req: FileProcessingRequest = {
      map: this.data.map,
      version: this.data.version,
      sourceValueSet: this.data.sourceValueSet,
      targetValueSet: this.data.targetValueSet
    };

    const formData = new FormData();
    formData.append('request', JSON.stringify(req));
    formData.append('file', this.fileInput?.nativeElement?.files?.[0] as Blob, 'files');

    this.jobResponse = null;
    this.loading['processing'] = true;
    this.http.post<JobLogResponse>(`${environment.terminologyApi}/file-importer/map-set/process`, formData).subscribe({
      next: (resp) => {
        this.pollJobStatus(resp.jobId as number);
      }, error: () => this.loading['processing'] = false
    });
  }

  private pollJobStatus(jobId: number): void {
    const stopPolling$ = new Subject<void>();
    timer(0, 3000).pipe(
      takeUntil(merge(this.destroy$, stopPolling$)),
      switchMap(() => this.jobService.getLog(jobId)),
      filter(resp => resp.execution?.status !== 'running')
    ).subscribe(jobResp => {
      stopPolling$.next();
      if (!jobResp.errors && !jobResp.warnings) {
        this.notificationService.success("web.integration.file-import.success-message", this.successNotificationContent, {duration: 0, closable: true});
      }
      this.jobResponse = jobResp;
    }).add(() => this.loading['processing'] = false);
  }

  public openMapSet(id: string, mode: 'edit' | 'view'): void {
    this.router.navigate(['/resources/map-sets/', id, mode]);
  }
}
