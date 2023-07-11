import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {merge, Observable, Subject, switchMap, take, takeUntil, timer} from 'rxjs';
import {map} from 'rxjs/operators';
import {SearchHttpParams} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {SnomedConcept} from '../model/concept/snomed-concept';
import {SnomedConceptSearchParams} from '../model/concept/snomed-concept-search-params';
import {SnomedSearchResult} from '../model/snomed-search-result';
import {SnomedDescriptionItemSearchParams} from '../model/description/snomed-description-item-search-params';
import {SnomedDescriptionItemSearchResult} from '../model/description/snomed-description-item-search-result';
import {SnomedRefsetSearchParams} from '../model/refset/snomed-refset-search-params';
import {SnomedRefsetSearchResult} from '../model/refset/snomed-refset-search-result';
import {SnomedRefsetMemberSearchResult} from '../model/refset/snomed-refset-member-search-result';
import {SnomedBranch, SnomedDescription, SnomedDescriptionSearchParams} from 'term-web/integration/_lib';

@Injectable()
export class SnomedLibService {
  protected baseUrl = `${environment.termxApi}/snomed`;

  public constructor(protected http: HttpClient) { }

  public loadBranches(): Observable<SnomedBranch[]> {
    return this.http.get(`${this.baseUrl}/branches`).pipe(map(c => c as SnomedBranch[]));
  }

  public loadBranch(path: string): Observable<SnomedBranch> {
    path = path.split('/').join('--');
    return this.http.get(`${this.baseUrl}/branches/${path}`).pipe(map(c => c as SnomedBranch));
  }

  public getRF2File(jobId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/exports/${jobId}/archive`, {
      responseType: 'blob',
      headers: new HttpHeaders({Accept: 'application/zip'})
    });
  }

  public pollJob = (jobId: string, destroy$: Observable<any> = timer(60_000)): Observable<any> => {
    const pollComplete$ = new Subject();
    timer(0, 3000).pipe(
      switchMap(() => this.loadImportJob(jobId)),
      takeUntil(merge(pollComplete$, destroy$))
    ).subscribe(resp => {
      if (resp?.status !== 'RUNNING') {
        pollComplete$.next(resp);
      }
    });
    return pollComplete$.pipe(take(1));
  };

  public loadImportJob(jobId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/imports/${jobId}`);
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

  public findBranchDescriptions(path: string, params: SnomedDescriptionSearchParams): Observable<SnomedSearchResult<SnomedDescription>> {
    path = path.split('/').join('--');
    return this.http.get(`${this.baseUrl}/branches/${path}/descriptions`, {params: SearchHttpParams.build(params)}).pipe(map(r => r as SnomedSearchResult<SnomedDescription>));
  }

  public findDescriptions(params: SnomedDescriptionItemSearchParams): Observable<SnomedDescriptionItemSearchResult> {
    return this.http.get(`${this.baseUrl}/descriptions`, {params: SearchHttpParams.build(params)}).pipe(map(r => r as SnomedDescriptionItemSearchResult));
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
