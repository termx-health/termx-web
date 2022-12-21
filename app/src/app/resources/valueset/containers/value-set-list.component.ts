import {Component, OnInit} from '@angular/core';
import {ValueSetService} from '../services/value-set.service';
import {ComponentStateStore, copyDeep, QueryParams, SearchResult} from '@kodality-web/core-util';
import {CodeSystemVersion, ValueSet, ValueSetSearchParams} from 'terminology-lib/resources';
import {TranslateService} from '@ngx-translate/core';
import {debounceTime, distinctUntilChanged, finalize, Observable, Subject, switchMap, tap} from 'rxjs';


@Component({
  selector: 'twa-value-set-list',
  templateUrl: 'value-set-list.component.html',
})
export class ValueSetListComponent implements OnInit {
  protected readonly STORE_KEY = 'value-set-list';

  public searchResult: SearchResult<ValueSet> = SearchResult.empty();
  public query = new ValueSetSearchParams();
  public loading = false;
  public searchInput?: string;
  public searchUpdate = new Subject<string>();

  public constructor(
    private valueSetService: ValueSetService,
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

  public search(): Observable<SearchResult<ValueSet>> {
    const q = copyDeep(this.query);
    q.lang = this.translateService.currentLang;
    q.decorated = true;
    q.textContains = this.searchInput || undefined;
    this.stateStore.put(this.STORE_KEY, {query: q});

    this.loading = true;
    return this.valueSetService.search(q).pipe(finalize(() => this.loading = false));
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  public getVersionTranslateTokens = (version: CodeSystemVersion, translateOptions: object): string[] => {
    const tokens = [
      version.releaseDate ? 'web.value-set.list.versions-release-date' : '',
      version.expirationDate ? 'web.value-set.list.versions-expiration-date' : '',
      version.version ? 'web.value-set.list.versions-version' : ''
    ];
    return tokens.filter(Boolean).map(t => this.translateService.instant(t, translateOptions));
  };

  public parseDomain(uri: string): string {
    return uri?.split('//')[1]?.split('/')[0];
  }

  public deleteValueSet(valueSetId: string): void {
    this.valueSetService.delete(valueSetId).subscribe(() => this.loadData());
  }
}
