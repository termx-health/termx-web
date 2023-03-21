import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {CodeSystemLibService, EntityProperty, EntityPropertySearchParams, ValueSetRuleFilter} from 'term-web/resources/_lib';
import {BooleanInput, copyDeep, isDefined} from '@kodality-web/core-util';


@Component({
  selector: 'tw-value-set-rule-filter-list',
  templateUrl: 'value-set-rule-filter-list.component.html',
})
export class ValueSetRuleFilterListComponent implements OnChanges {
  @Input() public codeSystem?: string;
  @Input() public filters: ValueSetRuleFilter[] = [];
  @Input() @BooleanInput() public viewMode: string | boolean = false;

  @Output() public filtersChange: EventEmitter<ValueSetRuleFilter[]> = new EventEmitter<ValueSetRuleFilter[]>();

  public loading = false;
  public properties: EntityProperty[] = [];

  public modalData: {
    visible?: boolean,
    index?: number,
    filter?: ValueSetRuleFilter
  } = {};

  public constructor(private codeSystemService: CodeSystemLibService) { }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["codeSystem"] && this.codeSystem) {
      this.loadEntityProperties(this.codeSystem);
    }
  }

  public addRow(): void {
    this.filters = [...this.filters || []];
    this.toggleModal({});
  }

  public removeRow(index: number): void {
    this.filters.splice(index, 1);
    this.filters = [...this.filters];
    this.filtersChange.emit(this.filters);
  }

  public toggleModal(filter?: ValueSetRuleFilter, index?: number): void {
    this.modalData = {
      visible: !!filter,
      filter: copyDeep(filter),
      index: index,
    };
  }

  public confirmModalFilter(): void {
    if (isDefined(this.modalData.index)) {
      this.filters[this.modalData.index!] = this.modalData.filter!;
      this.filters = [...this.filters];
    } else {
      this.filters = [...this.filters, this.modalData.filter!];
    }

    this.filtersChange.emit(this.filters);
    this.modalData.visible = false;
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
