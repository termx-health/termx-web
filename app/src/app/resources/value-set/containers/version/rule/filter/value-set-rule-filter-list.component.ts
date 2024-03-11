import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {BooleanInput, validateForm} from '@kodality-web/core-util';
import {CodeSystemLibService, EntityProperty, EntityPropertySearchParams, ValueSetRuleFilter} from 'app/src/app/resources/_lib';


@Component({
  selector: 'tw-value-set-rule-filter-list',
  templateUrl: 'value-set-rule-filter-list.component.html',
})
export class ValueSetRuleFilterListComponent implements OnChanges {
  @Input() public codeSystem?: string;
  @Input() public filters: ValueSetRuleFilter[] = [];
  @Input() @BooleanInput() public viewMode: string | boolean = false;

  @ViewChild("form") public form?: NgForm;

  @Output() public filtersChange: EventEmitter<ValueSetRuleFilter[]> = new EventEmitter<ValueSetRuleFilter[]>();

  public loading = false;
  public properties: EntityProperty[] = [];

  public rowInstance: ValueSetRuleFilter = {property: {}};

  public constructor(private codeSystemService: CodeSystemLibService) { }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["codeSystem"] && this.codeSystem) {
      this.loadEntityProperties(this.codeSystem);
    }
  }

  private loadEntityProperties(codeSystem: string): void {
    this.properties = [];

    const q = new EntityPropertySearchParams();
    q.codeSystem = codeSystem;
    q.limit = 10_000;
    this.loading = true;
    this.codeSystemService.searchProperties(codeSystem, q)
      .subscribe(properties => this.properties = properties.data)
      .add(() => this.loading = false);
  }

  public validate(): boolean {
    return validateForm(this.form);
  }
}
