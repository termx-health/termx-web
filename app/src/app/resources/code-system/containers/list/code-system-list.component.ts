import {Component, OnInit} from '@angular/core';
import {ComponentStateStore, copyDeep, DestroyService, QueryParams, SearchResult, sortFn} from '@kodality-web/core-util';
import {CodeSystem, CodeSystemSearchParams, CodeSystemVersion} from 'term-web/resources/_lib';
import {CodeSystemService} from '../../services/code-system.service';
import {TranslateService} from '@ngx-translate/core';
import {finalize, Observable, tap} from 'rxjs';

@Component({
  templateUrl: 'code-system-list.component.html',
  providers: [DestroyService]
})
export class CodeSystemListComponent implements OnInit {
  protected readonly STORE_KEY = 'code-system-list';

  // quick search
  public searchInput: string;
  // backend table
  public query = new CodeSystemSearchParams();
  public searchResult: SearchResult<CodeSystem> = SearchResult.empty();
  // filter
  protected filter: {
    open: boolean,
    publisher?: string,
    status?: string,
  } = {open: false};


  public loading: boolean;

  public constructor(
    private codeSystemService: CodeSystemService,
    private translateService: TranslateService,
    private stateStore: ComponentStateStore,
  ) {}

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state) {
      this.searchInput = this.query.textContains;
      this.query = Object.assign(new QueryParams(), state.query);
      this.filter = state.filter;
    }

    this.loadData();
  }


  // searches


  protected loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  protected onDebounced = (): Observable<SearchResult<CodeSystem>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };

  protected onFilterSearch(): void {
    this.query.offset = 0;
    this.loadData();
  }

  protected onFilterReset(): void {
    this.filter = {open: this.filter.open};
  }

  private search(): Observable<SearchResult<CodeSystem>> {
    const q = copyDeep(this.query);
    q.lang = this.translateService.currentLang;
    q.textContains = this.searchInput;
    q.versionsDecorated = true;
    q.publisher = this.filter.publisher;
    q.versionStatus = this.filter.status;
    this.stateStore.put(this.STORE_KEY, {query: q, filter: this.filter});

    this.loading = true;
    return this.codeSystemService.search(q).pipe(finalize(() => this.loading = false));
  }


  // misc


  public deleteCodeSystem(codeSystemId: string): void {
    this.loading = true;
    this.codeSystemService.deleteCodeSystem(codeSystemId).subscribe(() => this.loadData()).add(() => this.loading = false);
  }

  public openFhir(id: string): void {
    window.open(window.location.origin + '/fhir/CodeSystem/' + id, '_blank');
  }

  protected findLastVersion = (versions: CodeSystemVersion[]): CodeSystemVersion => {
    return versions
      ?.filter(v => ['draft', 'active'].includes(v.status))
      .map(v => ({...v, created: v.created ? new Date(v.created) : undefined}))
      .sort(sortFn('created', false))?.[0];
  };
}
