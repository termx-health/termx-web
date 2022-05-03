import {Component, OnInit} from '@angular/core';
import {SearchResult} from '@kodality-web/core-util';
import {CodeSystem, CodeSystemSearchParams} from 'terminology-lib/codesystem';
import {CodeSystemService} from '../services/code-system.service';
import {CodeSystemVersion} from 'terminology-lib/codesystem/services/code-system-version';
import {TranslateService} from '@ngx-translate/core';

@Component({
  templateUrl: './code-system-list.component.html'
})

export class CodeSystemListComponent implements OnInit {
  public searchResult?: SearchResult<CodeSystem & {expand?: boolean}> = new SearchResult<CodeSystem & {expand?: boolean}>();
  public query: CodeSystemSearchParams = new CodeSystemSearchParams();
  public loading?: boolean;

  public onExpandChange(cs: (CodeSystem & {expand?: boolean}), checked: boolean): void {
    cs.expand = checked;
    console.log("hello, ", cs, checked);
  }

  public constructor(private codeSystemService: CodeSystemService, private translateService: TranslateService) {}

  public ngOnInit(): void {
    this.loadData();
  }

  public parseDomain(uri: string): string {
    return new URL(uri).host;
  }

  public getVersionTranslateTokens = (version: CodeSystemVersion, translateOptions: object): string[] => {
    const tokens = [];
    if (version.releaseDate) {
      tokens.push('web.code-system.list.versions-release-date');
    }
    if (version.expirationDate) {
      tokens.push('web.code-system.list.versions-expiration-date');
    }
    if (version.version) {
      tokens.push('web.code-system.list.versions-version');
    }
    return tokens.map(t => this.translateService.instant(t, translateOptions));
  };

  public loadData(): void {
    this.loading = true;
    this.query.decorated = true;
    this.codeSystemService.search(this.query).subscribe(r => {
      console.log(r);
      return this.searchResult = r;
    }).add(() => this.loading = false);
  }

}
