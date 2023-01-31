import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {EntityProperty} from 'terminology-lib/resources';
import {BooleanInput, isDefined, validateForm} from '@kodality-web/core-util';
import {CodeSystemService} from '../../codesystem/services/code-system.service';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'twa-dev-cs-properties',
  templateUrl: './dev-code-system-properties.component.html',
})
export class DevCodeSystemPropertiesComponent implements OnChanges {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public codeSystemId?: string | null;

  @ViewChild("form") public form?: NgForm;

  public properties: EntityProperty[] = [];
  public loading = false;

  public defProperties: {[key: string]: {selected: boolean, property: EntityProperty}} = {
    "display": {selected: false, property: {name: "display", type: "string", status: "active"}},
    "definition": {selected: false, property: {name: "definition", type: "string", status: "active"}},
    "alias": {selected: false, property: {name: "alias", type: "string", status: "active"}},
    "order": {selected: false, property: {name: "order", type: "integer", status: "active"}},
    "synonym": {selected: false, property: {name: "synonym", type: "code", status: "active"}},
    "is-a": {selected: false, property: {name: "is-a", type: "string", status: "active"}},
    "valid-from": {selected: false, property: {name: "valid-from", type: "dateTime", status: "active"}},
    "valid-to": {selected: false, property: {name: "valid-to", type: "dateTime", status: "active"}}
  };

  public constructor(private codeSystemService: CodeSystemService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['codeSystemId'] && this.codeSystemId) {
      this.loadProperties();
    }
  }

  public loadProperties(): void {
    this.loading = true;
    this.codeSystemService.searchProperties(this.codeSystemId!, {limit: -1})
      .subscribe(properties => this.properties = properties.data)
      .add(() => this.loading = false);
  }

  public defPropertySelectionChange(selected: boolean, p: string): void {
    if (selected) {
      this.addProperty(this.defProperties[p].property);
    } else {
      const property = this.properties.find(prop => prop.name === p);
      const index = property ? this.properties.indexOf(property) : undefined;
      if (isDefined(index)) {
        this.removeProperty(index);
      }
    }
  }

  public addProperty(property?: EntityProperty): void {
    this.properties = [...(this.properties || []), property || {status: 'active'}];
  }

  public removeProperty(index: number): void {
    this.properties!.splice(index, 1);
    this.properties = [...this.properties];
  }

  public getProperties(): EntityProperty[] {
    return this.properties || [];
  }

  public valid(): boolean {
    return validateForm(this.form);
  }
}
