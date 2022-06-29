import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {isDefined, SearchResult, validateForm} from '@kodality-web/core-util';
import {EntityProperty, EntityPropertySearchParams, EntityPropertyValue} from 'terminology-lib/resources';
import {CodeSystemService} from '../../services/code-system.service';

@Component({
  selector: 'twa-code-system-property-value-form',
  templateUrl: './code-system-property-value-form.component.html',
})
export class CodeSystemPropertyValueFormComponent implements OnChanges{
  @Input() public propertyValue?: EntityPropertyValue;
  @Input() public codeSystemId?: string;
  @ViewChild("form") public form?: NgForm;

  public loading = false;
  public entityProperties: SearchResult<EntityProperty> = SearchResult.empty();


  public constructor(
    private codeSystemService: CodeSystemService,
  ) { }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['codeSystemId'] && this.codeSystemId) {
      this.loadProperties(this.codeSystemId);
    }
  }

  private loadProperties(codeSystem: string): void {
    const q = new EntityPropertySearchParams();
    q.codeSystem = codeSystem;
    q.limit = -1;
    this.loading = true;
    this.codeSystemService.searchProperties(codeSystem, q).subscribe(result => this.entityProperties = result).add(() => this.loading = false);
  }

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }
}
