import {Component, OnInit} from '@angular/core';
import {copyDeep, SearchResult} from '@kodality-web/core-util';
import {CodeSystem, CodeSystemSearchParams} from 'terminology-lib/codesystem';
import {CodeSystemService} from '../services/code-system.service';
import {CodeSystemVersion} from 'terminology-lib/codesystem/services/code-system-version';
import {TranslateService} from '@ngx-translate/core';

@Component({
  templateUrl: './code-system-list.component.html'
})

export class CodeSystemListComponent implements OnInit {
  public searchResult: SearchResult<CodeSystem> = new SearchResult<CodeSystem>();
  public query: CodeSystemSearchParams = new CodeSystemSearchParams();
  public loading?: boolean;

  public constructor(private codeSystemService: CodeSystemService, private translateService: TranslateService) {}

  public ngOnInit(): void {
    this.loadData();
  }

  public parseDomain(uri: string): string {
    return uri?.split('//')[1]?.split('/')[0];
  }

  public getVersionTranslateTokens = (version: CodeSystemVersion, translateOptions: object): string[] => {
    const tokens = [
      version.releaseDate ? 'web.code-system.list.versions-release-date' : '',
      version.expirationDate ? 'web.code-system.list.versions-expiration-date' : '',
      version.version ? 'web.code-system.list.versions-version' : ''
    ];
    return tokens.filter(Boolean).map(t => this.translateService.instant(t, translateOptions));
  };

  public loadData(): void {
    this.loading = true;
    const q = copyDeep(this.query);
    q.versionsDecorated = true;
    this.codeSystemService.search(q).subscribe(r => {
      this.searchResult = r;
    }).add(() => this.loading = false);
  }

}
