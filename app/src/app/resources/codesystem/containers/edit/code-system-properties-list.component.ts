import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {EntityProperty} from 'terminology-lib/resources';
import {copyDeep, isDefined, validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';


@Component({
  selector: 'twa-code-system-properties-list',
  templateUrl: './code-system-properties-list.component.html',
})
export class CodeSystemPropertiesListComponent {
  @Input() public properties: EntityProperty[] = [];
  @Output() public propertiesChange = new EventEmitter<EntityProperty[]>();
  public loading = false;

  @ViewChild("propertyForm") public propertyForm?: NgForm;


  public propertyModalData: {
    visible?: boolean;
    editIndex?: number;
    property?: EntityProperty
  } = {};

  public saveProperty(): void {
    if (!validateForm(this.propertyForm)) {
      return;
    }
    if (isDefined(this.propertyModalData.editIndex)) {
      this.deleteProperty(this.propertyModalData.editIndex);
    }
    const property = this.propertyModalData.property;
    this.properties = [...this.properties, property!];
    this.propertiesChange.emit(this.properties);
    this.propertyModalData.visible = false;
  }

  public deleteProperty(index: number): void {
    this.properties!.splice(index, 1);
    this.properties = [...this.properties];
    this.propertiesChange.emit(this.properties);
  }

  public openPropertyModal(index?: number): void {
    this.propertyModalData = {
      visible: true,
      editIndex: index,
      property: isDefined(index) ? copyDeep(this.properties![index]) : new EntityProperty()
    };
  }

  public get isLoading(): boolean {
    return Object.values(this.loading).some(Boolean);
  }
}
