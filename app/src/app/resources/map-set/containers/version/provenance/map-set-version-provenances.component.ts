import {Component, OnInit} from '@angular/core';
import {MapSet, MapSetVersion} from 'app/src/app/resources/_lib';
import {LoadingManager} from '@kodality-web/core-util';
import {ActivatedRoute} from '@angular/router';
import {forkJoin} from 'rxjs';
import {MapSetService} from 'term-web/resources/map-set/services/map-set-service';

@Component({
  templateUrl: 'map-set-version-provenances.component.html'
})
export class MapSetVersionProvenancesComponent implements OnInit {
  protected mapSet?: MapSet;
  protected mapSetVersion?: MapSetVersion;
  protected loader = new LoadingManager();

  protected searchInput: string;

  public constructor(
    private route: ActivatedRoute,
    private mapSetService: MapSetService
  ) {}

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const versionCode = this.route.snapshot.paramMap.get('versionCode');
    this.loadData(id, versionCode);
  }

  private loadData(mapSet: string, versionCode: string): void {
    this.loader.wrap('load',
      forkJoin([
        this.mapSetService.load(mapSet),
        this.mapSetService.loadVersion(mapSet, versionCode)
      ])).subscribe(([ms, msv]) => {
      this.mapSet = ms;
      this.mapSetVersion = msv;
    });
  }
}
