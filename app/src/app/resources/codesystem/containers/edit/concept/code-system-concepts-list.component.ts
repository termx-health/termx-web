import {Component, Input, OnInit} from '@angular/core';
import {CodeSystemConcept, CodeSystemVersion, ConceptSearchParams, EntityProperty} from 'terminology-lib/resources';
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
  @Input() public codeSystemVersions?: CodeSystemVersion[];
  @Input() public properties?: EntityProperty[];

  public filter = false;

  public query = new ConceptSearchParams();
  public searchInput: string = "";
  public searchVersion?: CodeSystemVersion;
  public searchPropertyName?: string;
  public searchPropertyValue?: string;
  public searchUpdate = new Subject<string>();
  public searchResult: SearchResult<CodeSystemConcept> = SearchResult.empty();
  public filterLanguages: string[] = [];

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
    q.textContains = this.searchInput;
    q.codeSystemVersion = this.searchVersion?.version;
    if (this.searchPropertyName && this.searchPropertyValue){
      q.propertyValues = this.searchPropertyName + '|' + this.searchPropertyValue;
    }
    this.loading = true;
    return this.codeSystemService.searchConcepts(this.codeSystemId, q).pipe(finalize(() => this.loading = false));
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  public initFilterLanguages(supportedLanguages: string[] = []): void {
    if (!supportedLanguages) {
      return;
    }
    this.filterLanguages = supportedLanguages.includes('en') ? ['en'] : [supportedLanguages[0]];
    this.filterLanguages = [...this.filterLanguages];
  }


  public getConceptName(concept: CodeSystemConcept, language: string): string | undefined {
    const findVersion = concept.versions?.find(version => version.status! === 'active');
    const findDesignation = findVersion?.designations?.find(designation => designation.status! === 'active' && designation.language! === language);
    return findDesignation?.name;
  }
}
