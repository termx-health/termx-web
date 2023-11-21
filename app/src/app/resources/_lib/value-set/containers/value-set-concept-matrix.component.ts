import {Component, Injectable, Input, OnChanges} from '@angular/core';
import {interval, map, Observable, of} from 'rxjs';
import {HttpCacheService} from '@kodality-web/core-util';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ValueSetLibService} from '../services/value-set-lib.service';

interface ConceptView {
  code: string;
  properties: {
    value: string,
    lang?: any
  }[]
}

@Injectable({providedIn: 'root'})
class ValueSetConceptMatrixService {
  private cache = new HttpCacheService();

  public constructor(
    private valueSetService: ValueSetLibService,
  ) {
    interval(10_000).pipe(takeUntilDestroyed()).subscribe(() => this.cache.clear());
  }

  public load(id: string, version: string): Observable<ConceptView[]> {
    if (!id || !version) {
      return of([]);
    }

    const req$ = this.valueSetService.loadVersion(id, version).pipe(
      map(vs => {
        return vs.snapshot.expansion.map(c => ({
          code: c.concept.code,
          properties: c.additionalDesignations.map(d => ({value: d.name, lang: d.language}))
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
  public static ngAcceptInputType_langs: string[];

  @Input() public id: string;
  @Input() public version: string;
  @Input() public limit: number;
  protected _langs: string[] = [];

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

  protected slice(concepts: ConceptView[], limit: number): ConceptView[] {
    return concepts?.slice(0, limit);
  }
}
