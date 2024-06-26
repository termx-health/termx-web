import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {copyDeep, isDefined, SearchResult} from '@kodality-web/core-util';
import {AssociationType, MapSet, MapSetAssociation, MapSetAssociationSearchParams, MapSetProperty} from 'app/src/app/resources/_lib';
import {finalize, Observable, of, tap} from 'rxjs';
import {MapSetAssociationDrawerComponent} from 'term-web/resources/map-set/containers/version/summary/assoociations/map-set-association-drawer.component';
import {MapSetService} from 'term-web/resources/map-set/services/map-set-service';


@Component({
  selector: 'tw-map-set-association-list',
  templateUrl: 'map-set-association-list.component.html'
})
export class MapSetAssociationListComponent implements OnChanges {
  @Input() public relationships: string;
  @Input() public associationTypes: AssociationType[];
  @Input() public noMap: Boolean;
  @Input() public mapSet: MapSet;
  @Input() public mapSetVersion: string;
  @Input() public targetExternal: boolean;
  @Input() public editMode: boolean;
  @Output() public associationsChanged: EventEmitter<void> = new EventEmitter<void>();

  public query = new MapSetAssociationSearchParams();
  public searchResult: SearchResult<MapSetAssociation> = SearchResult.empty();
  public searchInput: string;
  public unverified: boolean;
  public loading: boolean;

  @ViewChild(MapSetAssociationDrawerComponent) public drawerComponent?: MapSetAssociationDrawerComponent;

  public constructor(private mapSetService: MapSetService) {
    this.query.limit = 100;
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if ((changes['mapSet'] || changes['mapSetVersion']) && this.mapSet && this.mapSetVersion) {
      this.loadData();
    }
  }

  protected loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  protected search(): Observable<SearchResult<MapSetAssociation>> {
    if (!this.mapSet?.id || !this.mapSetVersion) {
      return of();
    }
    const q = copyDeep(this.query);
    q.sort = this.relationships?.includes('source-is-broader-than-target') ? 'target-code' : 'source-code';
    q.mapSetVersion = this.mapSetVersion;
    q.relationships = this.relationships;
    q.noMap = this.noMap;
    q.verified = this.unverified ? false : undefined;
    this.loading = true;
    return this.mapSetService.searchAssociations(this.mapSet.id, q).pipe(finalize(() => this.loading = false));
  }

  protected onSearch = (): Observable<SearchResult<MapSetAssociation>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };

  protected unmap = (id: number): void => {
    if (!this.mapSet?.id || !this.mapSetVersion || !isDefined(id)) {
      return;
    }
    this.mapSetService.unmapAssociations(this.mapSet.id, this.mapSetVersion, [id]).subscribe(() => {
      this.loadData();
      this.associationsChanged.emit();
    });
  };

  protected verify = (id: number): void => {
    if (!this.mapSet?.id || !this.mapSetVersion || !isDefined(id)) {
      return;
    }
    this.mapSetService.verifyAssociations(this.mapSet.id, this.mapSetVersion, [id], undefined).subscribe(() => this.loadData());
  };

  protected verifyChecked = (): void => {
    if (!this.mapSet?.id || !this.mapSetVersion) {
      return;
    }
    const verifiedIds = this.searchResult.data.filter(a => a.verified).map(a => a.id);
    const unVerifiedIds = this.searchResult.data.filter(a => !a.verified).map(a => a.id);
    this.mapSetService.verifyAssociations(this.mapSet.id, this.mapSetVersion, verifiedIds, unVerifiedIds).subscribe(() => this.loadData());
  };

  protected createNoMap(a: MapSetAssociation): void {
    if (!this.mapSet?.id || !this.mapSetVersion) {
      return;
    }
    const association = copyDeep(a);
    association.target = undefined;
    association.relationship = undefined;
    association.verified = false;
    this.mapSetService.saveAssociation(this.mapSet.id, this.mapSetVersion, association).subscribe(() => {
      this.loadData();
      this.associationsChanged.emit();
    });
  }

  protected getTitle = (relationships: string, associationTypes: AssociationType[]): string => {
    if (this.noMap) {
      return 'web.map-set-version.summary.statistics.no-map';
    }
    return relationships?.split(',')?.map(r => associationTypes?.find(t => t.code === r)?.forwardName || r)?.join(", ");
  };

  public checkAll(checked: boolean): void {
    this.searchResult?.data?.forEach(a => a.verified = checked);
  }

  protected findProperty = (id: number, properties: MapSetProperty[]): MapSetProperty => {
    return properties?.find(p => p.id === id);
  };
}
