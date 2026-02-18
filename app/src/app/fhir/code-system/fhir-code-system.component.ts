import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {FhirValueSetLibService} from 'term-web/fhir/_lib';
import { MuiTableModule, MuiTagModule, MuiCoreModule } from '@kodality-web/marina-ui';

import { LocalDatePipe } from '@kodality-web/core-util';

@Component({
    selector: 'tw-fhir-code-system',
    templateUrl: './fhir-code-system.component.html',
    imports: [MuiTableModule, MuiTagModule, MuiCoreModule, RouterLink, LocalDatePipe]
})
export class FhirCodeSystemComponent implements OnChanges {
  private valueSetService = inject(FhirValueSetLibService);
  private router = inject(Router);

  @Input() public codeSystem?: any;
  public valueSets?: any[];

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
