import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { BooleanInput, copyDeep, isDefined, validateForm, AutofocusDirective } from '@kodality-web/core-util';
import {ElementConstraint} from 'term-web/modeler/_lib/structure-definition/structure-definition-editable-tree.component';
import { MuiCardModule, MuiNoDataModule, MuiTableModule, MuiCoreModule, MuiButtonModule, MuiIconModule, MuiModalModule, MuiFormModule, MuiInputModule, MuiRadioModule } from '@kodality-web/marina-ui';

import { AddButtonComponent } from 'term-web/core/ui/components/add-button/add-button.component';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
    selector: 'tw-sd-constraint-list',
    templateUrl: './structure-definition-constraint-list.component.html',
    styles: [`
    .tw-sd-constraint-collapse ::ng-deep {

      .ant-collapse-header {
        align-items: center;
      }

      .ant-collapse-content-box {
        padding: 0;
      }

      .m-table {
        border-radius: 0 0 4px 4px;
      }
    }
  `],
    imports: [MuiCardModule, AddButtonComponent, MuiNoDataModule, MuiTableModule, MuiCoreModule, MuiButtonModule, MuiIconModule, MuiModalModule, FormsModule, MuiFormModule, MuiInputModule, AutofocusDirective, MuiRadioModule, TranslatePipe]
})
export class StructureDefinitionConstraintListComponent {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public constraints!: ElementConstraint[];
  @Output() public constraintsChange: EventEmitter<ElementConstraint[]> = new EventEmitter<ElementConstraint[]>();

  public modalData: {
    visible?: boolean,
    index?: number,
    constraint?: ElementConstraint
  } = {};

  @ViewChild("form") public form?: NgForm;

  public addConstraint(): void {
    this.constraints = [...this.constraints || []];
    this.toggleModal({severity: 'error'});
  }

  public removeConstraint(index: number): void {
    this.constraints.splice(index, 1);
    this.constraints = [...this.constraints];
    this.constraintsChange.emit(this.constraints);
  }


  public toggleModal(constraint?: ElementConstraint, index?: number): void {
    this.modalData = {
      visible: !!constraint,
      constraint: copyDeep(constraint),
      index: index
    };
  }

  public confirmModalConstraint(): void {
    if (!validateForm(this.form)) {
      return;
    }
    if (isDefined(this.modalData.index)) {
      this.constraints[this.modalData.index!] = this.modalData.constraint!;
    } else {
      this.constraints = [...this.constraints, this.modalData.constraint!];
    }

    this.constraintsChange.emit(this.constraints);
    this.modalData.visible = false;
  }
}
