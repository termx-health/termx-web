import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {copyDeep, SearchResult} from '@kodality-web/core-util';
import {AssociationType, MapSet, MapSetAssociation, MapSetConcept, MapSetConceptSearchParams} from 'app/src/app/resources/_lib';
import {finalize, Observable, of, tap} from 'rxjs';
import {MapSetAssociationDrawerComponent} from 'term-web/resources/map-set/containers/version/summary/assoociations/map-set-association-drawer.component';
import {MapSetService} from 'term-web/resources/map-set/services/map-set-service';


@Component({
  selector: 'tw-map-set-unmapped-concept-list',
  templateUrl: 'map-set-unmapped-concept-list.component.html'
})
export class MapSetUnmappedConceptListComponent implements OnChanges {
  @Input() public mapSet: MapSet;
  @Input() public mapSetVersion: string;
  @Input() public targetExternal: boolean;
  @Input() public associationTypes: AssociationType[];
  @Input() public editMode: boolean;
  @Output() public associationsChanged: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild(MapSetAssociationDrawerComponent) public drawerComponent?: MapSetAssociationDrawerComponent;

  public query = new MapSetConceptSearchParams();
  public searchResult: SearchResult<MapSetConcept> = SearchResult.empty();
  public searchInput: string;
  public unverified: boolean;
  public loading: boolean;


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

  protected search(): Observable<SearchResult<MapSetConcept>> {
    if (!this.mapSet?.id || !this.mapSetVersion) {
      return of();
    }
    const q = copyDeep(this.query);
    q.type = 'source';
    q.textContains = this.searchInput || undefined;
    q.verified = this.unverified ? false : undefined;
    q.unmapped = true;

    this.loading = true;
    return this.mapSetService.searchConcepts(this.mapSet.id, this.mapSetVersion, q).pipe(finalize(() => this.loading = false));
  }

  protected onSearch = (): Observable<SearchResult<MapSetConcept>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };

  protected createNoMap = (c: MapSetConcept): void => {
    if (!this.mapSet?.id || !this.mapSetVersion) {
      return;
    }
    const noMap: MapSetAssociation = {source: {code: c.code, codeSystem: c.codeSystem, display: c.display?.name}};
    this.mapSetService.saveAssociation(this.mapSet.id, this.mapSetVersion, noMap).subscribe(() => {
      this.loadData();
      this.associationsChanged.emit();
    });
  };
}
