import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild, inject } from '@angular/core';
import { collect, copyDeep, isDefined, SearchResult, ApplyPipe, KeysPipe } from '@termx-health/core-util';
import {AssociationType, MapSet, MapSetAssociation, MapSetConcept, MapSetConceptSearchParams, MapSetProperty, MapSetVersion} from 'term-web/resources/_lib';
import {finalize, Observable, of, tap} from 'rxjs';
import {MapSetAssociationDrawerComponent} from 'term-web/resources/map-set/containers/version/summary/assoociations/map-set-association-drawer.component';
import {MapSetService} from 'term-web/resources/map-set/services/map-set-service';
import { MuiCardModule, MarinPageLayoutModule, MuiCheckboxModule, MuiInputModule, MuiBackendTableModule, MuiTableModule, MuiCoreModule, MuiIconModule, MuiDropdownModule, MuiNoDataModule } from '@termx-health/ui';
import { FormsModule } from '@angular/forms';
import { InputDebounceDirective } from 'term-web/core/ui/directives/input-debounce.directive';

import { MapSetPropertyValueInputComponent } from 'term-web/resources/map-set/containers/version/summary/property-values/map-set-property-value-input.component';
import { MapSetAssociationDrawerComponent as MapSetAssociationDrawerComponent_1 } from 'term-web/resources/map-set/containers/version/summary/assoociations/map-set-association-drawer.component';
import { TranslatePipe } from '@ngx-translate/core';
import { CodeSystemCodingReferenceComponent } from 'term-web/resources/code-system/components/code-system-coding-reference.component';


@Component({
    selector: 'tw-map-set-source-concept-list',
    templateUrl: 'map-set-source-concept-list.component.html',
    imports: [MuiCardModule, MarinPageLayoutModule, MuiCheckboxModule, FormsModule, MuiInputModule, InputDebounceDirective, MuiBackendTableModule, MuiTableModule, MuiCoreModule, MapSetPropertyValueInputComponent, MuiIconModule, MuiDropdownModule, MuiNoDataModule, MapSetAssociationDrawerComponent_1, TranslatePipe, ApplyPipe, KeysPipe, CodeSystemCodingReferenceComponent]
})
export class MapSetSourceConceptListComponent implements OnChanges {
  private mapSetService = inject(MapSetService);

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


  public constructor() {
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

    this.loading = true;
    return this.mapSetService.searchConcepts(this.mapSet.id, this.mapSetVersion, q).pipe(finalize(() => this.loading = false));
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
    if (!this.mapSet?.id || !this.mapSetVersion || !ids || ids.length === 0) {
      return;
    }
    this.mapSetService.unmapAssociations(this.mapSet.id, this.mapSetVersion, ids).subscribe(() => {
      this.loadData();
      this.associationsChanged.emit();
    });
  };

  protected verify = (c: MapSetConcept): void => {
    const ids = c.associations?.map(a => a.id).filter(id => isDefined(id));
    if (!this.mapSet?.id || !this.mapSetVersion || !ids || ids.length === 0) {
      return;
    }
    this.mapSetService.verifyAssociations(this.mapSet.id, this.mapSetVersion, ids, undefined).subscribe(() => this.loadData());
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

  protected findProperty = (id: number, properties: MapSetProperty[]): MapSetProperty => {
   return properties?.find(p => p.id === id);
  };

  protected sourceConceptProperty: MapSetProperty = {type: 'Coding'};
  protected targetConceptProperty: MapSetProperty = {type: 'Coding'};

  protected sourceConceptValue = (concept: MapSetConcept): {code?: string, codeSystem?: string, codeSystemVersion?: string} => {
    return {
      code: concept?.code,
      codeSystem: concept?.codeSystem,
      codeSystemVersion: this.currentMapSetVersion?.scope?.sourceValueSet?.version
        ?? this.currentMapSetVersion?.scope?.sourceCodeSystems?.find(cs => cs.id === concept?.codeSystem)?.version
    };
  };

  protected targetConceptValue = (association: MapSetAssociation): {code?: string, codeSystem?: string, codeSystemVersion?: string} => {
    return {
      code: association?.target?.code,
      codeSystem: association?.target?.codeSystem,
      codeSystemVersion: this.currentMapSetVersion?.scope?.targetValueSet?.version
        ?? this.currentMapSetVersion?.scope?.targetCodeSystems?.find(cs => cs.id === association?.target?.codeSystem)?.version
    };
  };

  private get currentMapSetVersion(): MapSetVersion | undefined {
    return this.mapSet?.versions?.find(v => v.version === this.mapSetVersion);
  }
}
