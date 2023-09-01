import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {copyDeep, isDefined, SearchResult} from '@kodality-web/core-util';
import {finalize, Observable, of, tap} from 'rxjs';
import {
  AssociationType,
  MapSetAssociation,
  MapSetAssociationSearchParams
} from 'app/src/app/resources/_lib';
import {MapSetService} from 'term-web/resources/map-set/services/map-set-service';


@Component({
  selector: 'tw-map-set-association-list',
  templateUrl: 'map-set-association-list.component.html'
})
export class MapSetAssociationListComponent implements OnChanges {
  @Input() public relationships: string;
  @Input() public associationTypes: AssociationType[];
  @Input() public noMap: Boolean;
  @Input() public mapSet: string;
  @Input() public mapSetVersion: string;

  public query = new MapSetAssociationSearchParams();
  public searchResult: SearchResult<MapSetAssociation> = SearchResult.empty();
  public searchInput: string;
  public loading: boolean;

  public constructor(private mapSetService: MapSetService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if ((changes['mapSet'] || changes['mapSetVersion']) && this.mapSet && this.mapSetVersion) {
      this.loadData();
    }
  }

  protected loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  protected search(): Observable<SearchResult<MapSetAssociation>> {
    if (!this.mapSet || !this.mapSetVersion) {
      return of();
    }
    const q = copyDeep(this.query);
    q.limit = 100;
    q.sort = this.relationships?.includes('source-is-broader-than-target') ? 'target-code' : 'source-code';
    q.mapSetVersion = this.mapSetVersion;
    q.relationships = this.relationships;
    q.noMap = this.noMap;
    this.loading = true;
    return this.mapSetService.searchAssociations(this.mapSet, q).pipe(finalize(() => this.loading = false));
  }

  protected onSearch = (): Observable<SearchResult<MapSetAssociation>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };

  protected unmap = (id: number): void => {
    if (!isDefined(id)) {
      return;
    }
    this.mapSetService.unmapAssociations(this.mapSet, [id]).subscribe(() => this.loadData());
  };

  protected verify = (id: number): void => {
    if (!isDefined(id)) {
      return;
    }
    this.mapSetService.verifyAssociations(this.mapSet, [id]).subscribe(() => this.loadData());
  };

  protected createNoMap(a: MapSetAssociation): void {
    const association = copyDeep(a);
    association.target = undefined;
    association.relationship = undefined;
    this.mapSetService.saveAssociation(this.mapSet, this.mapSetVersion, a).subscribe(() => this.loadData());
  }

  protected getTitle = (relationships: string, associationTypes: AssociationType[]): string => {
    if (this.noMap) {
      return 'web.map-set-version.summary.statistics.no-map';
    }
    return relationships?.split(',')?.map(r => associationTypes?.find(t => t.code === r)?.forwardName || r)?.join(", ");
  };
}
