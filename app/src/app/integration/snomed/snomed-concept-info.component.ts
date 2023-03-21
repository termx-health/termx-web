import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {SnomedConcept, SnomedDescription, SnomedLibService, SnomedRelationship} from 'term-web/integration/_lib';
import {forkJoin} from 'rxjs';
import {isDefined} from '@kodality-web/core-util';

@Component({
  selector: 'tw-snomed-concept-info',
  templateUrl: './snomed-concept-info.component.html',
})
export class SnomedConceptInfoComponent implements OnChanges {

  public loading: boolean = false;
  public concept?: SnomedConcept;
  public refsets?: SnomedConcept[];
  public descriptions?: {[key: string]: SnomedDescription[]};
  public relationships?: SnomedRelationship[];


  @Input() public conceptId?: string;

  public constructor(
    private snomedService: SnomedLibService
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['conceptId'] && isDefined(this.conceptId)) {
      this.loadConceptData(this.conceptId);
    }
  }

  private loadConceptData(conceptId: string): void {
    this.loading = true;
    this.descriptions = {};
    forkJoin([
      this.snomedService.loadConcept(conceptId),
      this.snomedService.loadRefsets(conceptId),
    ]).subscribe(([concept, refsets]) => {
      this.concept = concept;
      this.refsets = refsets;
      this.descriptions = this.processDescriptions(concept.descriptions!);
      this.relationships = concept.relationships;
    }).add(() => this.loading = false);
  }

  private processDescriptions(descriptions: SnomedDescription[]): {[key: string]: SnomedDescription[]} {
    const refsetDescriptions : {[key: string]: SnomedDescription[]} = {};
    descriptions.forEach(description => {
      Object.keys(description.acceptabilityMap!).forEach(refset => {
        refsetDescriptions[refset] = refsetDescriptions[refset] ? [...refsetDescriptions[refset], description] : [];
      });
    });
    return refsetDescriptions;
  }
}
