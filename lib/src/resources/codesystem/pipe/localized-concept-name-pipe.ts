import {Pipe, PipeTransform} from '@angular/core';
import {EMPTY, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {CodeSystemConceptLibService} from '../services/code-system-concept-lib.service';
import {CodeSystemConcept} from '../model/code-system-concept';
import {compareValues, HttpCacheService} from '@kodality-web/core-util';

@Pipe({
  name: 'localizedConceptName'
})
export class LocalizedConceptNamePipe implements PipeTransform {

  public constructor(
    private cacheService: HttpCacheService,
    private translateService: TranslateService,
    private conceptService: CodeSystemConceptLibService
  ) {}

  public transform(code: string, resource: {codeSystem?: string, codeSystemVersion?: string, valueSet?: string, valueSetVersion?: string}): Observable<string> {
    if (!code || !resource || (!resource.codeSystem && !resource.valueSet)) {
      return EMPTY;
    }

    const request = this.conceptService.search({
      code: code,
      codeSystem: resource.codeSystem,
      codeSystemVersion: resource.codeSystemVersion,
      valueSet: resource.valueSet,
      valueSetVersion: resource.valueSetVersion,
      limit: 1
    }).pipe(map(resp => {
      return resp.data[0] ? this.getName(resp.data[0], this.translateService.currentLang) : code;
    }));

    const key = `${code || '-'}` +
      `#${resource.codeSystem || '-'}#${resource.codeSystemVersion || '-'}` +
      `#${resource.valueSet || '-'}#${resource.valueSetVersion || '-'}`;

    return this.cacheService.getCachedResponse(key, request);
  }

  private getName(concept: CodeSystemConcept, lang: string): string {
    if (!concept.versions) {
      return concept.code!;
    }
    const conceptVersion = concept.versions.find(v => v.status === 'active');
    if (!conceptVersion || !conceptVersion.designations) {
      return concept.code!;
    }
    const filteredByLang = conceptVersion.designations.filter(d => d.language === lang);
    const designations = filteredByLang?.length > 0 ? filteredByLang : conceptVersion.designations;

    return designations.sort((a, b) => compareValues(a.preferred, b.preferred))[0].name!;
  }
}
