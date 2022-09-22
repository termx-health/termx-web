import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {debounceTime, distinctUntilChanged, EMPTY, finalize, forkJoin, Observable, Subject, switchMap, tap} from 'rxjs';
import {isDefined, SearchResult} from '@kodality-web/core-util';
import {SnomedConcept} from '../model/concept/snomed-concept';
import {SnomedRefsetSearchParams} from '../model/refset/snomed-refset-search-params';
import {SnomedConceptSearchParams} from '../model/concept/snomed-concept-search-params';
import {SnomedLibService} from '../services/snomed-lib.service';

@Component({
  selector: 'twl-snomed-search',
  templateUrl: './snomed-search.component.html',
})
export class SnomedSearchComponent implements OnInit {
  private static snomed_root = '138875005';

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
    private snomedService: SnomedLibService
  ) {}

  public ngOnInit(): void {
    this.loadTaxonomyRootTree();
    this.loadRefsets();

    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(() => this.searchConcepts(this.searchText)),
    ).subscribe();
  }

  public loadTaxonomyRootTree(): void {
    this.loadTaxonomyTree(SnomedSearchComponent.snomed_root);
  }

  public loadTaxonomyTree(conceptId: string): void {
    this.parents = conceptId === SnomedSearchComponent.snomed_root ? [] : this.parents || [];
    this.loading['taxonomy'] = true;
    forkJoin([
      this.snomedService.loadConcept(conceptId),
      this.snomedService.findConceptChildren(conceptId),
    ]).subscribe(([concept, children]) => {
      this.parents.push(concept);
      this.children = children.sort((a, b) => a.fsn!.term!.localeCompare(b.fsn!.term!));
    }).add(() => this.loading['taxonomy'] = false);
  }

  private loadRefsets(): void {
    this.loading['refsets'] = true;
    this.snomedService.findRefsets({}).subscribe(refsets => {
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
    return this.snomedService.findDescriptions({term: searchText}).pipe(
      tap(res => this.children = res.items!.map(i => i.concept)),
      finalize(() => this.loading['taxonomy'] = false)
    );
  }

  public loadRefsetConcepts(): void {
    if (!isDefined(this.refsetParams.referenceSet)) {
      this.refsetConcepts = SearchResult.empty();
      return;
    }
    this.loading['refset-concepts'] = true;
    this.snomedService.findRefsetMembers(this.refsetParams).subscribe(members => {
      this.refsetConcepts = {meta: {total: members.total}, data: members.items!.map(i => i.referencedComponent!)};
    }).add(() => this.loading['refset-concepts'] = false);
  }

  public loadEclConcepts(): void {
    this.loading['ecl-concepts'] = true;
    this.snomedService.findConcepts(this.eclParams).subscribe(concepts => {
      this.eclConcepts = {data: concepts.items || [], meta: {total: concepts.total, offset: concepts.offset}};
    }).add(() => this.loading['ecl-concepts'] = false);
  }
}
