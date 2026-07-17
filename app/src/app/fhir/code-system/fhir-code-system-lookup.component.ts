import {Component, Input} from '@angular/core';
import {ParamMap} from '@angular/router';
import { JsonPipe } from '@angular/common';
import { MuiTableModule } from '@termx-health/ui';
import { ApplyPipe } from '@termx-health/core-util';

@Component({
    selector: 'tw-fhir-code-system-lookup',
    templateUrl: './fhir-code-system-lookup.component.html',
    imports: [MuiTableModule, JsonPipe, ApplyPipe]
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
    return designations && designations.length > 0 ? designations.map(d => ({
      use: this.findParameter(d.part, 'use')?.valueCoding?.code,
      lang: this.findParameter(d.part, 'language')?.valueString,
      value: this.findParameter(d.part, 'value')?.valueString
    })) : undefined;
  };

  protected toPropertyRows = (properties: any[]): any[] => {
    return properties && properties.length > 0 ? properties.map(p => {
      const codePart = this.findParameter(p.part, 'code');
      return {
        // FHIR $lookup returns property.code as type `code` (valueCode); older servers used valueString.
        code: codePart?.valueCode ?? codePart?.valueString,
        description: this.findParameter(p.part, 'description')?.valueString,
        value: this.extractValueX(this.findParameter(p.part, 'value'))
      };
    }) : undefined;
  };

  // Pick the populated value[x], testing presence rather than truthiness so falsy values
  // (e.g. inactive=false, conceptOrder=0) are not dropped.
  private extractValueX(part: any): any {
    if (!part) {
      return undefined;
    }
    const keys = ['valueCode', 'valueCoding', 'valueString', 'valueInteger', 'valueBoolean', 'valueDateTime', 'valueDecimal'];
    for (const key of keys) {
      if (part[key] !== undefined) {
        return part[key];
      }
    }
    return undefined;
  }
}
