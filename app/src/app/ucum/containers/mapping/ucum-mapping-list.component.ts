import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {BooleanInput, copyDeep, isDefined, validateForm} from '@kodality-web/core-util';
import {UcumMapping} from 'term-web/ucum/_lib';

@Component({
  selector: 'tw-ucum-mapping-list',
  templateUrl: './ucum-mapping-list.component.html',
})
export class UcumMappingListComponent {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public mappings!: UcumMapping[];
  @Output() public mappingsChange: EventEmitter<UcumMapping[]> = new EventEmitter<UcumMapping[]>();

  public modalData: {
    visible?: boolean,
    mappingIndex?: number,
    mapping?: UcumMapping
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


  public toggleModal(mapping?: UcumMapping, index?: number): void {
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
