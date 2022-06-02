import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {EntityProperty, ValueSetRuleFilter} from 'terminology-lib/resources';
import {BooleanInput} from '@kodality-web/core-util';
import {EntityPropertyLibService} from 'terminology-lib/resources/codesystem/services/entity-property-lib.service';
import {EntityPropertySearchParams} from 'terminology-lib/resources/codesystem/model/entity-property-search-params';

@Component({
  selector: 'twa-value-set-rule-filter-list',
  templateUrl: 'value-set-rule-filter-list.component.html',
})
export class ValueSetRuleFilterListComponent implements OnChanges {
  @Input() public valueSet?: string;
  @Input() public codeSystem?: string;

  @Input() public filters: ValueSetRuleFilter[] = [];

  @Input() @BooleanInput() public viewMode: string | boolean = false;

  @Output() public filtersChange: EventEmitter<ValueSetRuleFilter[]> = new EventEmitter<ValueSetRuleFilter[]>();

  public loading = false;
  public properties: EntityProperty[] = [];

  public constructor(private entityPropertyService: EntityPropertyLibService) { }

  public ngOnChanges(changes: SimpleChanges): void {
    this.properties = [];
    if (changes["valueSet"]?.currentValue || changes["codeSystem"]?.currentValue) {
      this.loadEntityProperties();
    }
  }

  public addRow(): void {
    this.filters.push(new ValueSetRuleFilter());
    this.filters = [...this.filters];
    this.filtersChange.emit(this.filters);
  }

  public removeRow(index: number): void {
    this.filters.splice(index, 1);
    this.filters = [...this.filters];
    this.filtersChange.emit(this.filters);
  }

  private loadEntityProperties(): void {
    const q = new EntityPropertySearchParams();
    q.codeSystem = this.codeSystem;
    q.valueSet = this.valueSet;
    q.limit = 10_000;
    this.loading = true;
    this.entityPropertyService.search(q)
      .subscribe(properties => this.properties = properties.data)
      .add(() => this.loading = false);
  }
}
