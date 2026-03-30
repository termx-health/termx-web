import {Component, forwardRef, Input, OnChanges, SimpleChanges} from '@angular/core';
import { NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { MuiTagModule, MuiTooltipModule, MuiIconModule } from '@termx-health/ui';
import { CodeSystemSearchComponent } from 'term-web/resources/_lib/code-system/containers/code-system-search.component';
import { TerminologyConceptSearchComponent } from 'term-web/core/ui/components/inputs/terminology-concept-select/terminology-concept-search.component';
import { LocalizedConceptNamePipe } from 'term-web/resources/_lib/code-system/pipe/localized-concept-name-pipe';

@Component({
    selector: 'tw-obs-def-value-select',
    templateUrl: './observation-definition-value-select.component.html',
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ObservationDefinitionValueSelectComponent), multi: true }],
    imports: [MuiTagModule, MuiTooltipModule, MuiIconModule, CodeSystemSearchComponent, FormsModule, TerminologyConceptSearchComponent, AsyncPipe, LocalizedConceptNamePipe]
})
export class ObservationDefinitionValueSelectComponent implements OnChanges {
  @Input() public codeSystem?: string;

  public value?: {code: string, codeSystem: string}[];
  public v?: {code?: string, codeSystem?: string} = {};

  public onChange = (x: any): any => x;
  public onTouched = (x: any): any => x;

  public constructor() {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['codeSystem'] && this.codeSystem) {
      this.v = {codeSystem: this.codeSystem};
    }
  }

  public writeValue(obj: {code: string, codeSystem: string}[]): void {
    this.value = (obj || []);
  }

  public fireOnChange(): void {
    this.onChange(this.value);
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public removeValue(index: number): void {
    this.value?.splice(index, 1);
    this.value = [...(this.value || [])];
    this.fireOnChange();
  }

  public addValue(code: string, system: string): void {
    if (!code || !system) {
      return;
    }
    this.value = [...(this.value || []), {code: code, codeSystem: system}];
    this.fireOnChange();
    setTimeout(() => {
      this.v.code = undefined;
    });
  }
}
