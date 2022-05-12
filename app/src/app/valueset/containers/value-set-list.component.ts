import {Component, OnInit} from '@angular/core';
import {ValueSetService} from '../services/value-set.service';
import {copyDeep, SearchResult} from '@kodality-web/core-util';
import {ValueSet} from 'terminology-lib/valueset/services/value-set';
import {ValueSetSearchParams} from 'terminology-lib/valueset/services/value-set-search-params';
import {CodeSystemVersion} from 'terminology-lib/codesystem/services/code-system-version';
import {TranslateService} from '@ngx-translate/core';


@Component({
  templateUrl: './value-set-list.component.html',
})
export class ValueSetListComponent implements OnInit {
  public searchResult: SearchResult<ValueSet> = new SearchResult<ValueSet>();
  public query: ValueSetSearchParams = new ValueSetSearchParams();
  public loading?: boolean;

  public constructor(
    private valueSetService: ValueSetService,
    private translateService: TranslateService
  ) {}

  public ngOnInit(): void {
    this.loadData();
  }

  public parseDomain(uri: string): string {
    return uri?.split('//')[1]?.split('/')[0];
  }

  public getVersionTranslateTokens = (version: CodeSystemVersion, translateOptions: object): string[] => {
    const tokens = [
      version.releaseDate ? 'web.value-set.list.versions-release-date' : '',
      version.expirationDate ? 'web.value-set.list.versions-expiration-date' : '',
      version.version ? 'web.value-set.list.versions-version' : ''
    ];
    return tokens.filter(Boolean).map(t => this.translateService.instant(t, translateOptions));
  };

  public loadData(): void {
    this.loading = true;
    const q = copyDeep(this.query);
    q.decorated = true;
    this.valueSetService.search(q)
      .subscribe(r => this.searchResult = r)
      .add(() => this.loading = false);
  }
}
