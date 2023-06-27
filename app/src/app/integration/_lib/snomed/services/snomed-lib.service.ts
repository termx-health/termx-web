import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {SearchHttpParams} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {SnomedConcept} from '../model/concept/snomed-concept';
import {SnomedConceptSearchParams} from '../model/concept/snomed-concept-search-params';
import {SnomedSearchResult} from '../model/snomed-search-result';
import {SnomedDescriptionSearchParams} from '../model/description/snomed-description-search-params';
import {SnomedDescriptionSearchResult} from '../model/description/snomed-description-search-result';
import {SnomedRefsetSearchParams} from '../model/refset/snomed-refset-search-params';
import {SnomedRefsetSearchResult} from '../model/refset/snomed-refset-search-result';
import {SnomedRefsetMemberSearchResult} from '../model/refset/snomed-refset-member-search-result';

@Injectable()
export class SnomedLibService {
  protected baseUrl = `${environment.termxApi}/snomed`;

  public constructor(protected http: HttpClient) { }

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
      const refsets: SnomedConcept[] = [];
      const refsetItems = resp.items!.filter(i => !!i.additionalFields?.mapTarget);
      refsetItems.forEach(item => {
        const refset = resp.referenceSets![item.refsetId!];
        refset.target = item.additionalFields!.mapTarget;
        refsets.push(refset);
      });
      return refsets;
    }));
  }

}
