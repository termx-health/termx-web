import {Component, OnInit} from '@angular/core';
import {LoadingManager} from '@kodality-web/core-util';
import {ActivatedRoute} from '@angular/router';
import {forkJoin} from 'rxjs';
import {MapSet, MapSetVersion} from 'term-web/resources/_lib';
import {MapSetService} from 'term-web/resources/map-set/services/map-set-service';
@Component({
  templateUrl: 'map-set-provenances.component.html'
})
export class MapSetProvenancesComponent implements OnInit {
  protected mapSet?: MapSet;
  protected versions?: MapSetVersion[];
  protected loader = new LoadingManager();

  public constructor(
    private route: ActivatedRoute,
    private mapSetService: MapSetService
  ) {}

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.loader.wrap('load',
      forkJoin([this.mapSetService.load(id), this.mapSetService.searchVersions(id, {limit: -1})]))
      .subscribe(([cs, versions]) => {
        this.mapSet = cs;
        this.versions = versions.data;
      });
  }
}
