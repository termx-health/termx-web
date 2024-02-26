import {Component, Injectable, Input, OnChanges} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {HttpCacheService} from '@kodality-web/core-util';
import {interval, map, Observable, of} from 'rxjs';
import {AuthService} from 'term-web/core/auth';
import {ValueSetLibService} from '../services/value-set-lib.service';

type ConceptView = {
  [type in 'code' | 'display' | 'designations']: {
    value: string,
    lang?: any
  }[]
}

@Injectable({providedIn: 'root'})
class ValueSetConceptMatrixService {
  private cache = new HttpCacheService();

  public constructor(
    private authService: AuthService,
    private valueSetService: ValueSetLibService,
  ) {
    interval(10_000).pipe(takeUntilDestroyed()).subscribe(() => this.cache.clear());
  }

  public load(id: string, version: string): Observable<ConceptView[]> {
    if (!id || !version || !this.authService.hasPrivilege(`${id}.ValueSet.view`)) {
      return of([]);
    }

    const req$ = this.valueSetService.loadVersion(id, version).pipe(
      map(vs => {
        return vs.snapshot.expansion.map(c => ({
          code: [{value: c.concept.code}],
          display: c.display ? [{value: c.display.name, lang: c.display.language}] : [],
          designations: c.additionalDesignations.map(d => ({value: d.name, lang: d.language}))
        }));
      })
    );

    return this.cache.put(`${id}#${version}`, req$);
  }
}

@Component({
  selector: 'tw-value-set-concept-matrix',
  templateUrl: 'value-set-concept-matrix.component.html'
})
export class ValueSetConceptMatrixComponent implements OnChanges {
  public static ngAcceptInputType_properties: string[];
  public static ngAcceptInputType_langs: string[];

  @Input() public id: string;
  @Input() public version: string;
  protected _properties: string[];
  protected _langs: string[] = [];
  @Input() public limit: number;

  @Input()
  public set properties(v: string | string[]) {
    this._properties = Array.isArray(v) ? v : decodeURIComponent(v).split(',');
  }

  @Input()
  public set langs(v: string | string[]) {
    this._langs = Array.isArray(v) ? v : decodeURIComponent(v).split(',');
  }

  protected concepts: ConceptView[];

  public constructor(
    private service: ValueSetConceptMatrixService,
  ) { }

  public ngOnChanges(): void {
    this.service.load(this.id, this.version).subscribe(resp => {
      this.concepts = resp;
    });
  }

  protected displayedProperties(props: string[], properties: string[]): string[] {
    return properties ? properties.filter(p => props.includes(p)) : props;
  }

  protected slice(concepts: ConceptView[], limit: number): ConceptView[] {
    return concepts?.slice(0, limit);
  }

  protected translateKey(k: string): string {
    return {
      code: 'entities.value-set-version-concept.concept',
      display: 'entities.value-set-version-concept.display',
      designations: 'entities.value-set-version-concept.designations',
    }[k];
  }
}
