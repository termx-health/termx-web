import {Component, Input, OnInit} from '@angular/core';
import {CodeSystemConcept, ConceptSearchParams} from 'terminology-lib/resources';
import {debounceTime, distinctUntilChanged, finalize, Observable, of, Subject, switchMap} from 'rxjs';
import {BooleanInput, copyDeep, SearchResult} from '@kodality-web/core-util';
import {CodeSystemService} from '../../../services/code-system.service';

@Component({
  selector: 'twa-code-system-concepts-list',
  templateUrl: './code-system-concepts-list.component.html',
})
export class CodeSystemConceptsListComponent implements OnInit {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public codeSystemId?: string;

  public query = new ConceptSearchParams();
  public searchInput: string = "";
  public searchUpdate = new Subject<string>();
  public searchResult: SearchResult<CodeSystemConcept> = SearchResult.empty();

  public loading = false;

  public constructor(
    private codeSystemService: CodeSystemService
  ) {}

  public ngOnInit(): void {
    this.loadData();
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(() => this.search()),
    ).subscribe(data => this.searchResult = data);
  }

  private search(): Observable<SearchResult<CodeSystemConcept>> {
    if (!this.codeSystemId) {
      return of(this.searchResult);
    }
    const q = copyDeep(this.query);
    q.codeContains = this.searchInput;
    this.loading = true;
    return this.codeSystemService.searchConcepts(this.codeSystemId, q).pipe(finalize(() => this.loading = false));
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }
}
