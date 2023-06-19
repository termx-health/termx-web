import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {CodeSystemLibService, EntityProperty, EntityPropertySearchParams, ValueSetRuleFilter} from 'app/src/app/resources/_lib';
import {BooleanInput, copyDeep, isDefined} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';


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
}
