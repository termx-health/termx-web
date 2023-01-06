import {Component, Input, OnInit} from '@angular/core';
import {ComponentStateStore, copyDeep, DestroyService, QueryParams, SearchResult} from '@kodality-web/core-util';
import {CodeSystem, CodeSystemSearchParams} from 'terminology-lib/resources';
import {CodeSystemService} from '../../services/code-system.service';
import {TranslateService} from '@ngx-translate/core';
import {debounceTime, distinctUntilChanged, finalize, Observable, Subject, switchMap, tap} from 'rxjs';

@Component({
  selector: 'twa-code-system-list',
  templateUrl: 'code-system-list.component.html',
  providers: [DestroyService]
})
export class CodeSystemListComponent implements OnInit {
  @Input() public dev: boolean = false;
  protected readonly STORE_KEY = 'code-system-list';

  public query = new CodeSystemSearchParams();
  public searchInput?: string;
  public searchUpdate = new Subject<string>();
  public searchResult: SearchResult<CodeSystem> = SearchResult.empty();
  public loading = false;

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
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      tap(() => this.query.offset = 0),
      switchMap(() => this.search()),
    ).subscribe(data => this.searchResult = data);
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

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  public parseDomain(uri: string): string {
    return uri?.split('//')[1]?.split('/')[0];
  }

  public deleteCodeSystem(codeSystemId: string): void {
    this.loading = true;
    this.codeSystemService.delete(codeSystemId).subscribe(() => this.loadData()).add(() => this.loading = false);
  }
}
