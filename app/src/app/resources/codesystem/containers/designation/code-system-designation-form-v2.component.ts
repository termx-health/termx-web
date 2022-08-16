import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {EntityProperty, MultiLanguageInputLanguage, MultiLanguageInputValue} from 'terminology-lib/resources';
import {isDefined, validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';
import {LocalizedName} from '@kodality-health/marina-util';

@Component({
  selector: 'twa-code-system-designation-form-v2',
  templateUrl: './code-system-designation-form-v2.component.html',
})
export class CodeSystemDesignationFormV2Component implements OnChanges {
  @Input() public languages?: MultiLanguageInputLanguage[];
  @Input() public designationKey?: string;//typeId-designationKind-caseSignificance
  @Input() public designationLanguages?: MultiLanguageInputValue;
  @Input() public requiredLanguages?: string[];
  @Input() public entityProperties?: EntityProperty[];

  @ViewChild("form") public form?: NgForm;

  public designationTypeId?: number;
  public designationKind?: string;
  public caseSignificance?: string;

  public names?: LocalizedName;

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['designationKey']) {
      let designationOptions = this.designationKey!.split('-');
      this.designationTypeId = Number(designationOptions[0]);
      this.designationKind = designationOptions[1];
      this.caseSignificance = designationOptions[2];
    }
  }

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }
}