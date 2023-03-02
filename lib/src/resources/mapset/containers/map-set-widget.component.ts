import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {SearchResult} from '@kodality-web/core-util';
import {Subscription} from 'rxjs';
import {MapSet} from '../model/map-set';
import {MapSetSearchParams} from '../model/map-set-search-params';
import {MapSetLibService} from '../services/map-set-lib.service';

@Component({
  selector: 'twl-map-set-widget',
  templateUrl: 'map-set-widget.component.html'
})
export class MapSetWidgetComponent implements OnChanges {
  @Input() public projectId: number;
  @Input() public packageId: number;
  @Input() public packageVersionId: number;

  private searchSub: Subscription;
  public searchResult = SearchResult.empty<MapSet>();
  public query = new MapSetSearchParams();
  public loading = false;

  public constructor(private mapSetService: MapSetLibService) {
    this.query.limit = 50;
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId'] || changes['packageId'] || changes['packageVersionId']) {
      this.search();
    }
  }

  private search(): void {
    this.searchSub?.unsubscribe();

    if (!this.projectId && !this.packageId && !this.packageVersionId) {
      this.searchResult = SearchResult.empty();
      return;
    }

    this.loading = true;
    this.searchSub = this.mapSetService.search(
      {
        ...this.query,
        projectId: this.projectId,
        packageId: this.packageId,
        packageVersionId: this.packageVersionId
      }).subscribe(resp => {
        this.searchResult = resp;
        this.loading = false;
    });
  }
}
