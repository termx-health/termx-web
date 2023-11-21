import {Component, Injectable, Input, OnChanges} from '@angular/core';
import {CodeSystemLibService, EntityProperty} from 'term-web/resources/_lib';
import {interval, map, mergeMap, Observable} from 'rxjs';
import {collect, group, HttpCacheService} from '@kodality-web/core-util';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

interface ConceptView {
  code: string;
  properties: {
    [propertyCode: string]: {
      value: string,
      lang?: any
    }[]
  }
}

@Injectable({providedIn: 'root'})
class CodeSystemConceptMatrixService {
  private cache = new HttpCacheService();

  public constructor(
    private codeSystemService: CodeSystemLibService,
  ) {
    interval(10_000).pipe(takeUntilDestroyed()).subscribe(() => this.cache.clear());
  }

  public load(id: string, limit: number): Observable<{
    properties: EntityProperty[],
    concepts: ConceptView[],
    total: number
  }> {
    const req$ = this.codeSystemService.load(id).pipe(
      mergeMap(cs => {
        const properties = group(cs.properties, p => p.id);
        return this.codeSystemService.searchConcepts(id, {limit}).pipe(
          map(resp => {
            const concepts = resp.data.map(c => {
              const cVersion = c.versions[c.versions.length - 1];
              return {
                code: c.code,
                properties: {
                  ...collect(cVersion.designations ?? [], d => properties[d.designationTypeId].name, d => ({value: d.name, lang: d.language})),
                  ...collect(cVersion.propertyValues ?? [], d => properties[d.entityPropertyId].name, d => ({value: d.value}))
                }
              };
            });

            return ({
              properties: Object.values(properties),
              concepts: concepts,
              total: resp.meta.total
            });
          })
        );
      })
    );

    return this.cache.put(`${id}#${limit}`, req$);
  }
}

@Component({
  selector: 'tw-code-system-concept-matrix',
  templateUrl: 'code-system-concept-matrix.component.html'
})
export class CodeSystemConceptMatrixComponent implements OnChanges {
  public static ngAcceptInputType_properties: string[];
  public static ngAcceptInputType_langs: string[];

  @Input() public id: string;
  @Input() public limit: number;
  protected _properties: string[];
  protected _langs: string[] = [];

  @Input()
  public set properties(v: string | string[]) {
    this._properties = Array.isArray(v) ? v : decodeURIComponent(v).split(',');
  }

  @Input()
  public set langs(v: string | string[]) {
    this._langs = Array.isArray(v) ? v : decodeURIComponent(v).split(',');
  }

  protected entityProperties: EntityProperty[];
  protected concepts: ConceptView[];
  protected conceptsTotal: number;

  public constructor(
    private service: CodeSystemConceptMatrixService,
  ) { }

  public ngOnChanges(): void {
    this.service.load(this.id, !this.limit || isNaN(this.limit) ? 101 : this.limit).subscribe(r => {
      this.entityProperties = r.properties;
      this.concepts = r.concepts;
      this.conceptsTotal = r.total;
    });
  }

  protected displayedProperties(ep: EntityProperty, properties: string[]): boolean {
    return !properties || properties.includes(ep.name);
  }
}
