import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {isDefined, SearchResult, validateForm} from '@kodality-web/core-util';
import {EntityProperty, EntityPropertyValue} from 'terminology-lib/resources';
import {CodeSystemService} from '../../services/code-system.service';

@Component({
  selector: 'twa-code-system-property-value-form',
  templateUrl: './code-system-property-value-form.component.html',
})
export class CodeSystemPropertyValueFormComponent implements OnChanges {
  @Input() public codeSystemId?: string;
  @Input() public propertyValue?: EntityPropertyValue;

  @ViewChild("form") public form?: NgForm;

  public loading = false;
  public entityProperties: SearchResult<EntityProperty> = SearchResult.empty();
  public codingSystemId?: string;


  public constructor(
    private codeSystemService: CodeSystemService,
  ) { }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['propertyValue']) {
      this.codingSystemId = this.propertyValue?.value?.codeSystem;
    }
    if (changes['codeSystemId']) {
      this.entityProperties = SearchResult.empty();
      if (this.codeSystemId) {
        this.loadProperties(this.codeSystemId);
      }
    }
  }

  private loadProperties(codeSystem: string): void {
    this.loading = true;
    this.codeSystemService.searchProperties(codeSystem, {limit: -1}).subscribe(result => this.entityProperties = result).add(() => this.loading = false);
  }

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }

  public checkPropertyType = (type: string): boolean => {
    return !!this.entityProperties.data.find(p => this.propertyValue?.entityPropertyId === p.id && p.type && type.split(',').includes(p.type));
  };
}
