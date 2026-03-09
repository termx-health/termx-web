import { Location, AsyncPipe } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import { compareValues, isDefined, LoadingManager, validateForm, ApplyPipe } from '@kodality-web/core-util';
import {MapSetScope, MapSetVersion} from 'term-web/resources/_lib';
import {map, Observable} from 'rxjs';
import {MapSetService} from 'term-web/resources/map-set/services/map-set-service';
import {AuthService} from 'term-web/core/auth';
import { MuiFormModule, MuiSpinnerModule, MuiCardModule, MuiDatePickerModule, MuiMultiLanguageInputModule, MuiButtonModule, MuiIconModule } from '@kodality-web/marina-ui';
import { StatusTagComponent } from 'term-web/core/ui/components/publication-status-tag/status-tag.component';
import { SemanticVersionSelectComponent } from 'term-web/core/ui/components/inputs/version-select/semantic-version-select.component';
import { ValueSetConceptSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-concept-select.component';
import { ResourceIdentifiersComponent } from 'term-web/resources/resource/components/resource-identifiers.component';
import { MapSetScopeFormComponent } from 'term-web/resources/map-set/containers/version/edit/scope/map-set-scope-form.component';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
    templateUrl: './map-set-version-edit.component.html',
    imports: [
    MuiFormModule,
    MuiSpinnerModule,
    MuiCardModule,
    StatusTagComponent,
    FormsModule,
    SemanticVersionSelectComponent,
    ValueSetConceptSelectComponent,
    MuiDatePickerModule,
    MuiMultiLanguageInputModule,
    ResourceIdentifiersComponent,
    MapSetScopeFormComponent,
    MuiButtonModule,
    MuiIconModule,
    AsyncPipe,
    TranslatePipe,
    ApplyPipe
],
})
export class MapSetVersionEditComponent implements OnInit {
  private mapSetService = inject(MapSetService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  protected mapSetId?: string | null;
  protected version?: MapSetVersion;
  protected loader = new LoadingManager();
  protected mode: 'add' | 'edit' = 'add';
  protected viewMode = false;
  protected canEdit = false;

  public readonly versionPattern: string = '[A-Za-z0-9\\-\\.]{1,64}';

  @ViewChild("form") public form?: NgForm;

  public ngOnInit(): void {
    this.mapSetId = this.route.snapshot.paramMap.get('id');
    const versionCode = this.route.snapshot.paramMap.get('versionCode');

    if (isDefined(versionCode)) {
      this.mode = 'edit';
      this.viewMode = true;
      this.canEdit = this.authService.hasPrivilege(this.mapSetId + '.MapSet.edit');
      this.loader.wrap('load', this.mapSetService.loadVersion(this.mapSetId, versionCode)).subscribe(v => this.version = this.writeVersion(v));
    } else {
      this.mapSetService.searchVersions(this.mapSetId).subscribe(r => {
        const lastVersion = this.getLastVersion(r.data);
        const newVersion= new MapSetVersion();
        newVersion.preferredLanguage = lastVersion?.preferredLanguage;
        newVersion.status = 'draft';
        this.version = this.writeVersion(newVersion);
      });
    }
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loader.wrap('save', this.mapSetService.saveMapSetVersion(this.mapSetId!, this.version!)).subscribe(() => this.location.back());
  }

  public versions = (id): Observable<string[]> => {
    return this.mapSetService.searchVersions(id, {limit: -1}).pipe(map(r => r.data.map(d => d.version)));
  };

  private writeVersion(version: MapSetVersion): MapSetVersion {
    version.status ??= 'draft';
    version.releaseDate ??= new Date();
    version.scope ??= new MapSetScope();
    version.identifiers ??= [];
    return version;
  }

  private getLastVersion(versions: MapSetVersion[]): MapSetVersion {
    return versions?.filter(v => ['draft', 'active'].includes(v.status!)).sort((a, b) => compareValues(a.created, b.created))?.[0];
  }
}
