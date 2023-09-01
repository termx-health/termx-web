import {Component, Input, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {isDefined, validateForm} from '@kodality-web/core-util';
import {CodeSystemLibService, CodeSystemVersion, MapSetResourceReference, MapSetScope, ValueSetLibService, ValueSetVersion} from 'app/src/app/resources/_lib';
import {map, Observable, of} from 'rxjs';

@Component({
  selector: 'tw-ms-scope-form',
  templateUrl: 'map-set-scope-form.component.html'
})
export class MapSetScopeFormComponent {
  @Input() public scope?: MapSetScope;
  @ViewChild("form") public form?: NgForm;

  protected rowInstance: MapSetResourceReference = {};

  public constructor(
    private valueSetService: ValueSetLibService,
    private codeSystemService: CodeSystemLibService,
  ) {}

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
