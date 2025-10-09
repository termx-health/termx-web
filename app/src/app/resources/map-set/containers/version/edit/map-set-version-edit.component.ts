import {Location} from '@angular/common';
import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {compareValues, isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {MapSetScope, MapSetVersion} from 'app/src/app/resources/_lib';
import {map, Observable} from 'rxjs';
import {MapSetService} from '../../../services/map-set-service';


@Component({
  templateUrl: './map-set-version-edit.component.html',
})
export class MapSetVersionEditComponent implements OnInit {
  protected mapSetId?: string | null;
  protected version?: MapSetVersion;
  protected loader = new LoadingManager();
  protected mode: 'add' | 'edit' = 'add';

  public readonly versionPattern: string = '[A-Za-z0-9\\-\\.]{1,64}';

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private mapSetService: MapSetService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.mapSetId = this.route.snapshot.paramMap.get('id');
    const versionCode = this.route.snapshot.paramMap.get('versionCode');

    if (isDefined(versionCode)) {
      this.mode = 'edit';
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
