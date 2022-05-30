import {Component, Input, OnInit} from '@angular/core';
import {CodeSystemConcept, ConceptSearchParams} from 'terminology-lib/resources';
import {debounceTime, distinctUntilChanged, finalize, Observable, Subject, switchMap} from 'rxjs';
import {copyDeep, SearchResult} from '@kodality-web/core-util';
import {CodeSystemService} from '../../services/code-system.service';

@Component({
  selector: 'twa-code-system-concepts-list',
  templateUrl: './code-system-concepts-list.component.html',
})
export class CodeSystemConceptsListComponent implements OnInit {
  @Input() public codeSystemId?: string;

  public searchResult = new SearchResult<CodeSystemConcept>();
  public query = new ConceptSearchParams();
  public loading = false;

  public searchInput: string = "";
  public searchUpdate = new Subject<string>();

  public constructor(private codeSystemService: CodeSystemService) { }

  public ngOnInit(): void {
    this.loadData();
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(() => this.search()),
    ).subscribe(data => this.searchResult = data);
  }

  private search(): Observable<SearchResult<CodeSystemConcept>> {
    const q = copyDeep(this.query);
    q.codeSystem = this.codeSystemId;
    q.codeContains = this.searchInput;
    this.loading = true;
    return this.codeSystemService.searchConcepts(this.codeSystemId!, q).pipe(finalize(() => this.loading = false));
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }
}
