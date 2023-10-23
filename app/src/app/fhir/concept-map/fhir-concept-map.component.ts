import {Component, Input} from '@angular/core';

@Component({
  selector: 'tw-fhir-concept-map',
  templateUrl: './fhir-concept-map.component.html'
})
export class FhirConceptMapComponent {
  @Input() public conceptMap?: any;

  public constructor() {}
}
