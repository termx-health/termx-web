import {Inject, Injectable} from '@angular/core';
import {TERMINOLOGY_API} from '../../../terminology-lib.token';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SnomedConcept} from '../model/concept/snomed-concept';
import {map} from 'rxjs/operators';
import {SnomedRefsetSearchParams} from '../model/refset/snomed-refset-search-params';
import {SearchHttpParams} from '@kodality-web/core-util';
import {SnomedRefsetSearchResult} from '../model/refset/snomed-refset-search-result';
import {SnomedDescriptionSearchParams} from '../model/description/snomed-description-search-params';
import {SnomedDescriptionSearchResult} from '../model/description/snomed-description-search-result';
import {SnomedRefsetMemberSearchResult} from '../model/refset/snomed-refset-member-search-result';
import {SnomedConceptSearchParams} from '../model/concept/snomed-concept-search-params';
import {SnomedSearchResult} from '../model/snomed-search-result';
import {SnomedImportRequest} from '../model/snomed-import-request';
import {JobLogResponse} from '../../../job';

@Injectable()
export class SnomedLibService {
  protected baseUrl;

  public constructor(@Inject(TERMINOLOGY_API) api: string, protected http: HttpClient) {
    this.baseUrl = `${api}/snomed`;
  }

  public loadConcept(conceptId: string): Observable<SnomedConcept> {
    return this.http.get(`${this.baseUrl}/concepts/${conceptId}`).pipe(map(c => c as SnomedConcept));
  }

  public findConcepts(params: SnomedConceptSearchParams): Observable<SnomedSearchResult<SnomedConcept>> {
    return this.http.get(`${this.baseUrl}/concepts`, {params: SearchHttpParams.build(params)}).pipe(map(r => r as SnomedSearchResult<SnomedConcept>));
  }

  public findConceptChildren(conceptId: string): Observable<Array<SnomedConcept>> {
    return this.http.get(`${this.baseUrl}/concepts/${conceptId}/children`).pipe(map(r => r as Array<SnomedConcept>));
  }

  public findDescriptions(params: SnomedDescriptionSearchParams): Observable<SnomedDescriptionSearchResult> {
    return this.http.get(`${this.baseUrl}/concept-descriptions`, {params: SearchHttpParams.build(params)}).pipe(map(r => r as SnomedDescriptionSearchResult));
  }

  public findRefsets(params: SnomedRefsetSearchParams): Observable<SnomedRefsetSearchResult> {
    return this.http.get(`${this.baseUrl}/refsets`, {params: SearchHttpParams.build(params)}).pipe(map(r => r as SnomedRefsetSearchResult));
  }

  public findRefsetMembers(params: SnomedRefsetSearchParams): Observable<SnomedRefsetMemberSearchResult> {
    return this.http.get(`${this.baseUrl}/refset-members`, {params: SearchHttpParams.build(params)}).pipe(map(r => r as SnomedRefsetMemberSearchResult));
  }

  public loadRefsets(conceptId: string): Observable<SnomedConcept[]> {
    return this.findRefsets({referencedComponentId: conceptId}).pipe(map(resp => {
      const refsets : SnomedConcept[] = [];
      const refsetItems = resp.items!.filter(i => !!i.additionalFields?.mapTarget);
      refsetItems.forEach(item => {
        const refset = resp.referenceSets![item.refsetId!];
        refset.target = item.additionalFields!.mapTarget;
        refsets.push(refset);
      });
      return refsets;
    }));
  }

  public importConcepts(request: SnomedImportRequest): Observable<JobLogResponse> {
    return this.http.post<JobLogResponse>(`${this.baseUrl}/import`, request);
  }

}
