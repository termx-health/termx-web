import {Component, OnInit} from '@angular/core';
import {ValueSetService} from '../services/value-set.service';
import {copyDeep, SearchResult} from '@kodality-web/core-util';
import {CodeSystemVersion, ValueSet, ValueSetSearchParams} from 'terminology-lib/resources';
import {TranslateService} from '@ngx-translate/core';
import {BehaviorSubject, debounceTime, distinctUntilChanged, finalize, Observable, switchMap} from 'rxjs';


@Component({
  selector: 'twa-value-set-list',
  templateUrl: 'value-set-list.component.html',
})
export class ValueSetListComponent implements OnInit {
  public searchResult = new SearchResult<ValueSet>();
  public query = new ValueSetSearchParams();
  public loading = false;
  public searchInput: string = "";
  public searchUpdate = new BehaviorSubject<string>("");

  public constructor(
    private valueSetService: ValueSetService,
    private translateService: TranslateService
  ) {}

  public ngOnInit(): void {
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(() => this.search()),
    ).subscribe(data => this.searchResult = data);
  }

  public search(): Observable<SearchResult<ValueSet>> {
    const q = copyDeep(this.query);
    q.decorated = true;
    q.textContains = this.searchInput || undefined;
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
}
