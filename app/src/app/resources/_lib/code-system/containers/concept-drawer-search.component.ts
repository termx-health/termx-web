import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { BooleanInput, isDefined, SearchResult, isNil, AutofocusDirective, ApplyPipe, LocalDatePipe } from '@kodality-web/core-util';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import {Observable, of, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {CodeSystemConcept, CodeSystemConceptLibService, ConceptUtil, CodeSystemLibService, SnomedUtil} from 'term-web/resources/_lib';
import { MuiDrawerModule, MuiCardModule, MarinPageLayoutModule, MuiButtonModule, MuiAlertModule, MuiFormModule, MuiInputModule, MuiListModule, MuiCheckboxModule, MuiCoreModule } from '@kodality-web/marina-ui';

import { CodeSystemSearchComponent } from 'term-web/resources/_lib/code-system/containers/code-system-search.component';
import { FormsModule } from '@angular/forms';
import { CodeSystemVersionSelectComponent } from 'term-web/resources/_lib/code-system/containers/code-system-version-select.component';
import { SnomedSearchComponent } from 'term-web/integration/_lib/snomed/containers/snomed-search.component';


@Component({
    selector: 'tw-concept-drawer-search',
    templateUrl: 'concept-drawer-search.component.html',
    imports: [MuiDrawerModule, MuiCardModule, MarinPageLayoutModule, MuiButtonModule, MuiAlertModule, MuiFormModule, CodeSystemSearchComponent, FormsModule, CodeSystemVersionSelectComponent, SnomedSearchComponent, MuiInputModule, AutofocusDirective, MuiListModule, MuiCheckboxModule, MuiCoreModule, ApplyPipe, LocalDatePipe, TranslatePipe]
})
export class ConceptDrawerSearchComponent implements OnInit, OnChanges {
  private codeSystemService = inject(CodeSystemLibService);
  private conceptService = inject(CodeSystemConceptLibService);
  private translateService = inject(TranslateService);

  @Input() public codeSystem: string;
  @Input() public codeSystemVersion: string;
  @Input() @BooleanInput() public codeSystemModifiable: string | boolean;

  @Output() public conceptSelect = new EventEmitter<number[]>();
  @Output() public codeSelect = new EventEmitter<string>();

  protected drawerOpened: boolean;
  protected concepts: SearchResult<CodeSystemConcept> = SearchResult.empty();

  protected snomedBranch: string;
  protected searchInput: string;
  public searchUpdate = new Subject<string>();

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

    if (changes['codeSystem'] || changes['codeSystemVersion'] || changes['codeSystemVersions']) {
      this.loadSnomedBranch();
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

  protected loadSnomedBranch(): void {
    if (this.codeSystem !== 'snomed-ct' || isNil(this.codeSystemVersion)) {
      return;
    }
    this.codeSystemService.searchVersions('snomed-ct', {limit: -1}).subscribe(versions => {
      const uri = versions.data?.find(v => v.version === this.codeSystemVersion)?.uri;
      if (!uri) {
        return;
      }
      this.codeSystemService.searchConcepts('snomed-module', {limit: -1})
        .subscribe(r => this.snomedBranch = SnomedUtil.getBranch(uri, r.data));
    });
  }
}
