import {Component, ElementRef, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {NgForm} from '@angular/forms';
import {MuiNotificationService} from '@kodality-health/marina-ui';
import {MapSet, MapSetLibService} from 'terminology-lib/resources';


// processing
interface FileProcessingRequest {
  map: {
    id?: string;
    name?: string;
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
  templateUrl: 'concept-map-file-import.component.html'
})
export class ConceptMapFileImportComponent {
  public data: FileProcessingRequest & {file?: string, loadedMapSet?: MapSet} = {
    map: {},
    version: {},
  };

  public isNewMapSet: boolean = false;
  public loading: {[k: string]: boolean} = {};

  @ViewChild('fileInput') public fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('form') public form?: NgForm;

  public constructor(
    private http: HttpClient,
    private notificationService: MuiNotificationService,
    private mapSetService: MapSetLibService
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

    this.loading['processing'] = true;
    this.http.post<void>(`${environment.terminologyApi}/file-importer/map-set/process`, formData).subscribe(() => {
      this.notificationService.success("File processing is finished");
    }).add(() => this.loading['processing'] = false);
  }
}
