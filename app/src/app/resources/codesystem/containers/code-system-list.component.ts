import {Component, OnInit} from '@angular/core';
import {copyDeep, SearchResult} from '@kodality-web/core-util';
import {CodeSystem, CodeSystemSearchParams, CodeSystemVersion} from 'terminology-lib/resources';
import {CodeSystemService} from '../services/code-system.service';
import {TranslateService} from '@ngx-translate/core';


@Component({
  templateUrl: 'code-system-list.component.html'
})
export class CodeSystemListComponent implements OnInit {
  public searchResult = new SearchResult<CodeSystem>();
  public query = new CodeSystemSearchParams();
  public loading: boolean = false;

  public constructor(
    private codeSystemService: CodeSystemService,
    private translateService: TranslateService
  ) {}

  public ngOnInit(): void {
    this.loadData();
  }

  public loadData(): void {
    const q = copyDeep(this.query);
    q.versionsDecorated = true;

    this.loading = true;
    this.codeSystemService.search(q)
      .subscribe(r => this.searchResult = r)
      .add(() => this.loading = false);
  }

  public getVersionTranslateTokens = (version: CodeSystemVersion, translateOptions: object): string[] => {
    const tokens = [
      version.releaseDate ? 'web.code-system.list.versions-release-date' : '',
      version.expirationDate ? 'web.code-system.list.versions-expiration-date' : '',
      version.version ? 'web.code-system.list.versions-version' : ''
    ];
    return tokens.filter(Boolean).map(t => this.translateService.instant(t, translateOptions));
  };

  public parseDomain(uri: string): string {
    return uri?.split('//')[1]?.split('/')[0];
  }
}
