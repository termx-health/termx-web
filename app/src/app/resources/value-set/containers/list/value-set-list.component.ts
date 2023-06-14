import {Component, OnInit} from '@angular/core';
import {ValueSetService} from '../../services/value-set.service';
import {ComponentStateStore, copyDeep, QueryParams, SearchResult} from '@kodality-web/core-util';
import {TranslateService} from '@ngx-translate/core';
import {finalize, Observable, tap} from 'rxjs';
import {environment} from 'app/src/environments/environment';
import {CodeSystemVersion, ValueSet, ValueSetSearchParams, ValueSetVersion} from 'app/src/app/resources/_lib';


@Component({
  selector: 'tw-value-set-list',
  templateUrl: 'value-set-list.component.html',
})
export class ValueSetListComponent implements OnInit {
  protected readonly STORE_KEY = 'value-set-list';

  public query = new ValueSetSearchParams();
  public searchResult: SearchResult<ValueSet> = SearchResult.empty();
  public searchInput: string;
  public loading: boolean;

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
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
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

  public onSearch = (): Observable<SearchResult<ValueSet>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };

  public getVersionTranslateTokens = (version: CodeSystemVersion, translateOptions: object): string[] => {
    const tokens = [
      version.releaseDate ? 'web.value-set.list.versions-release-date' : '',
      version.expirationDate ? 'web.value-set.list.versions-expiration-date' : '',
      version.version ? 'web.value-set.list.versions-version' : ''
    ];
    return tokens.filter(Boolean).map(t => this.translateService.instant(t, translateOptions));
  };

  protected findLastVersion = (versions: ValueSetVersion[]): ValueSetVersion => {
    return  versions?.filter(v => ['draft', 'active'].includes(v.status!))
      .sort((a, b) => new Date(a.created!) > new Date(b.created!) ? -1 : new Date(a.created!) > new Date(b.created!) ? 1 : 0)?.[0];
  };

  public deleteValueSet(valueSetId: string): void {
    this.valueSetService.delete(valueSetId).subscribe(() => this.loadData());
  }

  public openFhir(id: string): void {
    window.open(environment.terminologyApi + '/fhir/ValueSet/' + id, '_blank');
  }
}
