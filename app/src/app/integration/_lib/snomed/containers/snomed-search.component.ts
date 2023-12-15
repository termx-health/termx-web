import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {debounceTime, distinctUntilChanged, EMPTY, finalize, forkJoin, Observable, Subject, switchMap, tap} from 'rxjs';
import {DestroyService, isDefined, SearchResult} from '@kodality-web/core-util';
import {SnomedConcept} from '../model/concept/snomed-concept';
import {SnomedRefsetSearchParams} from '../model/refset/snomed-refset-search-params';
import {SnomedConceptSearchParams} from '../model/concept/snomed-concept-search-params';
import {SnomedLibService} from '../services/snomed-lib.service';
import {LorqueLibService} from 'term-web/sys/_lib';
import {MuiNotificationService} from '@kodality-web/marina-ui';

@Component({
  selector: 'tw-snomed-search',
  templateUrl: './snomed-search.component.html',
  providers: [DestroyService]
})
export class SnomedSearchComponent implements OnInit, OnChanges {
  private static snomed_root = '138875005';

  @Input() public ecl: string;
  @Input() public conceptId: string;
  @Input() public branch: string;

  public loading: {[key: string]: boolean} = {};

  public searchText?: string;
  public parents: SnomedConcept[] = [];
  public children: SnomedConcept[] = [];

  public refsets: SnomedConcept[] = [];
  public refsetParams: SnomedRefsetSearchParams = new SnomedRefsetSearchParams();
  public refsetConcepts: SearchResult<SnomedConcept> = SearchResult.empty();

  public eclParams: SnomedConceptSearchParams = new SnomedConceptSearchParams();
  public eclConcepts: SearchResult<SnomedConcept> = SearchResult.empty();


  public searchUpdate = new Subject<string>();

  @Output() public conceptSelected: EventEmitter<string> = new EventEmitter<string>();

  public constructor(
    private snomedService: SnomedLibService,
    private lorqueService: LorqueLibService,
    private notificationService: MuiNotificationService,
    private destroy$: DestroyService,
  ) {}

  public ngOnInit(): void {
    this.initData();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['ecl'] && this.ecl) {
      this.eclParams.ecl = this.ecl;
      this.loadEclConcepts();
    }
    if (changes['branch']) {
      this.initData();
    }
  }

  public loadTaxonomyRootTree(): void {
    this.loadTaxonomyTree(SnomedSearchComponent.snomed_root);
  }

  public loadTaxonomyTree(conceptId: string): void {
    this.parents = conceptId === SnomedSearchComponent.snomed_root ? [] : this.parents || [];
    this.loading['taxonomy'] = true;
    forkJoin([
      this.snomedService.loadConcept(conceptId, this.branch),
      this.snomedService.findConceptChildren(conceptId, this.branch),
    ]).subscribe(([concept, children]) => {
      this.parents.push(concept);
      this.children = children.sort((a, b) => a.fsn!.term!.localeCompare(b.fsn!.term!));
    }).add(() => this.loading['taxonomy'] = false);
  }

  private loadRefsets(): void {
    this.loading['refsets'] = true;
    this.snomedService.findRefsets({branch: this.branch}).subscribe(refsets => {
      this.refsets = Object.values(refsets.referenceSets!).sort(function (a, b) {
        return a.fsn!.term!.localeCompare(b.fsn!.term!);
      });
    }).add(() => this.loading['refsets'] = false);
  }

  public selectConcept(conceptId: string, parentIndex?: number): void {
    if (parentIndex) {
      this.parents.splice(parentIndex, this.parents.length - parentIndex);
    }
    this.conceptSelected.emit(conceptId);
  }

  public searchConcepts(searchText?: string): Observable<any> {
    if (!searchText) {
      this.loadTaxonomyRootTree();
      return EMPTY;
    }
    if (searchText.length < 3) {
      return EMPTY;
    }
    this.parents = [];
    this.loading['taxonomy'] = true;
    return this.snomedService.findDescriptions({term: searchText, branch: this.branch}).pipe(
      tap(res => this.children = res.items!.map(i => {
        i.concept['term'] = i.term;
        return i.concept;
      })),
      finalize(() => this.loading['taxonomy'] = false)
    );
  }

  public loadRefsetConcepts(): void {
    if (!isDefined(this.refsetParams.referenceSet)) {
      this.refsetConcepts = SearchResult.empty();
      return;
    }
    this.loading['refset-concepts'] = true;
    this.refsetParams.branch = this.branch;
    this.snomedService.findRefsetMembers(this.refsetParams).subscribe(members => {
      this.refsetConcepts = {meta: {total: members.total}, data: members.items!.map(i => i.referencedComponent!)};
    }).add(() => this.loading['refset-concepts'] = false);
  }

  public loadEclConcepts(): void {
    this.loading['ecl-concepts'] = true;
    this.eclParams.branch = this.branch;
    this.snomedService.findConcepts(this.eclParams).subscribe(concepts => {
      this.eclConcepts = {data: concepts.items || [], meta: {total: concepts.total, offset: concepts.offset}};
    }).add(() => this.loading['ecl-concepts'] = false);
  }

  public expandTree(conceptId: string): void {
    this.loading['taxonomy'] = true;
    this.snomedService.loadConcept(conceptId, this.branch).subscribe(c => {
      const relation = c.relationships?.[0];
      if (relation) {
        this.snomedService.findConceptChildren(relation.target.conceptId, this.branch).subscribe(children => this.children = children);
      } else {
        this.children = [c];
      }
      this.parents = [];
      this.loadParents(c);
      this.loading['taxonomy'] = false;
    });

  }

  private loadParents(c: SnomedConcept): void {
    const relation = c.relationships?.[0];
    if (relation) {
      this.loading['taxonomy'] = true;
      this.snomedService.loadConcept(relation.target.conceptId, this.branch).subscribe(r => {
        this.parents = [r, ...(this.parents || [])];
        this.loadParents(r);
        this.loading['taxonomy'] = false;
      });
    }
  }

  protected exportConceptCsv(type: 'refset' | 'ecl'): void {
    let params:SnomedConceptSearchParams = {};
    if (type === 'refset') {
      params.ecl = '^' + this.refsetParams?.referenceSet;
    }
    if (type === 'ecl') {
      params.ecl = this.eclParams?.ecl;
    }
    this.loading['csv-export'] = true;
    params.branch = this.branch;
    this.snomedService.startConceptCsvExport(params).subscribe(process => {
      this.lorqueService.pollFinishedProcess(process.id, this.destroy$).subscribe(status => {
        if (status === 'failed') {
          this.lorqueService.load(process.id).subscribe(p => this.notificationService.error(p.resultText));
          return;
        }
        this.snomedService.getConceptCsv(process.id);
      }).add(() => this.loading['csv-export'] = false);
    }, () => this.loading['csv-export'] = false);
  }

  private initData(): void {
    if (this.conceptId) {
      this.expandTree(this.conceptId);
    } else {
      this.loadTaxonomyRootTree();
    }

    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(() => this.searchConcepts(this.searchText)),
    ).subscribe();

    this.loadRefsets();
  }
}
