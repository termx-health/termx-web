import { Component, Input, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { BooleanInput, isDefined, validateForm, ApplyPipe } from '@kodality-web/core-util';
import {CodeSystemLibService, CodeSystemVersion, MapSetResourceReference, MapSetScope, ValueSetLibService, ValueSetVersion} from 'term-web/resources/_lib';
import {map, Observable, of} from 'rxjs';
import { MuiCardModule, MuiFormModule, MuiRadioModule, MuiEditableTableModule, MuiSelectModule, MuiInputModule } from '@kodality-web/marina-ui';
import { AsyncPipe } from '@angular/common';
import { CodeSystemSearchComponent } from 'term-web/resources/_lib/code-system/containers/code-system-search.component';
import { ValueSetSearchComponent } from 'term-web/resources/_lib/value-set/containers/value-set-search.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'tw-ms-scope-form',
    templateUrl: 'map-set-scope-form.component.html',
    imports: [MuiCardModule, FormsModule, MuiFormModule, MuiRadioModule, MuiEditableTableModule, CodeSystemSearchComponent, MuiSelectModule, ValueSetSearchComponent, MuiInputModule, AsyncPipe, TranslatePipe, ApplyPipe]
})
export class MapSetScopeFormComponent {
  private valueSetService = inject(ValueSetLibService);
  private codeSystemService = inject(CodeSystemLibService);

  @Input() public scope?: MapSetScope;
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @ViewChild("form") public form?: NgForm;

  protected rowInstance: MapSetResourceReference = {};

  public valid(): boolean {
    return validateForm(this.form);
  }

  public onSourceTypeChange(type: 'code-system' | 'value-set' | 'external-canonical-uri' | undefined): void {
    this.scope.sourceValueSet = undefined;
    this.scope.sourceCodeSystems = undefined;
    if (type === 'code-system') {
      this.scope.sourceCodeSystems = [];
    }
    if (type === 'value-set' || type === 'external-canonical-uri') {
      this.scope.sourceValueSet = {};
    }
  }

  public onTargetTypeChange(type: 'code-system' | 'value-set' | 'external-canonical-uri' | undefined): void {
    this.scope.targetValueSet = undefined;
    this.scope.targetCodeSystems = undefined;
    if (type === 'code-system') {
      this.scope.targetCodeSystems = [];
    }
    if (type === 'value-set' || type === 'external-canonical-uri') {
      this.scope.targetValueSet = {};
    }
  }

  protected loadValueSetVersions = (id: string): Observable<ValueSetVersion[]> => {
    if (!isDefined(id)) {
      return of([]);
    }
    return this.valueSetService.searchVersions(id, {limit: -1}).pipe(map(r => r.data));
  };

  protected loadCodeSystemVersions = (id: string): Observable<CodeSystemVersion[]> => {
    if (!isDefined(id)) {
      return of([]);
    }
    return this.codeSystemService.searchVersions(id, {limit: -1}).pipe(map(r => r.data));
  };
}
