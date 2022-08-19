import {Component, Input, ViewChild} from '@angular/core';
import {Designation, EntityProperty} from 'lib/src/resources';
import {BooleanInput, isDefined, validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'twa-code-system-designation-group-edit',
  templateUrl: './code-system-designation-group-edit.component.html',
})
export class CodeSystemDesignationGroupEditComponent {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public designationGroup?: {
    designationTypeId: number,
    designationKind: string,
    caseSignificance: string,
    designations?: Designation[]
  };
  @Input() public requiredLanguages?: string[];
  @Input() public entityProperties?: EntityProperty[];

  @ViewChild("form") public form?: NgForm;

  public language?: string;

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }

  public addDesignation(lang: string): void {
    if (!lang || !this.designationGroup) {
      return;
    }
    this.designationGroup.designations = [...this.designationGroup.designations || [], {language: lang, status: 'draft'}];
    this.language = undefined;
  }

  public removeDesignation(index: number): void {
    this.designationGroup?.designations?.splice(index, 1);
    this.designationGroup!.designations = [...this.designationGroup!.designations || []];
  }

  public requiredFirst = (designations: Designation[], requiredLanguages: string[]): Designation[] => {
    return designations.sort(d => d.language && requiredLanguages?.includes(d.language) ? -1 : 1);
  };

  public isRequired = (lang: string, requiredLanguages: string[]): boolean => {
    return isDefined(requiredLanguages) && requiredLanguages.includes(lang);
  };
}
