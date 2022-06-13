import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {CodeSystemService} from '../../services/code-system.service';
import {EntityProperty} from 'terminology-lib/resources';
import {copyDeep, isDefined, validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';


@Component({
  selector: 'twa-code-system-properties-list',
  templateUrl: './code-system-properties-list.component.html',
})
export class CodeSystemPropertiesListComponent implements OnChanges {
  @Input() public codeSystemId?: string;
  @Output() public propertiesChange = new EventEmitter<EntityProperty[]>();

  public properties: EntityProperty[] = [];
  public loading = false;

  @ViewChild("propertyForm") public propertyForm?: NgForm;

  public constructor(private codeSystemService: CodeSystemService) {}

  public propertyModalData: {
    visible?: boolean;
    editIndex?: number;
    property?: EntityProperty
  } = {};

  public propertyTypes = ['string', 'code', 'coding', 'boolean', 'dateTime', 'decimal'];

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["codeSystemId"]?.currentValue) {
      this.loadProperties();
    }
  }

  private loadProperties(): void {
    if (!this.codeSystemId) {
      return;
    }
    this.loading = true;
    this.codeSystemService.loadProperties(this.codeSystemId)
      .subscribe(properties => this.properties = properties)
      .add(() => this.loading = false);
  }


  public saveProperty(): void {
    if (!validateForm(this.propertyForm)) {
      return;
    }
    const property = this.propertyModalData.property;

    if (isDefined(this.propertyModalData.editIndex)) {
      this.deleteProperty(this.propertyModalData.editIndex);
    }

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
