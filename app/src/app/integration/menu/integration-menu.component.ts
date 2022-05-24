import {Component} from '@angular/core';

@Component({
  templateUrl: './integration-menu.component.html',
})
export class IntegrationMenuComponent {
  public sync?: 'CodeSystem' | 'ValueSet' | 'ConceptMap';

  public constructor() { }


  public toggleSync(input: 'CodeSystem' | 'ValueSet' | 'ConceptMap'): void {
    this.sync = input;
  }

}
