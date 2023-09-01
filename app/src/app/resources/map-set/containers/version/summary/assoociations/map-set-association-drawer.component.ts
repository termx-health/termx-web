import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {AssociationType, MapSetAssociation, MapSetAssociationEntity, MapSetConcept, MapSetConceptSearchParams} from 'term-web/resources/_lib';
import {copyDeep, SearchResult, validateForm} from '@kodality-web/core-util';
import {finalize, Observable, of, tap} from 'rxjs';
import {MapSetService} from 'term-web/resources/map-set/services/map-set-service';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'tw-map-set-association-drawer',
  templateUrl: 'map-set-association-drawer.component.html'
})
export class MapSetAssociationDrawerComponent implements OnChanges {
  @Input() public mapSet: string;
  @Input() public mapSetVersion: string;
  @Input() public associationTypes: AssociationType[];
  @Input() public targetExternal: boolean;

  @Output() public twSaved = new EventEmitter<void>();

  @ViewChild("form") public form?: NgForm;

  protected loading: boolean = false;
  protected drawerOpened: boolean;
  protected sourceConcept: MapSetConcept;
  protected targetConcept: MapSetConcept;
  protected relationship: string;

  public query = new MapSetConceptSearchParams();
  public searchResult: SearchResult<MapSetConcept> = SearchResult.empty();
  public searchInput: string;

  public constructor(private mapSetService: MapSetService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if ((changes['mapSet'] || changes['mapSetVersion']) && this.mapSet && this.mapSetVersion) {
      this.loadData();
    }
  }

  public openDrawer(source: MapSetConcept): void {
    this.targetConcept = this.targetExternal ? {display: {}} : undefined;
    this.sourceConcept = source;
    this.drawerOpened = true;
  }

  public openDrawerFromAssociation(source: MapSetAssociationEntity): void {
    this.targetConcept = undefined;
    this.sourceConcept = {code: source.code, codeSystem: source.codeSystem, display: source.display ? {name: source.display} : undefined};
    this.drawerOpened = true;
  }

  public closeDrawer(): void {
    this.drawerOpened = false;
  }

  protected loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  protected search(): Observable<SearchResult<MapSetConcept>> {
    if (!this.mapSet || !this.mapSetVersion) {
      return of();
    }
    const q = copyDeep(this.query);
    q.type = 'target';
    q.textContains = this.searchInput || undefined;

    this.loading = true;
    return this.mapSetService.searchConcepts(this.mapSet, this.mapSetVersion, q).pipe(finalize(() => this.loading = false));
  }

  protected onSearch = (): Observable<SearchResult<MapSetConcept>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    const association: MapSetAssociation = {
      source: {code: this.sourceConcept.code, display: this.sourceConcept.display?.name, codeSystem: this.sourceConcept.codeSystem},
      target: {code: this.targetConcept.code, display: this.targetConcept.display?.name, codeSystem: this.targetConcept.codeSystem},
      relationship: this.relationship
    };
    this.mapSetService.saveAssociation(this.mapSet, this.mapSetVersion, association).subscribe(() => {
      this.twSaved.emit();
      this.closeDrawer();
    });
  }
}
