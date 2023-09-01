import {Component, ElementRef, TemplateRef, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {NgForm} from '@angular/forms';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {map, Observable} from 'rxjs';
import {DestroyService, LoadingManager} from '@kodality-web/core-util';
import {Router} from '@angular/router';
import {MapSet, MapSetFileImportService, MapSetLibService} from '../../../../resources/_lib';
import {JobLibService, JobLog} from 'term-web/sys/_lib';
import {FileProcessingRequest} from 'term-web/resources/_lib/mapset/services/map-set-file-import.service';

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
  public loader = new LoadingManager();

  @ViewChild('fileInput') public fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('form') public form?: NgForm;
  @ViewChild('successNotificationContent') public successNotificationContent?: TemplateRef<any>;


  public constructor(
    private http: HttpClient,
    private notificationService: MuiNotificationService,
    private mapSetService: MapSetLibService,
    private mapSetFileImportService: MapSetFileImportService,
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
      this.loader.wrap('ms', this.mapSetService.load(id)).subscribe(resp => this.data.loadedMapSet = resp);
    }
  }

  public process(): void {
    const file = this.fileInput?.nativeElement?.files?.[0];
    const req: FileProcessingRequest = {
      type: 'csv',
      map: this.data.map,
      version: this.data.version,
      sourceValueSet: this.data.sourceValueSet,
      targetValueSet: this.data.targetValueSet
    };

    this.jobResponse = null;
    this.loader.wrap('processing', this.mapSetFileImportService.processRequest(req, file)).subscribe(resp => {
      this.jobResponse = resp;
      if (!resp.errors && !resp.warnings) {
        this.notificationService.success("web.integration.file-import.success-message", this.successNotificationContent, {duration: 0, closable: true});
      }
    });
  }


  protected openMapSet(id: string, mode: 'edit' | 'view'): void {
    this.router.navigate(['/resources/map-sets/', id, mode]);
  }

  protected loadMapSetVersions = (id): Observable<string[]> => {
    return this.mapSetService.searchVersions(id, {limit: -1}).pipe(map(r => r.data.map(d => d.version)));
  };
}
