import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable, of } from 'rxjs';
import { QueuedCacheService } from 'term-web/core/ui/services/queued-cache.service';
import { environment } from 'environments/environment';
import { CodeSystemConcept, CodeSystemConceptLibService, CodeSystemEntityVersion, ConceptSupplementUtil, ConceptUtil, EntityProperty } from 'term-web/resources/_lib';

export interface CodingReferenceSummary {
  codeSystem: string;
  code: string;
  version?: string;
  status?: string;
  href?: string;
}

@Injectable({providedIn: 'root'})
export class CodeSystemCodingReferenceService {
  private conceptService = inject(CodeSystemConceptLibService);
  private translateService = inject(TranslateService);
  private cacheService = new QueuedCacheService();

  public load(property?: EntityProperty, value?: any): Observable<CodingReferenceSummary | undefined> {
    if (property?.type !== 'Coding' || !value?.codeSystem || !value?.code) {
      return of(undefined);
    }

    const codeSystem = value.codeSystem;
    const code = value.code;
    const requestedVersion = value.codeSystemVersion;
    const cacheKey = `#CS|${codeSystem}#CSV|${requestedVersion || '-'}`;

    return this.cacheService.enqueueRequest(
      cacheKey,
      code,
      codes => this.conceptService.search({
        codeSystem,
        codeSystemVersion: requestedVersion,
        code: Array.from(new Set(codes)).join(','),
        ...ConceptSupplementUtil.forCodeSystem(codeSystem, this.translateService.currentLang),
        limit: codes.length
      }),
      (resp, requestedCode) => resp.data.find(concept => concept.code === requestedCode)
    ).pipe(map(concept => {
      if (!concept) {
        return undefined;
      }

      const version = this.resolveVersion(concept, requestedVersion);
      const versionCode = this.resolveVersionCode(version, requestedVersion);

      return {
        codeSystem,
        code,
        version: versionCode,
        status: version?.status,
        href: versionCode ? this.buildHref(codeSystem, versionCode, code) : undefined
      };
    }));
  }

  private resolveVersion(concept: CodeSystemConcept, requestedVersion?: string): CodeSystemEntityVersion | undefined {
    if (requestedVersion) {
      return concept?.versions?.find(v => v.versions?.some(ref => ref.version === requestedVersion))
        ?? ConceptUtil.getLastVersion(concept)
        ?? concept?.versions?.[0];
    }

    return ConceptUtil.getLastVersion(concept) ?? concept?.versions?.[0];
  }

  private resolveVersionCode(version?: CodeSystemEntityVersion, requestedVersion?: string): string | undefined {
    if (requestedVersion) {
      return requestedVersion;
    }

    return version?.versions?.find(ref => ref.status === 'active')?.version
      ?? version?.versions?.find(ref => ref.status === 'draft')?.version
      ?? version?.versions?.[0]?.version;
  }

  private buildHref(codeSystem: string, version: string, code: string): string {
    const baseHref = environment.baseHref.endsWith('/') ? environment.baseHref.slice(0, -1) : environment.baseHref;
    return `${baseHref}/resources/code-systems/${codeSystem}/versions/${version}/concepts/${encodeURIComponent(code)}/edit`;
  }
}
