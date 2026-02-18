import { Component, OnInit, inject } from '@angular/core';
import {Router} from '@angular/router';
import { ComponentStateStore, HttpCacheService, LoadingManager, SearchResult, ApplyPipe } from '@kodality-web/core-util';
import {catchError, forkJoin, map, Observable, of} from 'rxjs';
import {AuthService} from 'term-web/core/auth';
import {SnomedConcept, SnomedConceptSearchParams, SnomedLibService} from 'term-web/integration/_lib';
import {MeasurementUnit, MeasurementUnitLibService, MeasurementUnitSearchParams} from 'term-web/measurement-unit/_lib';
import {
  CodeSystem,
  CodeSystemConcept,
  CodeSystemConceptLibService,
  CodeSystemLibService,
  CodeSystemSearchParams,
  ConceptSearchParams,
  MapSet,
  MapSetLibService,
  MapSetSearchParams,
  ValueSet,
  ValueSetLibService,
  ValueSetSearchParams
} from 'term-web/resources/_lib';
import { MuiCardModule, MuiNoDataModule, MuiBackendTableModule, MuiTableModule, MuiCoreModule } from '@kodality-web/marina-ui';
import { ɵNzTransitionPatchDirective } from 'ng-zorro-antd/core/transition-patch';
import { NzSpaceCompactItemDirective } from 'ng-zorro-antd/space';
import { NzInputGroupComponent, NzInputGroupWhitSuffixOrPrefixDirective, NzInputDirective } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';
import { NzIconDirective } from 'ng-zorro-antd/icon';

import { TranslatePipe } from '@ngx-translate/core';
import { MarinaUtilModule } from '@kodality-web/marina-util';

@Component({
    templateUrl: './global-search-dashboard.component.html',
    imports: [MuiCardModule, ɵNzTransitionPatchDirective, NzSpaceCompactItemDirective, NzInputGroupComponent, NzInputGroupWhitSuffixOrPrefixDirective, NzInputDirective, FormsModule, NzIconDirective, MuiNoDataModule, MuiBackendTableModule, MuiTableModule, MuiCoreModule, TranslatePipe, MarinaUtilModule, ApplyPipe]
})
export class GlobalSearchDashboardComponent implements OnInit {
  private router = inject(Router);
  private snomedService = inject(SnomedLibService);
  private mapSetService = inject(MapSetLibService);
  private valueSetService = inject(ValueSetLibService);
  private codeSystemService = inject(CodeSystemLibService);
  private measurementUnitService = inject(MeasurementUnitLibService);
  private codeSystemConceptService = inject(CodeSystemConceptLibService);
  private stateStore = inject(ComponentStateStore);
  private cacheService = inject(HttpCacheService);
  private authService = inject(AuthService);

  public searchText?: string;

  public conceptParams: ConceptSearchParams;
  public concepts: SearchResult<CodeSystemConcept> = SearchResult.empty();
  public codeSystems: CodeSystem[] = [];
  public valueSets: ValueSet[] = [];
  public mapSets: MapSet[] = [];
  public measurementUnits: MeasurementUnit[] = [];
  public snomedConcepts: SnomedConcept[] = [];

  protected readonly STORE_KEY = 'global-search';

  protected loader = new LoadingManager();

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state?.text) {
      this.searchText = state.text;
      this.search(this.searchText);
    }
  }

  public search(text: string): void {
    if (!text || text.length < 1) {
      this.concepts = SearchResult.empty();
      this.codeSystems = [];
      this.valueSets = [];
      this.mapSets = [];
      return;
    }
    this.stateStore.put(this.STORE_KEY, {text: text});

    const searchRequests = forkJoin([
      this.searchConcepts(text),
      this.searchCodeSystems(text),
      this.searchValueSets(text),
      this.searchMapSets(text),
      this.searchMeasurementUnits(text),
      this.searchSnomed(text)
    ]);

    this.loader.wrap('load', this.cacheService.put(text, searchRequests))
      .subscribe(([concepts, codeSystems, valueSets, mapSets, measurementUnits, snomedConcepts]) => {
        this.concepts = concepts;
        this.codeSystems = codeSystems;
        this.valueSets = valueSets;
        this.mapSets = mapSets;
        this.measurementUnits = measurementUnits;
        this.snomedConcepts = snomedConcepts;
      });
  }

  private searchConcepts(text: string): Observable<SearchResult<CodeSystemConcept>> {
    this.conceptParams = new ConceptSearchParams();
    this.conceptParams.textContains = text;
    return !this.authService.hasAnyPrivilege(['*.CodeSystem.view']) ? of(SearchResult.empty())
      : this.codeSystemConceptService.search(this.conceptParams).pipe(map(c => c), catchError(() => of(SearchResult.empty())));
  }

  protected loadConcepts(): void {
   this.loader.wrap('load-concepts', this.codeSystemConceptService.search(this.conceptParams)).subscribe(r => this.concepts = r);
  }

  private searchCodeSystems(text: string): Observable<CodeSystem[]> {
    const q = new CodeSystemSearchParams();
    q.textContains = text;
    q.limit = 100;

    return !this.authService.hasAnyPrivilege(['*.CodeSystem.view']) ? of([])
      : this.codeSystemService.search(q).pipe(map(cs => cs.data), catchError(() => of([])));
  }

  private searchValueSets(text: string): Observable<ValueSet[]> {
    const q = new ValueSetSearchParams();
    q.textContains = text;
    q.limit = 100;

    return !this.authService.hasAnyPrivilege(['*.ValueSet.view']) ? of([])
      : this.valueSetService.search(q).pipe(map(cs => cs.data), catchError(() => of([])));
  }

  private searchMapSets(text: string): Observable<MapSet[]> {
    const q = new MapSetSearchParams();
    q.textContains = text;
    q.limit = 100;

    return !this.authService.hasAnyPrivilege(['*.MapSet.view']) ? of([])
      : this.mapSetService.search(q).pipe(map(cs => cs.data), catchError(() => of([])));
  }

  private searchMeasurementUnits(text: string): Observable<MeasurementUnit[]> {
    const q = new MeasurementUnitSearchParams();
    q.textContains = text;
    q.limit = 100;

    return !this.authService.hasAnyPrivilege(['ucum.CodeSystem.view']) ? of([])
      : this.measurementUnitService.search(q).pipe(map(cs => cs.data), catchError(() => of([])));
  }

  private searchSnomed(text: string): Observable<SnomedConcept[]> {
    if (text.length < 3) {
      return of([]);
    }
    const q = new SnomedConceptSearchParams();
    q.term = text;
    q.limit = 100;

    return !this.authService.hasAnyPrivilege(['snomed-ct.CodeSystem.view']) ? of([])
      : this.snomedService.findConcepts(q).pipe(map(cs => cs.items), catchError(() => of([])));
  }


  protected openConcept(codeSystem: string, code: string): void {
    this.router.navigate(['/resources/code-systems/', codeSystem, 'concepts', code, 'view']);
  }

  protected openCodeSystem(id: number): void {
    this.router.navigate(['/resources/code-systems/', id, 'summary']);
  }

  protected openValueSet(id: number): void {
    this.router.navigate(['/resources/value-sets/', id, 'summary']);
  }

  protected openMapSet(id: number): void {
    this.router.navigate(['/resources/map-sets/', id, 'summary']);
  }

  protected openMeasurementUnit(id: number): void {
    this.router.navigate(['/measurement-units/', id, 'view']);
  }

  protected get isEmpty(): boolean {
    return !this.concepts?.data?.length &&
      !this.codeSystems?.length &&
      !this.valueSets?.length &&
      !this.mapSets?.length &&
      !this.measurementUnits?.length &&
      !this.snomedConcepts?.length;
  }

  protected findDesignationMatch = (c: CodeSystemConcept): string => {
   return c?.versions?.flatMap(v => v.designations)?.find(d => d.name.toLowerCase().includes(this.searchText.toLowerCase())).name;
  };

}
