import {Injectable, Pipe, PipeTransform} from '@angular/core';
import {EMPTY, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {CodeSystemConcept, CodeSystemConceptLibService} from '../../code-system';
import {isDefined, sortFn, unique} from '@kodality-web/core-util';
import {SnomedLibService} from 'term-web/integration/_lib';
import {MeasurementUnitLibService} from 'term-web/measurement-unit/_lib';
import {QueuedCacheService} from 'term-web/core/ui/services/queued-cache.service';
import {environment} from 'environments/environment';
import {Designation, ValueSetLibService} from 'term-web/resources/_lib';


type ResourceParams = CodeSystemResourceParams & ValueSetResourceParams;
type CodeSystemResourceParams = {
  codeSystem?: string,
  codeSystemVersion?: string,
}
type ValueSetResourceParams = {
  valueSet?: string,
  valueSetVersion?: string
}

type OptimizedResponse = {id: string | number, name?: string}


@Injectable({providedIn: 'root'})
class LocalizedConceptNameService {
  private cacheService = new QueuedCacheService();

  public constructor(
    private conceptService: CodeSystemConceptLibService,
    private translateService: TranslateService,
    // TODO: Service below do not belong to this module! Move pipe out of this module, somehow!
    private valueSetService: ValueSetLibService,
    private snomedService: SnomedLibService,
    private measurementUnitService: MeasurementUnitLibService,
  ) { }


  public transform(resource: ResourceParams, identifier: string | number): Observable<string> {
    const key =
      `#CS|${resource.codeSystem || '-'}#CSV|${resource.codeSystemVersion || '-'}` +
      `#VS|${resource.valueSet || '-'}#VSV|${resource.valueSetVersion || '-'}`;

    return this.cacheService.enqueueRequest(
      `${typeof identifier}#${key}`,
      identifier,
      (ids) => this.getOptimizedRequest(resource, (ids as any[])?.filter(unique) || []),
      (resp, val) => resp.find(d => d.id === val)?.name);
  }

  private getOptimizedRequest(resource: ResourceParams, ids: string[] | number[]): Observable<OptimizedResponse[]> {
    const isString = typeof ids[0] === 'string';
    if (resource.codeSystem === 'snomed-ct' && isString) {
      return this.$snomed(ids);
    }
    if (resource.codeSystem === 'ucum' && isString) {
      return this.$ucum(ids);
    }
    if (resource.codeSystem) {
      return this.$codeSystem(ids, resource, isString);
    }
    if (resource.valueSet) {
      return this.$valueSet(ids, resource);
    }
  }


  private $codeSystem(reqIds: string[] | number[], resource: CodeSystemResourceParams, isString: boolean): Observable<OptimizedResponse[]> {
    return this.conceptService.search({
      ...isString && {code: reqIds.join(",")},
      ...!isString && {codeSystemEntityVersionId: reqIds.join(",")},
      codeSystem: resource.codeSystem,
      codeSystemVersion: resource.codeSystemVersion,
      limit: reqIds.length
    }).pipe(map(resp =>
      reqIds.map(reqId => {
        const entityVersionId = typeof reqId === 'number' ? reqId : undefined;
        const concept = resp.data.find(c => {
          return isDefined(entityVersionId)
            ? c.versions?.find(v => v.id === entityVersionId)
            : c.code === reqId;
        });

        return {
          id: reqId,
          name: concept ? this.getName(concept, this.translateService.currentLang, entityVersionId) : reqId
        };
      }).filter(isDefined)));
  }

  private getName(concept: CodeSystemConcept, lang: string, entityVersionId?: number): string | undefined {
    const conceptVersion =
      concept.versions?.find(v => v.id === entityVersionId) ??
      concept.versions?.find(v => v.status === 'active') ??
      concept.versions?.find(v => v.status === 'draft');

    if (!conceptVersion || !conceptVersion.designations) {
      return concept.code;
    }

    return this.localize(
      {
        display: conceptVersion.designations.filter(d => d.designationType === 'display'),
        additional: conceptVersion.designations.filter(d => d.designationType !== 'display'),
      },
      [lang, environment.defaultLanguage]
    );
  }

  private $valueSet(reqIds: string[] | number[], resource: ValueSetResourceParams): Observable<OptimizedResponse[]> {
    return this.valueSetService.expand({
      valueSet: resource.valueSet,
      valueSetVersion: resource.valueSetVersion
    }).pipe(map(expansion =>
      reqIds.map(reqId => {
        const concept = expansion.find(c => c.concept.code === reqId);
        return ({
          id: reqId,
          name: concept ? this.localize({
            display: [concept.display],
            additional: concept.additionalDesignations
          }, [this.translateService.currentLang, environment.defaultLanguage]) : reqId
        });
      }).filter(isDefined)));
  }

  private $snomed(reqIds: string[] | number[]): Observable<OptimizedResponse[]> {
    return this.snomedService.findConcepts({conceptIds: reqIds as string[], limit: reqIds.length}).pipe(map(
      res => res.items.map(i => ({id: i.conceptId, name: i.pt.term}))));
  }

  private $ucum(reqIds: string[] | number[]): Observable<OptimizedResponse[]> {
    return this.measurementUnitService.search({code: reqIds.join(","), limit: reqIds.length}).pipe(map(resp =>
      reqIds.map(id => {
        const val = resp.data.find(c => c.code === id);
        const name = val.names[this.translateService.currentLang] || Object.values(val.names)?.[0];
        return {id, name};
      })));
  }

  private localize = (concept: {display: Designation[], additional: Designation[]}, langPriority: string[]): string => {
    const match = (dns: Designation[], l: string): string => dns
      .filter(d => d.language === l)
      .sort(sortFn('preferred'))[0]
      ?.name;
    return langPriority.map(l => match(concept.display, l) ?? match(concept.additional, l)).find(isDefined);
  };
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

