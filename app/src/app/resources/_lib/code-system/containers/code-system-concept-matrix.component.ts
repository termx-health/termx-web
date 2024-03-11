import {Component, Injectable, Input, OnChanges} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {collect, group, HttpCacheService, isNil} from '@kodality-web/core-util';
import {interval, map, mergeMap, Observable, of} from 'rxjs';
import {AuthService} from 'term-web/core/auth';
import {CodeSystemConcept, CodeSystemEntityVersion, CodeSystemLibService, EntityProperty} from 'term-web/resources/_lib';

type ConceptView = {
  [propertyCode: string]: {
    value: string,
    lang?: any
  }[]
}

@Injectable({providedIn: 'root'})
class CodeSystemConceptMatrixService {
  private cache = new HttpCacheService();

  public constructor(
    private authService: AuthService,
    private codeSystemService: CodeSystemLibService,
  ) {
    interval(10_000).pipe(takeUntilDestroyed()).subscribe(() => this.cache.clear());
  }

  public load(id: string, version: string, limit: number): Observable<{
    properties: EntityProperty[],
    concepts: ConceptView[],
    total: number
  }> {
    if (!id || !this.authService.hasPrivilege(`${id}.CodeSystem.view`)) {
      return of({properties: [], concepts: [], total: 0});
    }

    const req$ = this.codeSystemService.load(id).pipe(mergeMap(cs => {
      const properties = group(cs.properties, p => p.id);

      return this.codeSystemService.searchConcepts(id, {limit, codeSystemVersion: version}).pipe(map(resp => {
        return ({
          properties: [
            {name: 'code'},
            ...Object.values(properties)
          ],
          concepts: this
            .buildStructure(resp.data, cs.hierarchyMeaning)
            .map(({concept: c, version, level}) => ({
              code: [{value: c.code}],
              level: [{value: String(level)}],
              ...collect(version.designations ?? [], d => properties[d.designationTypeId].name, d => ({value: d.name, lang: d.language})),
              ...collect(version.propertyValues ?? [], d => properties[d.entityPropertyId].name, d => ({value: d.value})),
            })),
          total: resp.meta.total
        });
      }));
    }));

    return this.cache.put(`${id}#${version}#${limit}`, req$);
  }

  private buildStructure(concepts: CodeSystemConcept[], hierarchyMeaning: string): {
    concept: CodeSystemConcept;
    version: CodeSystemEntityVersion,
    level: number
  }[] {
    const _concepts = concepts.map(c => ({
      concept: c,
      version: c.versions[c.versions.length - 1],
      parent: c.versions[c.versions.length - 1]?.associations?.find(a => a.associationType === hierarchyMeaning)?.targetCode
    }));

    const buildTree = (parents: typeof _concepts, level = 1) => {
      return parents?.flatMap(p => {
        const children = _concepts.filter(n => n.parent === p.concept.code);
        return [{concept: p.concept, version: p.version, level}, ...buildTree(children, level + 1)];
      }) ?? [];
    };

    return buildTree(_concepts.filter(n => isNil(n.parent)));
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

  protected entityProperties: EntityProperty[];
  protected concepts: ConceptView[];
  protected conceptsTotal: number;

  public constructor(
    private service: CodeSystemConceptMatrixService,
  ) { }

  public ngOnChanges(): void {
    this.service.load(this.id, this.version, !this.limit || isNaN(this.limit) ? 101 : this.limit).subscribe(r => {
      this.entityProperties = r.properties;
      this.concepts = r.concepts;
      this.conceptsTotal = r.total;
    });
  }

  protected displayedProperties(eps: EntityProperty[], properties: string[]): EntityProperty[] {
    return properties ? properties.flatMap(p => eps.filter(ep => ep.name === p)) : eps;
  }
}
