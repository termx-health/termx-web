import {Component, OnInit} from '@angular/core';
import {catchError, forkJoin, map, Observable, of} from 'rxjs';
import {Router} from '@angular/router';
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
  ValueSetSearchParams, ValueSetVersionConcept
} from 'term-web/resources/_lib';
import {MeasurementUnit, MeasurementUnitLibService, MeasurementUnitSearchParams} from 'term-web/measurement-unit/_lib';
import {SnomedConcept, SnomedConceptSearchParams, SnomedLibService} from 'term-web/integration/_lib';
import {ComponentStateStore, HttpCacheService, LoadingManager, QueryParams} from '@kodality-web/core-util';

@Component({
  templateUrl: './global-search-dashboard.component.html'
})
export class GlobalSearchDashboardComponent implements OnInit {
  public searchText?: string;

  public concepts: CodeSystemConcept[] = [];
  public codeSystems: CodeSystem[] = [];
  public valueSets: ValueSet[] = [];
  public mapSets: MapSet[] = [];
  public measurementUnits: MeasurementUnit[] = [];
  public snomedConcepts: SnomedConcept[] = [];

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
    private cacheService: HttpCacheService
  ) {}

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state?.text) {
      this.searchText = state.text;
      this.search(this.searchText);
    }
  }

  public search(text: string): void {
    if (!text || text.length < 1) {
      this.concepts = [];
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

  private searchConcepts(text: string): Observable<CodeSystemConcept[]> {
    const q = new ConceptSearchParams();
    q.textContains = text;
    q.limit = 100;

    return this.codeSystemConceptService.search(q).pipe(map(c => c.data), catchError(() => of([])));
  }

  private searchCodeSystems(text: string): Observable<CodeSystem[]> {
    const q = new CodeSystemSearchParams();
    q.textContains = text;
    q.limit = 100;

    return this.codeSystemService.search(q).pipe(map(cs => cs.data), catchError(() => of([])));
  }

  private searchValueSets(text: string): Observable<ValueSet[]> {
    const q = new ValueSetSearchParams();
    q.textContains = text;
    q.limit = 100;

    return this.valueSetService.search(q).pipe(map(cs => cs.data), catchError(() => of([])));
  }

  private searchMapSets(text: string): Observable<MapSet[]> {
    const q = new MapSetSearchParams();
    q.textContains = text;
    q.limit = 100;

    return this.mapSetService.search(q).pipe(map(cs => cs.data), catchError(() => of([])));
  }

  private searchMeasurementUnits(text: string): Observable<MeasurementUnit[]> {
    const q = new MeasurementUnitSearchParams();
    q.textContains = text;
    q.limit = 100;

    return this.measurementUnitService.search(q).pipe(map(cs => cs.data), catchError(() => of([])));
  }

  private searchSnomed(text: string): Observable<SnomedConcept[]> {
    if (text.length < 3) {
      return of([]);
    }
    const q = new SnomedConceptSearchParams();
    q.term = text;
    q.limit = 100;

    return this.snomedService.findConcepts(q).pipe(map(cs => cs.items), catchError(() => of([])));
  }

  public openConcept(codeSystem: string, code: string): void {
    this.router.navigate(['/resources/code-systems/', codeSystem, 'concepts', code, 'view']);
  }

  public openCodeSystem(id: number): void {
    this.router.navigate(['/resources/code-systems/', id, 'summary']);
  }

  public openValueSet(id: number): void {
    this.router.navigate(['/resources/value-sets/', id, 'summary']);
  }

  public openMapSet(id: number): void {
    this.router.navigate(['/resources/map-sets/', id, 'summary']);
  }

  public openMeasurementUnit(id: number): void {
    this.router.navigate(['/measurement-units/', id, 'view']);
  }
}
