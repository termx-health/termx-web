import {Component, OnInit, ViewChild} from '@angular/core';
import {ComponentStateStore, copyDeep, DestroyService, LoadingManager, QueryParams, SearchResult, validateForm} from '@kodality-web/core-util';
import {ObservationDefinitionService} from '../services/observation-definition.service';
import {ObservationDefinition, ObservationDefinitionImportRequest, ObservationDefinitionSearchParams} from 'app/src/app/observation-definition/_lib';
import {filter, merge, Observable, Subject, switchMap, takeUntil, tap, timer} from 'rxjs';
import {NgForm} from '@angular/forms';
import {JobLibService, JobLog} from 'term-web/job/_lib';
import {MuiNotificationService} from '@kodality-web/marina-ui';

@Component({
  templateUrl: 'observation-definition-list.component.html',
  providers: [DestroyService]
})
export class ObservationDefinitionListComponent implements OnInit {
  private readonly STORE_KEY = 'observation-definition-list';

  protected query = new ObservationDefinitionSearchParams();
  protected searchResult = SearchResult.empty<ObservationDefinition>();
  protected searchInput: string;
  protected loader = new LoadingManager();

  protected isFilterOpen = false;
  protected filter: {[key: string]: any} = {};

  @ViewChild("form") public form?: NgForm;

  protected jobResponse: JobLog;
  protected importData: {
    visible?: boolean,
    loincCodes?: string[]
  } = {visible: false};

  public constructor(
    private observationDefinitionService: ObservationDefinitionService,
    private stateStore: ComponentStateStore,
    private jobService: JobLibService,
    private notificationService: MuiNotificationService,
    private destroy$: DestroyService,
  ) { }

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state) {
      this.query = Object.assign(new QueryParams(), state.query);
      this.searchInput = this.query.textContains;
    }

    this.loadData();
  }

  protected loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  protected search(): Observable<SearchResult<ObservationDefinition>> {
    const q = copyDeep(this.query);
    q.categories = this.filter['categories']?.map(c => c.codeSystem + '|' + c.code).join(',');
    q.structures = this.filter['structure']?.join(',');
    q.types = this.filter['value-type']?.join(',');
    q.textContains = this.searchInput || undefined;
    q.decorated = true;
    this.stateStore.put(this.STORE_KEY, {query: q});

    return this.loader.wrap('load', this.observationDefinitionService.search(q));
  }

  protected onSearch = (): Observable<SearchResult<ObservationDefinition>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };

  protected startImport(): void {
    if (!validateForm(this.form)) {
      return;
    }

    const request: ObservationDefinitionImportRequest = {loincCodes: this.importData.loincCodes};
    this.loader.wrap('import', this.observationDefinitionService.import(request)).subscribe( resp => {
      this.importData = {};
      this.pollJobStatus(resp.jobId);
    });
  }

  private pollJobStatus(jobId: number): void {
    const stopPolling$ = new Subject<void>();
    timer(0, 3000).pipe(
      takeUntil(merge(this.destroy$, stopPolling$)),
      switchMap(() => this.loader.wrap('import', this.jobService.getLog(jobId))),
      filter(resp => resp.execution?.status !== 'running')
    ).subscribe(jobResp => {
      stopPolling$.next();
      if (!jobResp.errors && !jobResp.warnings) {
        this.notificationService.success("web.observation-definition.import-success-message", '', {duration: 0, closable: true});
      }
      this.jobResponse = jobResp;
      this.loadData();
    });
  }

  protected reset(): void {
    this.filter = {};
  }
}
