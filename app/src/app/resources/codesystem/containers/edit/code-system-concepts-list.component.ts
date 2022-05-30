import {Component, Input, OnInit} from '@angular/core';
import {CodeSystemConcept, ConceptSearchParams} from 'terminology-lib/resources';
import {BehaviorSubject, debounceTime, distinctUntilChanged, finalize, Observable, switchMap} from 'rxjs';
import {copyDeep, SearchResult} from '@kodality-web/core-util';
import {CodeSystemService} from '../../services/code-system.service';

@Component({
  selector: 'twa-code-system-concepts-list',
  templateUrl: './code-system-concepts-list.component.html',
})
export class CodeSystemConceptsListComponent implements OnInit {
  @Input() public codeSystemId?: string;

  public query = new ConceptSearchParams();
  public searchResult = new SearchResult<CodeSystemConcept>();
  public searchInput: string = "";
  public concepts: CodeSystemConcept[] = [];
  public loading = false;
  public searchUpdate = new BehaviorSubject<string>("");

  public constructor(private codeSystemService: CodeSystemService) { }

  public ngOnInit(): void {
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(() => this.search()),
    ).subscribe(data => this.searchResult = data);
  }

  public search(): Observable<SearchResult<CodeSystemConcept>> {
    const q = copyDeep(this.query);
    q.codeSystem = this.codeSystemId;
    q.codeContains = this.searchInput || undefined;
    this.loading = true;
    return this.codeSystemService.searchConcepts(this.codeSystemId!, q).pipe(finalize(() => this.loading = false));
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

}
