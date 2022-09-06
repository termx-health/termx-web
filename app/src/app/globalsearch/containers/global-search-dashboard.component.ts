import {Component} from '@angular/core';
import {catchError, finalize, forkJoin, map, Observable, of} from 'rxjs';
import {
  CodeSystem,
  CodeSystemConcept,
  CodeSystemConceptLibService,
  CodeSystemLibService,
  CodeSystemSearchParams,
  ConceptSearchParams, MapSet, MapSetLibService, MapSetSearchParams, ValueSet, ValueSetLibService, ValueSetSearchParams
} from 'terminology-lib/resources';
import {Router} from '@angular/router';
import {SnomedConcept, SnomedConceptSearchParams, SnomedLibService} from 'terminology-lib/integration';
import {MeasurementUnit, MeasurementUnitLibService, MeasurementUnitSearchParams} from 'terminology-lib/measurementunit';

@Component({
  templateUrl: './global-search-dashboard.component.html'
})
export class GlobalSearchDashboardComponent {
  public searchText?: string;

  public concepts: CodeSystemConcept[] = [];
  public codeSystems: CodeSystem[] = [];
  public valueSets: ValueSet[] = [];
  public mapSets: MapSet[] = [];
  public measurementUnits: MeasurementUnit[] = [];
  public snomedConcepts: SnomedConcept[] = [];

  public loading: {[key: string]: boolean} = {};

  public constructor(
    private router: Router,
    private snomedService: SnomedLibService,
    private mapSetService: MapSetLibService,
    private valueSetService: ValueSetLibService,
    private codeSystemService: CodeSystemLibService,
    private measurementUnitService: MeasurementUnitLibService,
    private codeSystemConceptService: CodeSystemConceptLibService
  ) {}

  public search(text: string): void {
    if (!text || text.length < 1) {
      this.concepts = [];
      this.codeSystems = [];
      this.valueSets = [];
      this.mapSets = [];
      return;
    }

    forkJoin([
      this.searchConcepts(text),
      this.searchCodeSystems(text),
      this.searchValueSets(text),
      this.searchMapSets(text),
      this.searchMeasurementUnits(text),
      this.searchSnomed(text)
    ]).subscribe(([concepts, codeSystems, valueSets, mapSets, measurementUnits, snomedConcepts]) => {
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

    this.loading['c-search'] = true;
    return this.codeSystemConceptService.search(q).pipe(
      map(c => c.data),
      catchError(() => of([])),
      finalize(() => this.loading['c-search'] = false)
    );
  }

  private searchCodeSystems(text: string): Observable<CodeSystem[]> {
    const q = new CodeSystemSearchParams();
    q.textContains = text;
    q.limit = 100;

    this.loading['cs-search'] = true;
    return this.codeSystemService.search(q).pipe(
      map(cs => cs.data),
      catchError(() => of([])),
      finalize(() => this.loading['cs-search'] = false)
    );
  }

  private searchValueSets(text: string): Observable<ValueSet[]> {
    const q = new ValueSetSearchParams();
    q.textContains = text;
    q.limit = 100;

    this.loading['vs-search'] = true;
    return this.valueSetService.search(q).pipe(
      map(cs => cs.data),
      catchError(() => of([])),
      finalize(() => this.loading['vs-search'] = false)
    );
  }

  private searchMapSets(text: string): Observable<MapSet[]> {
    const q = new MapSetSearchParams();
    q.textContains = text;
    q.limit = 100;

    this.loading['ms-search'] = true;
    return this.mapSetService.search(q).pipe(
      map(cs => cs.data),
      catchError(() => of([])),
      finalize(() => this.loading['ms-search'] = false)
    );
  }

  private searchMeasurementUnits(text: string): Observable<MeasurementUnit[]> {
    const q = new MeasurementUnitSearchParams();
    q.textContains = text;
    q.limit = 100;

    this.loading['measurement-unit'] = true;
    return this.measurementUnitService.search(q).pipe(
      map(cs => cs.data),
      catchError(() => of([])),
      finalize(() => this.loading['measurement-unit'] = false)
    );
  }

  private searchSnomed(text: string): Observable<SnomedConcept[]> {
    if (text.length < 3) {
      return of([]);
    }
    const q = new SnomedConceptSearchParams();
    q.term = text;
    q.limit = 100;

    this.loading['snomed'] = true;
    return this.snomedService.findConcepts(q).pipe(
      map(cs => cs.items),
      catchError(() => of([])),
      finalize(() => this.loading['snomed'] = false)
    );
  }

  public openConcept(codeSystem: string, id: number): void {
    this.router.navigate(['/resources/code-systems/', codeSystem, 'concepts', id, 'view']);
  }

  public openCodeSystem(id: number): void {
    this.router.navigate(['/resources/code-systems/', id, 'view']);
  }

  public openValueSet(id: number): void {
    this.router.navigate(['/resources/value-sets/', id, 'view']);
  }

  public openMapSet(id: number): void {
    this.router.navigate(['/resources/map-sets/', id, 'view']);
  }

  public openMeasurementUnit(id: number): void {
    this.router.navigate(['/measurement-units/', id, 'view']);
  }
}
