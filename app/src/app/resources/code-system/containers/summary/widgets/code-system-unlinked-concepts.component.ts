import {Component, Input, OnInit} from '@angular/core';
import {CodeSystemService} from 'term-web/resources/code-system/services/code-system.service';
import {CodeSystemEntityVersion, CodeSystemEntityVersionSearchParams, CodeSystemVersion} from 'term-web/resources/_lib';
import {BooleanInput, copyDeep, LoadingManager, SearchResult} from '@kodality-web/core-util';
import {debounceTime, distinctUntilChanged, Observable, Subject, switchMap} from 'rxjs';
import {Router} from '@angular/router';

@Component({
  selector: 'tw-code-system-unlinked-concepts',
  templateUrl: 'code-system-unlinked-concepts.component.html'
})
export class CodeSystemUnlinkedConceptsComponent implements OnInit {
  @Input() public codeSystem: string;
  @Input() public versions: CodeSystemVersion[];
  @Input() @BooleanInput() public viewMode: boolean | string = false;

  public query = new CodeSystemEntityVersionSearchParams();
  protected searchInput?: string;
  protected searchUpdate = new Subject<string>();
  protected searchResult: SearchResult<CodeSystemEntityVersion> = SearchResult.empty();

  protected loader = new LoadingManager();

  public constructor(private codeSystemService: CodeSystemService, private router: Router) {}

  public ngOnInit(): void {
    this.loadUnlinkedConcepts();
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(() => this.search()),
    ).subscribe(data => this.searchResult = data);
  }

  public loadUnlinkedConcepts(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  private search(): Observable<SearchResult<CodeSystemEntityVersion>> {
    const q = copyDeep(this.query);
    q.codeSystem = this.codeSystem;
    q.textContains = this.searchInput || undefined;
    q.unlinked = true;
    return this.loader.wrap('load', this.codeSystemService.searchEntityVersions(this.codeSystem, q));
  }

  protected link(codeSystemVersion: string, entityVersionId): void {
    this.loader.wrap('link',this.codeSystemService.linkEntityVersions(this.codeSystem, codeSystemVersion, [entityVersionId]))
      .subscribe(() => this.loadUnlinkedConcepts());
  }

  public checked = (): number[] => {
    return this.searchResult.data?.filter(c => c['checked']).map(c => c.id);
  };

  protected filterDraftVersions = (v: CodeSystemVersion): boolean => {
    return v.status === 'draft';
  };

  public openConcept(code: string): void {
    const mode = this.viewMode ? '/view' : '/edit';
    const path = `/resources/code-systems/${this.codeSystem}/concepts/${code}${mode}`;
    this.router.navigate([path]);
  }
}
