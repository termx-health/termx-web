import {Component, EventEmitter, Input, OnChanges, Output, QueryList, SimpleChanges, ViewChild, ViewChildren} from '@angular/core';
import {
  AssociationType,
  MapSet,
  MapSetAssociation,
  MapSetAssociationEntity,
  MapSetConcept,
  MapSetConceptSearchParams,
  MapSetProperty, MapSetPropertyValue
} from 'term-web/resources/_lib';
import {copyDeep, SearchResult, validateForm} from '@kodality-web/core-util';
import {finalize, Observable, of, tap} from 'rxjs';
import {MapSetService} from 'term-web/resources/map-set/services/map-set-service';
import {NgForm} from '@angular/forms';
import {EntityPropertyValueInputComponent} from 'term-web/core/ui/components/inputs/property-value-input/entity-property-value-input.component';
import {MapSetPropertyValuesComponent} from 'term-web/resources/map-set/containers/version/summary/property-values/map-set-property-values.component';

@Component({
  selector: 'tw-map-set-association-drawer',
  templateUrl: 'map-set-association-drawer.component.html'
})
export class MapSetAssociationDrawerComponent implements OnChanges {
  @Input() public mapSet: MapSet;
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
  protected propertyValues: MapSetPropertyValue[] = [];

  public query = new MapSetConceptSearchParams();
  public searchResult: SearchResult<MapSetConcept> = SearchResult.empty();
  public searchInput: string;

  @ViewChild(MapSetPropertyValuesComponent) public propertyValuesComponent?: MapSetPropertyValuesComponent;


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
    if (!this.mapSet?.id || !this.mapSetVersion) {
      return of();
    }
    const q = copyDeep(this.query);
    q.type = 'target';
    q.textContains = this.searchInput || undefined;

    this.loading = true;
    return this.mapSetService.searchConcepts(this.mapSet.id, this.mapSetVersion, q).pipe(finalize(() => this.loading = false));
  }

  protected onSearch = (): Observable<SearchResult<MapSetConcept>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };

  public save(): void {
    if (!this.mapSet?.id || !this.mapSetVersion || !validateForm(this.form) ||
      (this.propertyValuesComponent && !this.propertyValuesComponent.valid())) {
      return;
    }
    const association: MapSetAssociation = {
      source: {code: this.sourceConcept.code, display: this.sourceConcept.display?.name, codeSystem: this.sourceConcept.codeSystem},
      target: {code: this.targetConcept.code, display: this.targetConcept.display?.name, codeSystem: this.targetConcept.codeSystem},
      relationship: this.relationship,
      propertyValues: this.propertyValuesComponent?.getPropertyValues()
    };
    this.mapSetService.saveAssociation(this.mapSet.id, this.mapSetVersion, association).subscribe(() => {
      this.twSaved.emit();
      this.closeDrawer();
    });
  }

  public addPropertyValue(prop: MapSetProperty): void {
    this.propertyValues = [...this.propertyValues || [], {mapSetPropertyId: prop.id, mapSetPropertyName: prop.name, value: prop.type === 'Coding' ? {} : undefined}];
  }
}
