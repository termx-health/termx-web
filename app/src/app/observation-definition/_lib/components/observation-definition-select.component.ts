import {Component} from '@angular/core';

@Component({
  selector: 'tw-observation-definition-select',
  template: `
    <m-input name="obs-def" [ngModel]="'obs-def'" disabled></m-input>
  `
})
export class ObservationDefinitionSelectComponent {
}
