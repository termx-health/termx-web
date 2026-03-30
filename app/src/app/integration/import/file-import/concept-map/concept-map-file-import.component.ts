import { Component, ElementRef, TemplateRef, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {Router} from '@angular/router';
import { DestroyService, LoadingManager, AutofocusDirective, ApplyPipe, FilterPipe } from '@termx-health/core-util';
import { MuiNotificationService, MuiCardModule, MuiFormModule, MuiCoreModule, MuiAlertModule, MuiTextareaModule, MuiMultiLanguageInputModule, MuiSelectModule, MuiRadioModule, MuiDatePickerModule, MuiIconModule, MuiButtonModule } from '@termx-health/ui';
import {of} from 'rxjs';
import {FileProcessingRequest} from 'term-web/resources/_lib/map-set/services/map-set-file-import.service';
import {JobLog} from 'term-web/sys/_lib';
import {MapSet, MapSetFileImportService, MapSetLibService, MapSetVersion} from 'term-web/resources/_lib';
import { NzBreadCrumbComponent, NzBreadCrumbItemComponent } from 'ng-zorro-antd/breadcrumb';

import { MapSetSearchComponent } from 'term-web/resources/_lib/map-set/containers/map-set-search.component';
import { SemanticVersionSelectComponent } from 'term-web/core/ui/components/inputs/version-select/semantic-version-select.component';
import { ValueSetConceptSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-concept-select.component';
import { MapSetScopeFormComponent } from 'term-web/resources/map-set/containers/version/edit/scope/map-set-scope-form.component';
import { ImportJobLogComponent } from 'term-web/integration/import-job-log.component';
import { TranslatePipe } from '@ngx-translate/core';
import { MarinaUtilModule } from '@termx-health/util';

@Component({
    templateUrl: 'concept-map-file-import.component.html',
    providers: [DestroyService],
    imports: [FormsModule, MuiCardModule, NzBreadCrumbComponent, NzBreadCrumbItemComponent, MuiFormModule, MapSetSearchComponent, AutofocusDirective, MuiCoreModule, MuiAlertModule, MuiTextareaModule, MuiMultiLanguageInputModule, MuiSelectModule, MuiRadioModule, SemanticVersionSelectComponent, ValueSetConceptSelectComponent, MuiDatePickerModule, MapSetScopeFormComponent, MuiIconModule, ImportJobLogComponent, MuiButtonModule, TranslatePipe, MarinaUtilModule, ApplyPipe, FilterPipe]
})
export class ConceptMapFileImportComponent {
  private notificationService = inject(MuiNotificationService);
  private mapSetService = inject(MapSetLibService);
  private mapSetFileImportService = inject(MapSetFileImportService);
  private router = inject(Router);

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

  protected downloadTemplate(): void {
    this.mapSetFileImportService.getTemplate();
  }
}
