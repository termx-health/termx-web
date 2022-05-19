import {Component, Input, OnInit} from '@angular/core';
import {copyDeep, SearchResult} from '@kodality-web/core-util';
import {CodeSystem, CodeSystemSearchParams, CodeSystemVersion} from 'terminology-lib/resources';
import {CodeSystemService} from '../services/code-system.service';
import {TranslateService} from '@ngx-translate/core';
import {BehaviorSubject, debounceTime, distinctUntilChanged, finalize, Observable, switchMap} from 'rxjs';


@Component({
  selector: 'twa-code-system-list',
  templateUrl: 'code-system-list.component.html'
})
export class CodeSystemListComponent implements OnInit {
  @Input() public placeholder: string = 'marina.ui.inputs.search.placeholder';

  public searchResult = new SearchResult<CodeSystem>();
  public query = new CodeSystemSearchParams();
  public loading: boolean = false;
  public searchInput: string = "";


  public searchUpdate = new BehaviorSubject<string>("");

  public constructor(
    private codeSystemService: CodeSystemService,
    private translateService: TranslateService
  ) {}

  public ngOnInit(): void {
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(() => this.search()),
    ).subscribe(data => this.searchResult = data);
  }

  public search(): Observable<SearchResult<CodeSystem>> {
    const q = copyDeep(this.query);
    q.versionsDecorated = true;
    if (this.searchInput){
      q.textContains = this.searchInput;
    }
    this.loading = true;
    return this.codeSystemService.search(q).pipe(
      finalize(() => this.loading = false)
    );
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
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
