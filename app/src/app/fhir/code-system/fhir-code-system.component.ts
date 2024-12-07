import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {Router} from '@angular/router';
import {FhirValueSetLibService} from 'term-web/fhir/_lib';
import {Subject, Subscription} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

@Component({
  selector: 'tw-fhir-code-system',
  templateUrl: './fhir-code-system.component.html'
})
export class FhirCodeSystemComponent implements OnChanges, OnInit, OnDestroy {
  @Input() public codeSystem?: any;
  public valueSets?: any[];
  
  public searchText: string = '';
  public filteredConcepts: any[] = [];
  private searchSubject = new Subject<string>();
  private subscription!: Subscription;

  public collapseState: { [key: string]: boolean } = {};

  public constructor(
      private valueSetService: FhirValueSetLibService,
      private router: Router,
  ) {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['codeSystem'] && this.codeSystem && this.codeSystem.url) {
      this.loadValueSets(this.codeSystem.url);
    }
  }

  public toggleCollapse(code: string): void {
    this.collapseState[code] = !this.collapseState[code];
  }

  public expandAll(): void {
    this.setCollapseState(false);
  }

  public collapseAll(): void {
    this.setCollapseState(true);
  }

  private setCollapseState(state: boolean): void {
    const setCollapse = (concepts: any[]) => {
      concepts.forEach(concept => {
        if (concept.concept && concept.concept.length > 0) {
          this.collapseState[concept.code] = state;
          setCollapse(concept.concept); // Recursively set state for children
        }
      });
    };
    setCollapse(this.filteredConcepts);
  }

  private loadValueSets(uri: string): void {
    this.valueSetService.search({reference: uri}).subscribe(v => this.valueSets = v.entry);
  }

  public openValueSet(id: string): void {
    this.router.navigate(['/fhir/ValueSet/', id]);
  }

  public ngOnInit() {
    //console.log(this.codeSystem.concept);
    this.filteredConcepts = this.codeSystem.concept;
    this.setCollapseState(true);

    // Debounce the search input handling
    this.subscription = this.searchSubject.pipe(
        debounceTime(500) // Adjust the delay as needed, here 300ms
    ).subscribe(searchTerm => {
      this.filterConcepts(searchTerm);
    });    
  }

  public onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  public filterConcepts(searchTerm: string): void {
    const searchLower = searchTerm.trim().toLowerCase();
    if (searchLower.length === 0) {
      // If the search input is empty, display all concepts
      this.filteredConcepts = this.codeSystem.concept;
    } else {
      this.filteredConcepts = this.filter(this.codeSystem.concept, searchLower);
    }
  }

  private filter(concepts: any[], searchTerm: string): any[] {
    return concepts.reduce((acc: any[], concept: any) => {
      const code = concept.code ? concept.code.toString().toLowerCase() : '';
      const display = concept.display ? concept.display.toString().toLowerCase() : '';
      const definition = concept.definition ? concept.definition.toString().toLowerCase() : '';

      const conceptMatch = code.includes(searchTerm) ||
          display.includes(searchTerm) ||
          definition.includes(searchTerm);

      const children = concept.concept ? this.filter(concept.concept, searchTerm) : [];

      if (conceptMatch || children.length > 0) {
        acc.push({
          ...concept,
          concept: children
        });
      }

      return acc;
    }, []);
  }

  public ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
