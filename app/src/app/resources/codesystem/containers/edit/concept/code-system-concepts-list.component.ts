import {Component, Input, OnInit} from '@angular/core';
import {CodeSystemConcept, CodeSystemVersion, ConceptSearchParams, EntityProperty} from 'terminology-lib/resources';
import {debounceTime, finalize, Observable, of, Subject, switchMap} from 'rxjs';
import {BooleanInput, copyDeep, SearchResult} from '@kodality-web/core-util';
import {CodeSystemService} from '../../../services/code-system.service';

@Component({
  selector: 'twa-code-system-concepts-list',
  templateUrl: './code-system-concepts-list.component.html',
})
export class CodeSystemConceptsListComponent implements OnInit {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public codeSystemId?: string;
  @Input() public codeSystemVersions?: CodeSystemVersion[];
  @Input() public properties?: EntityProperty[];


  public query = new ConceptSearchParams();
  public filter: {open: boolean, languages?: string[], version?: CodeSystemVersion, propertyName?: string, propertyValue?: string} = {open: false};
  public searchInput: string = "";
  public searchUpdate = new Subject<void>();
  public searchResult: SearchResult<CodeSystemConcept> = SearchResult.empty();

  public loading = false;

  public constructor(
    private codeSystemService: CodeSystemService
  ) {
    this.query.sort = 'code';
  }

  public ngOnInit(): void {
    this.loadData();
    this.searchUpdate.pipe(
      debounceTime(250),
      switchMap(() => this.search()),
    ).subscribe(data => this.searchResult = data);
  }

  private search(): Observable<SearchResult<CodeSystemConcept>> {
    if (!this.codeSystemId) {
      return of(this.searchResult);
    }
    const q = copyDeep(this.query);
    q.textContains = this.searchInput;
    q.codeSystemVersion = this.filter.version?.version;
    if (this.filter.propertyName && this.filter.propertyValue){
      q.propertyValues = this.filter['propertyName'] + '|' + this.filter['propertyValue'];
    }
    this.loading = true;
    return this.codeSystemService.searchConcepts(this.codeSystemId, q).pipe(finalize(() => this.loading = false));
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  public initFilterLanguages(supportedLanguages: string[]): void {
    if (!supportedLanguages) {
      this.filter.languages = undefined;
      return;
    }
    this.filter.languages = supportedLanguages.includes('en') ? ['en'] : [supportedLanguages[0]];
    this.filter.languages = [...this.filter.languages];
  }


  public getConceptName(concept: CodeSystemConcept, language: string): string | undefined {
    const findVersion = concept.versions?.find(version => version.status! === 'active');
    const findDesignation = findVersion?.designations?.find(designation => designation.status! === 'active' && designation.language! === language);
    return findDesignation?.name;
  }
}
