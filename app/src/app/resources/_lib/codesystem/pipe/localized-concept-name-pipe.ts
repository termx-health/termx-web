import {Pipe, PipeTransform} from '@angular/core';
import {EMPTY, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {CodeSystemConcept, CodeSystemConceptLibService} from '../../codesystem';
import {compareValues, HttpCacheService, isDefined} from '@kodality-web/core-util';
import {SnomedLibService} from 'term-web/integration/_lib';
import {MeasurementUnitLibService} from 'term-web/measurement-unit/_lib';

@Pipe({
  name: 'localizedConceptName'
})
export class LocalizedConceptNamePipe implements PipeTransform {

  public constructor(
    private cacheService: HttpCacheService,
    private translateService: TranslateService,
    private conceptService: CodeSystemConceptLibService,
    private snomedService: SnomedLibService,
    private measurementUnitService: MeasurementUnitLibService
  ) {}

  public transform(identifier: string | number, resource: {codeSystem?: string, codeSystemVersion?: string, valueSet?: string, valueSetVersion?: string}): Observable<string> {
    if (!identifier || !resource || (!resource.codeSystem && !resource.valueSet)) {
      return identifier ? of(String(identifier)) : EMPTY;
    }

    const request = this.getRequest(identifier, resource);

    const key = `${identifier || '-'}` +
      `#${resource.codeSystem || '-'}#${resource.codeSystemVersion || '-'}` +
      `#${resource.valueSet || '-'}#${resource.valueSetVersion || '-'}`;

    return this.cacheService.getCachedResponse(key, request);
  }

  private getName(concept: CodeSystemConcept, lang: string, codeSystemEntityVersionId?: number): string | undefined {
    if (!concept.versions) {
      return concept.code!;
    }

    let conceptVersion;
    if (isDefined(codeSystemEntityVersionId)) {
      conceptVersion = concept.versions.find(v => v.id === codeSystemEntityVersionId);
    }
    if (!isDefined(codeSystemEntityVersionId)) {
      conceptVersion = concept.versions.find(v => v.status === 'active');
    }
    if (!isDefined(codeSystemEntityVersionId) && !conceptVersion) {
      conceptVersion = concept.versions.find(v => v.status === 'draft');
    }
    if (!conceptVersion || !conceptVersion.designations) {
      return concept.code!;
    }

    const filteredByLang = conceptVersion.designations.filter(d => d.language === lang);
    const designations = filteredByLang?.length > 0 ? filteredByLang : conceptVersion.designations;

    return designations.sort((a, b) => compareValues(a.preferred, b.preferred))[0]?.name;
  }

  private getRequest(identifier: string | number, resource: any): Observable<string> {
    if (resource.codeSystem === 'snomed-ct' && typeof identifier === 'string') {
      return this.snomedService.loadConcept(identifier).pipe(map(concept => {
        return concept.pt.term;
      }));
    }
    if (resource.codeSystem === 'ucum' && typeof identifier === 'string') {
      return this.measurementUnitService.search({code: identifier, limit: 1})
        .pipe(
          map(resp => resp.data[0]),
          map(val => val ? (val.names[this.translateService.currentLang] || Object.values(val.names)?.[0]) : undefined)
        );
    }
    return this.conceptService.search({
      ...(typeof identifier === 'string') && {code: identifier},
      ...(typeof identifier === 'number') && {codeSystemEntityVersionId: identifier},
      codeSystem: resource.codeSystem,
      codeSystemVersion: resource.codeSystemVersion,
      valueSet: resource.valueSet,
      valueSetVersion: resource.valueSetVersion,
      limit: 1
    }).pipe(
      map(resp => resp.data[0]),
      map(val => val ? this.getName(val, this.translateService.currentLang, typeof identifier === 'number' ? identifier : undefined) : identifier),
      map(String)
    );
  }
}
