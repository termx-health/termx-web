import {Component, ElementRef, TemplateRef, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {of} from 'rxjs';
import {DestroyService, LoadingManager} from '@kodality-web/core-util';
import {Router} from '@angular/router';
import {MapSet, MapSetFileImportService, MapSetLibService, MapSetVersion} from '../../../../resources/_lib';
import {JobLog} from 'term-web/sys/_lib';
import {FileProcessingRequest} from 'term-web/resources/_lib/map-set/services/map-set-file-import.service';

@Component({
  templateUrl: 'concept-map-file-import.component.html',
  providers: [DestroyService]
})
export class ConceptMapFileImportComponent {
  public data: FileProcessingRequest & {file?: string, fileType?: string, loadedMapSet?: MapSet} = {
    fileType: 'csv',
    mapSet: {},
    mapSetVersion: {},
  };
  public jobResponse: JobLog | null = null;
  public loader = new LoadingManager();

  @ViewChild('fileInput') public fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('form') public form?: NgForm;
  @ViewChild('successNotificationContent') public successNotificationContent?: TemplateRef<any>;


  public constructor(
    private notificationService: MuiNotificationService,
    private mapSetService: MapSetLibService,
    private mapSetFileImportService: MapSetFileImportService,
    private router: Router
  ) {}

  public createMapSet(): void {
    this.data.loadedMapSet = undefined;
    this.data.mapSet = new MapSet();
    this.data.mapSet['_new'] = true;

    this.createMapSetVersion();
  }

  public createMapSetVersion(): void {
    this.data.mapSetVersion = {
      status: 'draft',
      scope: {}
    };
    this.data.mapSetVersion['_new'] = true;
    this.data.cleanRun = false;
    this.data.cleanAssociationRun = false;
  }

  protected onMapSetSelect(id: string): void {
    const req$ = id ? this.mapSetService.load(id, true) : of(undefined);

    this.loader.wrap('ms', req$).subscribe(ms => {
      this.data.loadedMapSet = ms;
      this.data.mapSetVersion = {};
      this.data.cleanRun = false;
      this.data.cleanAssociationRun = false;

      const draftVersions = ms?.versions?.filter(v => this.filterVersion(v, 'draft'));
      if (!draftVersions?.length) {
        this.createMapSetVersion();
      }
    });
  }

  protected filterVersion = (v: MapSetVersion, status: string): boolean => {
    return v.status === status;
  };

  protected getVersions = (versions: MapSetVersion[]): string[] => {
    return versions?.map(v => v.version);
  };

  public process(): void {
    const file = this.fileInput?.nativeElement?.files?.[0];
    this.jobResponse = null;
    this.loader.wrap('processing', this.mapSetFileImportService.processRequest(this.data, file)).subscribe(resp => {
      this.jobResponse = resp;
      if (!resp.errors && !resp.warnings) {
        this.notificationService.success("web.integration.file-import.success-message", this.successNotificationContent, {duration: 0, closable: true});
      }
    });
  }

  protected openMapSet(id: string): void {
    this.router.navigate(['/resources/map-sets/', id, 'summary']);
  }


  protected get isNewResource(): boolean {
    return this.data?.mapSet?.['_new'];
  }

  protected get isNewVersion(): boolean {
    return this.data?.mapSetVersion?.['_new'];
  }

}
