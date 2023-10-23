import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Router} from '@angular/router';
import {FhirValueSetLibService} from 'term-web/fhir/_lib';

@Component({
  selector: 'tw-fhir-code-system',
  templateUrl: './fhir-code-system.component.html'
})
export class FhirCodeSystemComponent implements OnChanges {
  @Input() public codeSystem?: any;
  public valueSets?: any[];

  public constructor(
    private valueSetService: FhirValueSetLibService,
    private router: Router,
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['codeSystem'] && this.codeSystem && this.codeSystem.url) {
      this.loadValueSets(this.codeSystem.url);
    }
  }

  private loadValueSets(uri: string): void {
    this.valueSetService.search({reference: uri}).subscribe(v => this.valueSets = v.entry);
  }

  public openValueSet(id: string): void {
    this.router.navigate(['/fhir/ValueSet/', id]);
  }
}
