import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {CodeSystemLibService, EntityProperty, ValueSetRuleFilter} from 'terminology-lib/resources';
import {BooleanInput} from '@kodality-web/core-util';
import {EntityPropertySearchParams} from 'terminology-lib/resources/codesystem/model/entity-property-search-params';

@Component({
  selector: 'twa-value-set-rule-filter-list',
  templateUrl: 'value-set-rule-filter-list.component.html',
})
export class ValueSetRuleFilterListComponent implements OnChanges {
  @Input() public codeSystem?: string;

  @Input() public filters: ValueSetRuleFilter[] = [];

  @Input() @BooleanInput() public viewMode: string | boolean = false;

  @Output() public filtersChange: EventEmitter<ValueSetRuleFilter[]> = new EventEmitter<ValueSetRuleFilter[]>();

  public loading = false;
  public properties: EntityProperty[] = [];

  public constructor(private codeSystemService: CodeSystemLibService) { }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["codeSystem"]) {
      this.properties = [];
      if (this.codeSystem) {
        this.loadEntityProperties(this.codeSystem);
      }
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

  private loadEntityProperties(codeSystem: string): void {
    const q = new EntityPropertySearchParams();
    q.codeSystem = codeSystem;
    q.limit = 10_000;
    this.loading = true;
    this.codeSystemService.searchProperties(codeSystem, q)
      .subscribe(properties => this.properties = properties.data)
      .add(() => this.loading = false);
  }
}
