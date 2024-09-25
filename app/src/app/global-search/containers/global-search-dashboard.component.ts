import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ComponentStateStore, HttpCacheService, LoadingManager, SearchResult} from '@kodality-web/core-util';
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

interface Filter {
  open: boolean;
  spaceId?: number;
  publisher?: string;
  codeSystems?: string[];
}

@Component({
  templateUrl: './global-search-dashboard.component.html'
})
export class GlobalSearchDashboardComponent implements OnInit {
  public searchText?: string;

  public conceptParams: ConceptSearchParams;
  public concepts: SearchResult<CodeSystemConcept> = SearchResult.empty();
  public codeSystems: CodeSystem[] = [];
  public valueSets: ValueSet[] = [];
  public mapSets: MapSet[] = [];
  public measurementUnits: MeasurementUnit[] = [];
  public snomedConcepts: SnomedConcept[] = [];
  public filter: Filter = { open: false };

  protected readonly STORE_KEY = 'global-search';

  protected loader = new LoadingManager();

  public constructor(
    private router: Router,
    private snomedService: SnomedLibService,
    private mapSetService: MapSetLibService,
    private valueSetService: ValueSetLibService,
    private codeSystemService: CodeSystemLibService,
    private measurementUnitService: MeasurementUnitLibService,
    private codeSystemConceptService: CodeSystemConceptLibService,
    private stateStore: ComponentStateStore,
    private cacheService: HttpCacheService,
    private authService: AuthService
  ) {}

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state) {
      this.searchText = state.text;
      this.filter = state.filter;
      this.search();
    }
  }

  public search(): void {
    const text = this.searchText;
    if (!text || text.length < 1) {
      this.concepts = SearchResult.empty();
      this.codeSystems = [];
      this.valueSets = [];
      this.mapSets = [];
      return;
    }
    this.stateStore.put(this.STORE_KEY, {text, filter: this.filter});

    const searchRequests = forkJoin([
      this.searchConcepts(text),
      this.searchCodeSystems(text),
      this.searchValueSets(text),
      this.searchMapSets(text),
      this.searchMeasurementUnits(text),
      this.searchSnomed(text)
    ]);

    const cacheKey = `${text}-${this.getFilterCacheKey()}`;
    this.loader.wrap('load', this.cacheService.put(cacheKey, searchRequests))
      .subscribe(([concepts, codeSystems, valueSets, mapSets, measurementUnits, snomedConcepts]) => {
        this.concepts = concepts;
        this.codeSystems = codeSystems;
        this.valueSets = valueSets;
        this.mapSets = mapSets;
        this.measurementUnits = measurementUnits;
        this.snomedConcepts = snomedConcepts;
      });
  }

  public onFilterOpen = (): void => {
    this.filter.open = true;
  };

  public reset = (): void => {
    this.filter = {open: this.filter.open};
  };

  private searchConcepts(text: string): Observable<SearchResult<CodeSystemConcept>> {
    this.conceptParams = new ConceptSearchParams();
    this.conceptParams.textContains = text;
    this.conceptParams.codeSystem = this.filter.codeSystems?.join(',') || undefined;
    return !this.authService.hasAnyPrivilege(['*.CodeSystem.view']) ? of(SearchResult.empty())
      : this.codeSystemConceptService.search(this.conceptParams).pipe(map(c => c), catchError(() => of(SearchResult.empty())));
  }

  protected loadConcepts(): void {
   this.loader.wrap('load-concepts', this.codeSystemConceptService.search(this.conceptParams)).subscribe(r => this.concepts = r);
  }

  private searchCodeSystems(text: string): Observable<CodeSystem[]> {
    const q = new CodeSystemSearchParams();
    q.textContains = text;
    q.spaceId = this.filter.spaceId;
    q.publisher = this.filter.publisher;
    q.ids = this.filter.codeSystems?.join(',') || undefined;
    q.limit = 100;

    return !this.authService.hasAnyPrivilege(['*.CodeSystem.view']) ? of([])
      : this.codeSystemService.search(q).pipe(map(cs => cs.data), catchError(() => of([])));
  }

  private searchValueSets(text: string): Observable<ValueSet[]> {
    const q = new ValueSetSearchParams();
    q.textContains = text;
    q.spaceId = this.filter.spaceId;
    q.publisher = this.filter.publisher;
    q.limit = 100;

    return !this.authService.hasAnyPrivilege(['*.ValueSet.view']) ? of([])
      : this.valueSetService.search(q).pipe(map(cs => cs.data), catchError(() => of([])));
  }

  private searchMapSets(text: string): Observable<MapSet[]> {
    const q = new MapSetSearchParams();
    q.textContains = text;
    q.spaceId = this.filter.spaceId;
    q.publisher = this.filter.publisher;
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

  private getFilterCacheKey = (): string => [
    this.filter.spaceId,
    this.filter.publisher,
    this.filter.codeSystems?.map(v => `cs:${v}`).join(',')]
      .filter(x => x).join('-');
}
