import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {collect, copyDeep, isDefined, SearchResult} from '@kodality-web/core-util';
import {finalize, Observable, of, tap} from 'rxjs';
import {
  AssociationType,
  MapSetAssociation,
  MapSetConcept,
  MapSetConceptSearchParams
} from 'app/src/app/resources/_lib';
import {MapSetService} from 'term-web/resources/map-set/services/map-set-service';
import {MapSetAssociationDrawerComponent} from 'term-web/resources/map-set/containers/version/summary/assoociations/map-set-association-drawer.component';


@Component({
  selector: 'tw-map-set-source-concept-list',
  templateUrl: 'map-set-source-concept-list.component.html'
})
export class MapSetSourceConceptListComponent implements OnChanges {
  @Input() public mapSet: string;
  @Input() public mapSetVersion: string;
  @Input() public targetExternal: boolean;
  @Input() public associationTypes: AssociationType[];

  @ViewChild(MapSetAssociationDrawerComponent) public drawerComponent?: MapSetAssociationDrawerComponent;

  public query = new MapSetConceptSearchParams();
  public searchResult: SearchResult<MapSetConcept> = SearchResult.empty();
  public searchInput: string;
  public unverified: boolean;
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

  protected search(): Observable<SearchResult<MapSetConcept>> {
    if (!this.mapSet || !this.mapSetVersion) {
      return of();
    }
    const q = copyDeep(this.query);
    q.limit = 100;
    q.type = 'source';
    q.textContains = this.searchInput || undefined;
    q.verified = this.unverified ? false : undefined;

    this.loading = true;
    return this.mapSetService.searchConcepts(this.mapSet, this.mapSetVersion, q).pipe(finalize(() => this.loading = false));
  }

  protected onSearch = (): Observable<SearchResult<MapSetConcept>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };

  protected collectAssociations = (associations: MapSetAssociation[]): {[relationship: string]: MapSetAssociation[]} => {
    return collect(associations?.filter(a => !!a.relationship), a => a.relationship);
  };

  protected hasNoMap = (associations: MapSetAssociation[]): boolean => {
    return !!associations.find(a => a.noMap);
  };

  protected getRelationName = (relationship: string, relationships: AssociationType[]): string => {
    return relationships?.find(r => r.code === relationship)?.forwardName || relationship;
  };

  protected unmap = (c: MapSetConcept): void => {
    const ids = c.associations?.map(a => a.id).filter(id => isDefined(id));
    if (!ids || ids.length === 0) {
      return;
    }
    this.mapSetService.unmapAssociations(this.mapSet, this.mapSetVersion, ids).subscribe(() => this.loadData());
  };

  protected verify = (c: MapSetConcept): void => {
    const ids = c.associations?.map(a => a.id).filter(id => isDefined(id));
    if (!ids || ids.length === 0) {
      return;
    }
    this.mapSetService.verifyAssociations(this.mapSet, this.mapSetVersion, ids).subscribe(() => this.loadData());
  };

  protected verifyChecked = (): void => {
    const  ids = this.searchResult?.data?.filter(c => c['_checked'] && !!c.associations)
      .flatMap(c => c.associations.map(a => a.id)).filter(id => isDefined(id));
    if (!ids || ids.length === 0) {
      return;
    }
    this.mapSetService.verifyAssociations(this.mapSet, this.mapSetVersion, ids).subscribe(() => this.loadData());
  };

  protected createNoMap = (c: MapSetConcept): void => {
    const noMap: MapSetAssociation = {source: {code: c.code, codeSystem: c.codeSystem, display: c.display?.name}};
    this.mapSetService.saveAssociation(this.mapSet, this.mapSetVersion, noMap).subscribe(() => this.loadData());
  };
}
