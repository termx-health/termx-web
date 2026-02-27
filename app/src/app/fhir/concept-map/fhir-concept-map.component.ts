import {Component, Input} from '@angular/core';

import { MuiTagModule, MuiTableModule } from '@kodality-web/marina-ui';

@Component({
    selector: 'tw-fhir-concept-map',
    templateUrl: './fhir-concept-map.component.html',
    imports: [MuiTagModule, MuiTableModule]
})
export class FhirConceptMapComponent {
  @Input() public conceptMap?: any;

  public constructor() {}
}
