import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {BooleanInput, isDefined, SearchResult} from '@kodality-web/core-util';
import {TranslateService} from '@ngx-translate/core';
import {Observable, of, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {CodeSystemConcept, CodeSystemConceptLibService, ConceptUtil} from 'term-web/resources/_lib';


@Component({
  selector: 'tw-concept-drawer-search',
  templateUrl: 'concept-drawer-search.component.html'
})
export class ConceptDrawerSearchComponent implements OnInit, OnChanges {
  @Input() public codeSystem: string;
  @Input() public codeSystemVersion: string;
  @Input() @BooleanInput() public codeSystemModifiable: string | boolean;

  @Output() public conceptSelect = new EventEmitter<number[]>();
  @Output() public codeSelect = new EventEmitter<string>();

  protected drawerOpened: boolean;
  protected concepts: SearchResult<CodeSystemConcept> = SearchResult.empty();

  protected searchInput: string;
  public searchUpdate = new Subject<string>();

  public constructor(private conceptService: CodeSystemConceptLibService, private translateService: TranslateService) {}

  public ngOnInit(): void {
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(() => {
        this.concepts = SearchResult.empty();
        return this.searchConcepts(this.codeSystem, this.codeSystemVersion);
      }),
    ).subscribe(r => this.concepts = r);
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if ((changes['codeSystem'] || changes['codeSystemVersion'])) {
      this.concepts = SearchResult.empty();
      this.loadConcepts(this.codeSystem, this.codeSystemVersion);
    }
  }

  protected onSearch(text: string): void {
    this.searchUpdate.next(text);
  }

  protected selectConcept(id: number): void {
    this.onSelect([id]);
  }

  protected selectConceptCode(code: string): void {
    this.codeSelect.emit(code);
    this.closeDrawer();
  }

  protected selectAll(): void {
    this.conceptService.search({ codeSystem: this.codeSystem, codeSystemVersion: this.codeSystemVersion, limit: -1}).subscribe(r => {
      this.onSelect(r.data?.flatMap(c => c.versions.map(v => v.id)));
    });
  }

  protected selectPicked(): void {
    this.onSelect(this.concepts.data?.flatMap(c => c.versions).filter(v => v['selected']).map(v => v.id));
  }

  protected onSelect(ids: number[]): void {
    this.conceptSelect.emit(ids);
    this.closeDrawer();
  }

  public openDrawer(): void {
    this.searchInput = undefined;
    this.concepts = SearchResult.empty();
    this.loadConcepts(this.codeSystem, this.codeSystemVersion);

    this.drawerOpened = true;
  }

  public closeDrawer(): void {
    this.drawerOpened = false;
  }

  protected loadConcepts(cs: string, csv: string): void {
    this.searchConcepts(cs, csv).subscribe(r => this.concepts = r);
  }

  protected searchConcepts(cs: string, csv: string): Observable<SearchResult<CodeSystemConcept>> {
    if (!isDefined(cs) || cs === 'snomed-ct') {
      of(SearchResult.empty());
    }
    return this.conceptService.search({
      codeSystem: cs,
      codeSystemVersion: csv,
      textContains: this.searchInput,
      limit: (this.concepts?.data?.length || 0) + 20
    });
  }

  protected getDisplay = (concept: CodeSystemConcept): string => {
    return ConceptUtil.getDisplay(concept, this.translateService.currentLang);
  };
}
