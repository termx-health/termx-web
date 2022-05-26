import {Component, Input, OnInit} from '@angular/core';
import {Concept, ConceptSearchParams} from 'terminology-lib/resources';
import {ConceptService} from '../../../concept/services/concept.service';
import {BehaviorSubject, debounceTime, distinctUntilChanged, finalize, Observable, switchMap} from 'rxjs';
import {copyDeep, SearchResult} from '@kodality-web/core-util';

@Component({
  selector: 'twa-code-system-concept-list',
  templateUrl: './code-system-concept-list.component.html',
})
export class CodeSystemConceptListComponent implements OnInit {
  @Input() public codeSystemId?: string;

  public query = new ConceptSearchParams();
  public searchResult = new SearchResult<Concept>();
  public searchInput: string = "";
  public concepts: Concept[] = [];
  public loading = false;
  public searchUpdate = new BehaviorSubject<string>("");

  public constructor(private conceptService: ConceptService) { }

  public ngOnInit(): void {
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(() => this.search()),
    ).subscribe(data => this.searchResult = data);
  }

  public search(): Observable<SearchResult<Concept>> {
    const q = copyDeep(this.query);
    q.codeSystem = this.codeSystemId;
    q.codeContains = this.searchInput || undefined;
    this.loading = true;
    return this.conceptService.search(q).pipe(finalize(() => this.loading = false));
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

}
