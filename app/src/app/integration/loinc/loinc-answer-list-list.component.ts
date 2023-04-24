import {Component, ViewChild} from '@angular/core';
import {compareNumbers, compareValues, ComponentStateStore, copyDeep, isDefined, LoadingManager, QueryParams, SearchResult} from '@kodality-web/core-util';
import {CodeSystemConcept, CodeSystemEntityVersion, CodeSystemLibService, ConceptSearchParams} from 'term-web/resources/_lib';
import {debounceTime, distinctUntilChanged, Observable, Subject, switchMap, tap} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {MuiTableComponent} from '@kodality-web/marina-ui';
import {AuthService} from 'term-web/core/auth';
import {Router} from '@angular/router';

@Component({
  selector: 'tw-loinc-answer-list-list',
  templateUrl: './loinc-answer-list-list.component.html',
})
export class LoincAnswerListListComponent {
  protected readonly STORE_KEY = 'loin-answer-list';

  protected loader = new LoadingManager();

  protected query = new ConceptSearchParams();
  protected searchInput: string;
  protected searchUpdate = new Subject<string>();
  protected searchResult: SearchResult<CodeSystemConcept> = SearchResult.empty();

  @ViewChild(MuiTableComponent) public table?: MuiTableComponent<CodeSystemConcept>;

  public constructor(
    private codeSystemService: CodeSystemLibService,
    private translateService: TranslateService,
    private stateStore: ComponentStateStore,
    private authService: AuthService,
    private router: Router) {}

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);

    if (state) {
      this.query = Object.assign(new QueryParams(), state.query);
      this.searchInput = this.query.textContains;
    }

    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      tap(() => this.query.offset = 0),
      switchMap(() => this.search()),
    ).subscribe(r => this.searchResult = r);

    this.searchUpdate.next(null);
  }

  private search(): Observable<SearchResult<CodeSystemConcept>> {
    const q = copyDeep(this.query);
    q.textContains = this.searchInput;
    q.associationRoot = 'is-a';
    this.stateStore.put(this.STORE_KEY, {query: q});
    return this.loader.wrap('search', this.codeSystemService.searchConcepts('loinc-answer-list', q));
  }

  protected loadData(): void {
    this.search().subscribe(r => this.searchResult = r);
  }

  protected getName = (c: CodeSystemConcept, type = 'display'): string => {
    const lang = this.translateService.currentLang;
    const version = this.getLastVersion(c?.versions);
    const displays = version?.designations?.filter(d => d.designationType === type).sort((d1, d2) => d1.language === lang ? 0 : 1);
    return displays?.length > 0 ? displays[0]?.name : '';
  };

  protected getProperty = (c: CodeSystemConcept, property: string): string[] => {
    const version = this.getLastVersion(c?.versions);
    const properties = version?.propertyValues?.filter(pv => pv.entityProperty === property);
    return properties?.map(p => p.value).filter(n => isDefined(n));
  };

  private getLastVersion(versions: CodeSystemEntityVersion[]): CodeSystemEntityVersion {
    return versions?.filter(v => ['draft', 'active'].includes(v.status!)).sort((a, b) => compareValues(a.created, b.created))?.[0];
  }

  public showAnswers(c: CodeSystemConcept, i: number): void {
    if (c['_expanded']) {
      this.table.collapse(i);
    } else {
      this.table.expand(i);
      if (!c['_children']) {
        this.loadAnswers(c);
      }
    }
    c['_expanded'] = !c['_expanded'];
  }

  private loadAnswers(c: CodeSystemConcept): void {
    const q = new ConceptSearchParams();
    q.associationSource = 'is-a|' + c.code;
    q.limit = c.childCount;
    this.loader.wrap('search', this.codeSystemService.searchConcepts('loinc-answer-list', q))
      .subscribe(r => c['_children'] = r.data.sort((c1, c2) => compareNumbers(this.getOrderNumber(c1, c.code), this.getOrderNumber(c2, c.code))));
  }

  private getOrderNumber(concept: CodeSystemConcept, code: string): number {
    return this.getLastVersion(concept.versions)?.associations?.find(a => a.targetCode === code)?.orderNumber;
  }

  protected openConcept(code: string): void {
    const canEdit = this.authService.hasPrivilege('*.CodeSystem.edit');
    const path = 'resources/code-systems/loinc-answer-list/concepts/' + code + (canEdit ? '/edit' : '/view');
    this.router.navigate([path]);
  }
}
