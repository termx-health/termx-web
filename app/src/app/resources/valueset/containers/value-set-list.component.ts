import {Component, OnInit} from '@angular/core';
import {ValueSetService} from '../services/value-set.service';
import {copyDeep, SearchResult} from '@kodality-web/core-util';
import {CodeSystemVersion, ValueSet, ValueSetSearchParams} from 'terminology-lib/resources';
import {TranslateService} from '@ngx-translate/core';


@Component({
  templateUrl: 'value-set-list.component.html',
})
export class ValueSetListComponent implements OnInit {
  public searchResult = new SearchResult<ValueSet>();
  public query = new ValueSetSearchParams();
  public loading = false;

  public constructor(
    private valueSetService: ValueSetService,
    private translateService: TranslateService
  ) {}

  public ngOnInit(): void {
    this.loadData();
  }

  public loadData(): void {
    const q = copyDeep(this.query);
    q.decorated = true;

    this.loading = true;
    this.valueSetService.search(q)
      .subscribe(r => this.searchResult = r)
      .add(() => this.loading = false);
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