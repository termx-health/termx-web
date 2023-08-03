import {Injectable, Pipe, PipeTransform} from '@angular/core';
import {EMPTY, forkJoin, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {CodeSystemConcept, CodeSystemConceptLibService} from '../../codesystem';
import {compareValues, isDefined, unique} from '@kodality-web/core-util';
import {SnomedLibService} from 'term-web/integration/_lib';
import {MeasurementUnitLibService} from 'term-web/measurement-unit/_lib';
import {QueuedCacheService} from 'term-web/core/ui/services/queued-cache.service';


type ResourceParams = {
  codeSystem?: string,
  codeSystemVersion?: string,
  valueSet?: string,
  valueSetVersion?: string
}

@Injectable({providedIn: 'root'})
class LocalizedConceptNameService {
  private cacheService = new QueuedCacheService();

  public constructor(
    private conceptService: CodeSystemConceptLibService,
    private snomedService: SnomedLibService,
    private measurementUnitService: MeasurementUnitLibService,
    private translateService: TranslateService,
  ) { }


  public transform(resource: ResourceParams, identifier: string | number): Observable<string> {
    return this.cacheService.enqueueRequest(
      `${typeof identifier}#${this.getKey(resource)}`,
      identifier,
      (ids) => this.getOptimizedRequest(resource, (ids as any[])?.filter(unique) || []),
      (resp, val) => resp.find(d => d.id === val)?.name);
  }

  private getOptimizedRequest(resource: ResourceParams, ids: string[] | number[]): Observable<{id: string | number, name?: string}[]> {
    const isString = typeof ids[0] === 'string';

    if (resource.codeSystem === 'snomed-ct' && isString) {
      return this.snomedService.findConcepts({conceptIds: ids as string[], limit: ids.length}).pipe(map(res => res.items.map(i => ({id: i.conceptId, name: i.pt.term}))));
    }

    if (resource.codeSystem === 'ucum' && isString) {
      return this.measurementUnitService.search({code: ids.join(","), limit: ids.length}).pipe(
        map(resp => ids.map(id => {
          const val = resp.data.find(c => c.code === id);
          const name = val.names[this.translateService.currentLang] || Object.values(val.names)?.[0];
          return {id, name};
        }))
      );
    }

    return this.conceptService.search({
      ...isString && {code: ids.join(",")},
      ...!isString && {codeSystemEntityVersionId: ids.join(",")},
      codeSystem: resource.codeSystem,
      codeSystemVersion: resource.codeSystemVersion,
      valueSet: resource.valueSet,
      valueSetVersion: resource.valueSetVersion,
      limit: ids.length
    }).pipe(
      map(resp => {
        const concepts = resp.data;
        const lang = this.translateService.currentLang;
        return ids.map(id => {
          const concept = concepts.find(c => typeof id === 'string' ? c.code === id : c.versions?.find(v => v.id === id));
          return {
            id: id,
            name: concept ? this.getName(concept, lang, typeof id === 'number' ? id : undefined) : id
          };
        }).filter(Boolean);
      })
    );
  }


  private getName(concept: CodeSystemConcept, lang: string, codeSystemEntityVersionId?: number): string | undefined {
    if (!concept.versions) {
      return concept.code!;
    }

    let conceptVersion;
    if (isDefined(codeSystemEntityVersionId)) {
      conceptVersion =
        concept.versions.find(v => v.id === codeSystemEntityVersionId);
    } else {
      conceptVersion =
        concept.versions.find(v => v.status === 'active') ??
        concept.versions.find(v => v.status === 'draft');
    }

    if (!conceptVersion || !conceptVersion.designations) {
      return concept.code!;
    }

    const filteredByLang = conceptVersion.designations.filter(d => d.language === lang);
    const designations = filteredByLang?.length > 0 ? filteredByLang : conceptVersion.designations;
    return designations.sort((a, b) => compareValues(a.preferred, b.preferred))[0]?.name;
  }


  private getKey(resource: ResourceParams, identifier?: string | number): string {
    return `${identifier || '-'}` +
      `#CS|${resource.codeSystem || '-'}#CSV|${resource.codeSystemVersion || '-'}` +
      `#VS|${resource.valueSet || '-'}#VSV|${resource.valueSetVersion || '-'}`;
  }
}

@Pipe({name: 'localizedConceptName'})
export class LocalizedConceptNamePipe implements PipeTransform {
  public constructor(private conceptNameService: LocalizedConceptNameService) {}

  public transform(identifier: string | number, resource: ResourceParams): Observable<string> {
    if (!identifier || !resource || (!resource.codeSystem && !resource.valueSet)) {
      return identifier ? of(String(identifier)) : EMPTY;
    }
    return this.conceptNameService.transform(resource, identifier);
  }
}

