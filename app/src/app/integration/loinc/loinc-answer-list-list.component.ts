import { Component, ViewChild, inject, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { compareNumbers, compareValues, ComponentStateStore, copyDeep, isDefined, LoadingManager, QueryParams, SearchResult, AutofocusDirective, ApplyPipe } from '@termx-health/core-util';
import { MuiTableComponent, MuiCardModule, MuiInputModule, MuiBackendTableModule, MuiTableModule, MuiCoreModule, MuiTagModule, MuiNoDataModule, MuiListModule } from '@termx-health/ui';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import {Observable, tap} from 'rxjs';
import {AuthService} from 'term-web/core/auth';
import {CodeSystemConcept, CodeSystemEntityVersion, CodeSystemLibService, ConceptSearchParams} from 'term-web/resources/_lib';
import { NzBreadCrumbComponent, NzBreadCrumbItemComponent } from 'ng-zorro-antd/breadcrumb';
import { NgClass, AsyncPipe } from '@angular/common';
import { InputDebounceDirective } from 'term-web/core/ui/directives/input-debounce.directive';
import { FormsModule } from '@angular/forms';
import { LocalizedConceptNamePipe } from 'term-web/resources/_lib/code-system/pipe/localized-concept-name-pipe';

@Component({
    selector: 'tw-loinc-answer-list-list',
    templateUrl: './loinc-answer-list-list.component.html',
    imports: [
    NzBreadCrumbComponent,
    NzBreadCrumbItemComponent,
    NgClass,
    MuiCardModule,
    MuiInputModule,
    InputDebounceDirective,
    AutofocusDirective,
    FormsModule,
    MuiBackendTableModule,
    MuiTableModule,
    MuiCoreModule,
    MuiTagModule,
    MuiNoDataModule,
    MuiListModule,
    AsyncPipe,
    TranslatePipe,
    ApplyPipe,
    LocalizedConceptNamePipe
],
})
export class LoincAnswerListListComponent implements OnInit {
  private codeSystemService = inject(CodeSystemLibService);
  private translateService = inject(TranslateService);
  private stateStore = inject(ComponentStateStore);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  protected readonly STORE_KEY = 'loin-answer-list';

  protected query = new ConceptSearchParams();
  protected searchResult: SearchResult<CodeSystemConcept> = SearchResult.empty();
  protected searchInput: string;
  protected loader = new LoadingManager();

  protected breadcrumb: string[] = [];
  protected loincConcepts: CodeSystemConcept[];

  @ViewChild(MuiTableComponent) public table?: MuiTableComponent<CodeSystemConcept>;

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);

    if (state) {
      this.query = Object.assign(new QueryParams(), state.query);
      this.searchInput = this.query.textContains;
    }

    this.route.queryParams.subscribe(p => {
      if (p['tab'] === 'answer-list') {
        this.handlePath(p['path']);
      }
    });

    this.loadData();
  }

  protected loadData(): void {
    this.search().subscribe(r => this.searchResult = r);
  }

  private search(): Observable<SearchResult<CodeSystemConcept>> {
    const q = copyDeep(this.query);
    q.textContains = this.searchInput;
    q.associationRoot = 'is-a';
    this.stateStore.put(this.STORE_KEY, {query: q});
    return this.loader.wrap('search', this.codeSystemService.searchConcepts('loinc-answer-list', q));
  }

  public onSearch = (): Observable<SearchResult<CodeSystemConcept>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };


  protected getName = (c: CodeSystemConcept, type = 'display'): string => {
    const lang = this.translateService.currentLang;
    const version = this.getLastVersion(c?.versions);
    const displays = version?.designations?.filter(d => d.designationType === type).sort(d1 => d1.language === lang ? 0 : 1);
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

  protected openConcept(code: string, cs = 'loinc-answer-list'): void {
    const canEdit = this.authService.hasPrivilege(`${cs}.CodeSystem.edit`);
    const path = '/resources/code-systems/' + cs + '/concepts/' + code + (canEdit ? '/edit' : '/view');
    this.router.navigate([path]);
  }

  protected loadLoinc(partCode): void {
    this.breadcrumb = ['...', partCode];
    const q = new ConceptSearchParams();
    q.propertyValues = 'answer-list|' + partCode;
    q.limit = 100;
    this.loader.wrap('loinc', this.codeSystemService.searchConcepts('loinc', q)).subscribe(r => this.loincConcepts = r.data);
    this.router.navigate(['/integration/loinc'], {queryParams: {tab: 'answer-list', path: this.breadcrumb.join(",")}});
  }

  private handlePath(path: string): void {
    if (!isDefined(path)) {
      this.breadcrumb = [];
      return;
    }
    const components = path.split(',');
    if (components.length === 2) {
      this.loadLoinc(components[1]);
    } else {
      this.breadcrumb = [];
    }
  }
}
