import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {BooleanInput, copyDeep, isDefined, validateForm} from '@kodality-web/core-util';
import {MeasurementUnitMapping} from 'term-web/measurement-unit/_lib';

@Component({
  selector: 'tw-measurement-unit-mapping-list',
  templateUrl: './measurement-unit-mapping-list.component.html',
})
export class MeasurementUnitMappingListComponent {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public mappings!: MeasurementUnitMapping[];
  @Output() public mappingsChange: EventEmitter<MeasurementUnitMapping[]> = new EventEmitter<MeasurementUnitMapping[]>();

  public modalData: {
    visible?: boolean,
    mappingIndex?: number,
    mapping?: MeasurementUnitMapping
  } = {};

  @ViewChild("form") public form?: NgForm;

  public addMapping(): void {
    this.mappings = [...this.mappings || []];
    this.toggleModal({});
  }

  public removeMapping(index: number): void {
    this.mappings.splice(index, 1);
    this.mappings = [...this.mappings];
    this.mappingsChange.emit(this.mappings);
  }


  public toggleModal(mapping?: MeasurementUnitMapping, index?: number): void {
    this.modalData = {
      visible: !!mapping,
      mapping: copyDeep(mapping),
      mappingIndex: index,
    };
  }

  public confirmModalMapping(): void {
    if (!validateForm(this.form)) {
      return;
    }
    if (isDefined(this.modalData.mappingIndex)) {
      this.mappings[this.modalData.mappingIndex!] = this.modalData.mapping!;
    } else {
      this.mappings = [...this.mappings, this.modalData.mapping!];
    }
    this.mappings = [...this.mappings];

    this.mappingsChange.emit(this.mappings);
    this.modalData.visible = false;
  }
}
