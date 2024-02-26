import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {SearchHttpParams} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {saveAs} from 'file-saver';
import {merge, Observable, Subject, switchMap, take, takeUntil, timer} from 'rxjs';
import {map} from 'rxjs/operators';
import {SnomedAuthoringStatsItem, SnomedBranch, SnomedCodeSystem} from 'term-web/integration/_lib';
import {LorqueProcess} from 'term-web/sys/_lib';
import {SnomedConcept} from '../model/concept/snomed-concept';
import {SnomedConceptSearchParams} from '../model/concept/snomed-concept-search-params';
import {SnomedDescriptionItemSearchParams} from '../model/description/snomed-description-item-search-params';
import {SnomedDescriptionItemSearchResult} from '../model/description/snomed-description-item-search-result';
import {SnomedRefsetMemberSearchResult} from '../model/refset/snomed-refset-member-search-result';
import {SnomedRefsetSearchParams} from '../model/refset/snomed-refset-search-params';
import {SnomedRefsetSearchResult} from '../model/refset/snomed-refset-search-result';
import {SnomedSearchResult} from '../model/snomed-search-result';

@Injectable()
export class SnomedLibService {
  protected baseUrl = `${environment.termxApi}/snomed`;

  public constructor(protected http: HttpClient) { }

  public loadCodeSystems(): Observable<SnomedCodeSystem[]> {
    return this.http.get(`${this.baseUrl}/codesystems`).pipe(map(c => c as SnomedCodeSystem[]));
  }

  public loadCodeSystem(shortName: string): Observable<SnomedCodeSystem> {
    return this.http.get(`${this.baseUrl}/codesystems/${shortName}`).pipe(map(c => c as SnomedCodeSystem));
  }

  public loadBranches(): Observable<SnomedBranch[]> {
    return this.http.get(`${this.baseUrl}/branches`).pipe(map(c => c as SnomedBranch[]));
  }

  public loadBranch(path: string): Observable<SnomedBranch> {
    path = path.split('/').join('--');
    return this.http.get(`${this.baseUrl}/branches/${path}`).pipe(map(c => c as SnomedBranch));
  }

  public loadBranchChangedFsn(path: string): Observable<SnomedAuthoringStatsItem[]> {
    path = path.split('/').join('--');
    return this.http.get(`${this.baseUrl}/${path}/authoring-stats/changed-fully-specified-names`).pipe(map(c => c as SnomedAuthoringStatsItem[]));
  }

  public loadBranchNewDescriptions(path: string): Observable<SnomedAuthoringStatsItem[]> {
    path = path.split('/').join('--');
    return this.http.get(`${this.baseUrl}/${path}/authoring-stats/new-descriptions`).pipe(map(c => c as SnomedAuthoringStatsItem[]));
  }

  public loadBranchNewSynonyms(path: string): Observable<SnomedAuthoringStatsItem[]> {
    path = path.split('/').join('--');
    return this.http.get(`${this.baseUrl}/${path}/authoring-stats/new-synonyms-on-existing-concepts`).pipe(map(c => c as SnomedAuthoringStatsItem[]));
  }

  public loadBranchInactivatedSynonyms(path: string): Observable<SnomedAuthoringStatsItem[]> {
    path = path.split('/').join('--');
    return this.http.get(`${this.baseUrl}/${path}/authoring-stats/inactivated-synonyms`).pipe(map(c => c as SnomedAuthoringStatsItem[]));
  }

  public loadBranchReactivatedSynonyms(path: string): Observable<SnomedAuthoringStatsItem[]> {
    path = path.split('/').join('--');
    return this.http.get(`${this.baseUrl}/${path}/authoring-stats/reactivated-synonyms`).pipe(map(c => c as SnomedAuthoringStatsItem[]));
  }

  public startRF2FileDownload(jobId: string): Observable<LorqueProcess> {
    return this.http.get(`${this.baseUrl}/exports/${jobId}/archive`).pipe(map(res => res as LorqueProcess));
  }

  public getRF2File(processId: number): void {
    this.http.get(`${this.baseUrl}/exports/archive/result/${processId}`, {
      responseType: 'blob',
      headers: new HttpHeaders({Accept: 'application/zip'})
    }).subscribe(res => saveAs(res, `SnomedCT_Export.zip`));
  }


  public pollImportJob = (jobId: string, destroy$: Observable<any> = timer(60_000)): Observable<any> => {
    const pollComplete$ = new Subject();
    timer(0, 3000).pipe(
      switchMap(() => this.loadImportJob(jobId)),
      takeUntil(merge(pollComplete$, destroy$))
    ).subscribe(resp => {
      if (!['WAITING_FOR_FILE', 'RUNNING'].includes(resp?.status)) {
        pollComplete$.next(resp);
      }
    });
    return pollComplete$.pipe(take(1));
  };

  public loadImportJob(jobId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/imports/${jobId}`);
  }

  public loadConcept(conceptId: string, branch?: string): Observable<SnomedConcept> {
    return this.http.get(`${this.baseUrl}/concepts/${conceptId}`, {params: SearchHttpParams.build({branch: branch})})
      .pipe(map(c => c as SnomedConcept));
  }

  public findConcepts(params: SnomedConceptSearchParams): Observable<SnomedSearchResult<SnomedConcept>> {
    return this.http.get(`${this.baseUrl}/concepts`, {params: SearchHttpParams.build(params)}).pipe(map(r => r as SnomedSearchResult<SnomedConcept>));
  }

  public startConceptCsvExport(params: SnomedConceptSearchParams): Observable<LorqueProcess> {
    return this.http.post(`${this.baseUrl}/concepts/export-csv`, params).pipe(map(res => res as LorqueProcess));
  }

  public getConceptCsv(processId: number): void {
    this.http.get(`${this.baseUrl}/concepts/export-csv/result/${processId}`, {
      responseType: 'blob',
      headers: new HttpHeaders({Accept: 'application/csv'})
    }).subscribe(res => saveAs(res, `snomed-concepts.csv`));
  }

  public findConceptChildren(conceptId: string, branch?: string): Observable<Array<SnomedConcept>> {
    return this.http.get(`${this.baseUrl}/concepts/${conceptId}/children`, {params: SearchHttpParams.build({branch: branch})})
      .pipe(map(r => r as Array<SnomedConcept>));
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

  public loadRefsets(conceptId: string, branch?: string): Observable<SnomedConcept[]> {
    return this.findRefsets({referencedComponentId: conceptId, branch: branch}).pipe(map(resp => {
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
