import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Router} from '@angular/router';
import {environment} from 'environments/environment';
import {FhirValueSetLibService} from 'term-web/fhir/_lib';

@Component({
  selector: 'tw-fhir-value-set',
  templateUrl: './fhir-value-set.component.html'
})
export class FhirValueSetComponent implements OnChanges {
  @Input() public valueSet?: any;

  public constructor(private router: Router, private valueSetService: FhirValueSetLibService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['valueSet'] && this.valueSet && this.valueSet.id) {
      this.loadExpansion(this.valueSet.id);
    }
  }

  private loadExpansion(id: string): void {
    this.valueSetService.expandValueSet(id).subscribe(vs => this.valueSet.expansion = vs.expansion);
  }

  public openCodeSystem(sys: string): void {
    const id = sys.split('/')[sys.split('/').length - 1];
    this.router.navigate(['/fhir/CodeSystem/', id]);
  }

  public openValueSetExpand(): void {
    window.open(window.location.origin + environment.baseHref + 'fhir/ValueSet/' + this.valueSet.id + '/expand?includeDesignations=true' +
      (this.valueSet.language ? '&displayLanguage=' + this.valueSet.language : '') , '_blank');
  }
}
