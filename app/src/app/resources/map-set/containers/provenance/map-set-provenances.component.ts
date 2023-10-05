import {Component, OnInit} from '@angular/core';
import {LoadingManager} from '@kodality-web/core-util';
import {ActivatedRoute} from '@angular/router';
import {forkJoin, of} from 'rxjs';
import {MapSet, MapSetVersion} from 'term-web/resources/_lib';
import {MapSetService} from 'term-web/resources/map-set/services/map-set-service';
import {Provenance} from 'term-web/sys/_lib';

@Component({
  templateUrl: 'map-set-provenances.component.html'
})
export class MapSetProvenancesComponent implements OnInit {
  protected mapSet?: MapSet;
  protected version: MapSetVersion;
  protected versions?: MapSetVersion[];
  protected provenances?: Provenance[];
  protected loader = new LoadingManager();

  public constructor(
    private route: ActivatedRoute,
    private mapSetService: MapSetService
  ) {}

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const version = this.route.snapshot.paramMap.get('versionCode');
    this.loader.wrap('load', forkJoin([
      this.mapSetService.load(id),
      version ? this.mapSetService.loadVersion(id, version) : of(null),
      !version ? this.mapSetService.searchVersions(id, {limit: -1}) : of(null),
      this.mapSetService.loadProvenances(id, version)
    ])).subscribe(([cs, version, versions, provenances]) => {
      this.mapSet = cs;
      this.version = version;
      this.versions = versions?.data;
      this.provenances = provenances;
    });
  }
}
