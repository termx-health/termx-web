import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {BooleanInput, copyDeep, isDefined, validateForm} from '@kodality-web/core-util';


@Component({
  selector: 'twa-sd-type-list',
  templateUrl: './structure-definition-type-list.component.html',
  styles: [`
    .tw-sd-type-collapse ::ng-deep {

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
  `]
})
export class StructureDefinitionTypeListComponent {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public types!: StructureDefinitionType[];
  @Output() public typesChange: EventEmitter<StructureDefinitionType[]> = new EventEmitter<StructureDefinitionType[]>();

  public modalData: {
    visible?: boolean,
    index?: number,
    type?: StructureDefinitionType
  } = {};

  @ViewChild("form") public form?: NgForm;

  public addType(): void {
    this.types = [...this.types || []];
    this.toggleModal({});
  }

  public removeType(index: number): void {
    this.types.splice(index, 1);
    this.types = [...this.types];
    this.typesChange.emit(this.types);
  }


  public toggleModal(type?: StructureDefinitionType, index?: number): void {
    this.modalData = {
      visible: !!type,
      type: copyDeep(type),
      index: index
    };
  }

  public addModalTarget(): void {
    this.modalData.type!.targetProfile = [...(this.modalData.type!.targetProfile || []), {value: ''}];
  }

  public removeModalTarget(index: number): void {
    this.modalData.type!.targetProfile!.splice(index, 1);
    this.modalData.type!.targetProfile = [...this.modalData.type!.targetProfile!];
  }

  public confirmModalType(): void {
    if (!validateForm(this.form)) {
      return;
    }

    if (isDefined(this.modalData.index)) {
      this.types[this.modalData.index!] = this.modalData.type!;
    } else {
      this.types = [...this.types, this.modalData.type!];
    }

    this.typesChange.emit(this.types);
    this.modalData.visible = false;
  }
}

export class StructureDefinitionType {
  public code?: string;
  public targetProfile?: {value: string}[];
  public profile?: {value: string}[];
}

