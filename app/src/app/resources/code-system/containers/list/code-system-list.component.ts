import {Component, Input, OnInit} from '@angular/core';
import {ComponentStateStore, copyDeep, DestroyService, QueryParams, SearchResult} from '@kodality-web/core-util';
import {CodeSystem, CodeSystemSearchParams, CodeSystemVersion} from 'term-web/resources/_lib';
import {CodeSystemService} from '../../services/code-system.service';
import {TranslateService} from '@ngx-translate/core';
import {finalize, Observable, tap} from 'rxjs';
import {environment} from 'environments/environment';

@Component({
  templateUrl: 'code-system-list.component.html',
  providers: [DestroyService]
})
export class CodeSystemListComponent implements OnInit {
  protected readonly STORE_KEY = 'code-system-list';

  public query = new CodeSystemSearchParams();
  public searchResult: SearchResult<CodeSystem> = SearchResult.empty();
  public searchInput: string;
  public loading: boolean;

  public constructor(
    private codeSystemService: CodeSystemService,
    private translateService: TranslateService,
    private stateStore: ComponentStateStore,
  ) {}

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state) {
      this.query = Object.assign(new QueryParams(), state.query);
      this.searchInput = this.query.textContains;
    }

    this.loadData();
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  private search(): Observable<SearchResult<CodeSystem>> {
    const q = copyDeep(this.query);
    q.lang = this.translateService.currentLang;
    q.versionsDecorated = true;
    q.textContains = this.searchInput;
    this.stateStore.put(this.STORE_KEY, {query: q});

    this.loading = true;
    return this.codeSystemService.search(q).pipe(finalize(() => this.loading = false));
  }

  public onSearch = (): Observable<SearchResult<CodeSystem>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };

  public deleteCodeSystem(codeSystemId: string): void {
    this.loading = true;
    this.codeSystemService.deleteCodeSystem(codeSystemId).subscribe(() => this.loadData()).add(() => this.loading = false);
  }

  public openFhir(id: string): void {
    window.open(environment.termxApi + '/fhir/CodeSystem/' + id, '_blank');
  }

  protected findLastVersion = (versions: CodeSystemVersion[]): CodeSystemVersion => {
    return  versions?.filter(v => ['draft', 'active'].includes(v.status!))
      .sort((a, b) => new Date(a.created!) > new Date(b.created!) ? -1 : new Date(a.created!) > new Date(b.created!) ? 1 : 0)?.[0];
  };
}
