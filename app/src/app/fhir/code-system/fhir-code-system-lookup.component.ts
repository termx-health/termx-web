import {Component, Input} from '@angular/core';
import {ParamMap} from '@angular/router';

@Component({
  selector: 'tw-fhir-code-system-lookup',
  templateUrl: './fhir-code-system-lookup.component.html'
})
export class FhirCodeSystemLookupComponent {
  @Input() public params?: ParamMap;
  @Input() public result?: any;

  public constructor() {}

  protected findParameter = (parameters: any[], name: string): any => {
    return parameters?.find(p => p.name === name);
  };

  protected findParameters = (parameters: any[], name: string): any[] => {
    return parameters?.filter(p => p.name === name);
  };

  protected toDesignationRows = (designations: any[]): any[] => {
    return designations.map(d => ({
      use: this.findParameter(d.part, 'use')?.valueCoding?.code,
      lang: this.findParameter(d.part, 'language')?.valueString,
      value: this.findParameter(d.part, 'value')?.valueString
    }));
  };

  protected toPropertyRows = (properties: any[]): any[] => {
    return properties.map(p => ({
      code: this.findParameter(p.part, 'code')?.valueString,
      description: this.findParameter(p.part, 'description')?.valueString,
      value: this.findParameter(p.part, 'value')?.valueCode ||
        this.findParameter(p.part, 'value')?.valueCoding ||
        this.findParameter(p.part, 'value')?.valueString ||
        this.findParameter(p.part, 'value')?.valueInteger ||
        this.findParameter(p.part, 'value')?.valueBoolean ||
        this.findParameter(p.part, 'value')?.valueDateTime ||
        this.findParameter(p.part, 'value')?.valueDecimal
    }));
  };
}
