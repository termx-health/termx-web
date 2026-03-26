import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {BooleanInput, validateForm} from '@kodality-web/core-util';
import {CodeSystemLibService, EntityProperty, EntityPropertySearchParams, ValueSetRuleFilter} from 'term-web/resources/_lib';
import { MuiCardModule, MarinPageLayoutModule, MuiEditableTableModule, MuiSelectModule } from '@kodality-web/marina-ui';
import { EntityPropertyValueInputComponent } from 'term-web/core/ui/components/inputs/property-value-input/entity-property-value-input.component';
import { TranslatePipe } from '@ngx-translate/core';
import { CodeSystemCodingReferenceComponent } from 'term-web/resources/code-system/components/code-system-coding-reference.component';


@Component({
    selector: 'tw-value-set-rule-filter-list',
    templateUrl: 'value-set-rule-filter-list.component.html',
    imports: [
        MuiCardModule,
        MarinPageLayoutModule,
        FormsModule,
        MuiEditableTableModule,
        MuiSelectModule,
        EntityPropertyValueInputComponent,
        CodeSystemCodingReferenceComponent,
        TranslatePipe,
    ],
})
export class ValueSetRuleFilterListComponent implements OnChanges {
  private codeSystemService = inject(CodeSystemLibService);

  @Input() public codeSystem?: string;
  @Input() public filters: ValueSetRuleFilter[] = [];
  @Input() @BooleanInput() public viewMode: string | boolean = false;

  @ViewChild("form") public form?: NgForm;

  @Output() public filtersChange: EventEmitter<ValueSetRuleFilter[]> = new EventEmitter<ValueSetRuleFilter[]>();

  public loading = false;
  public properties: EntityProperty[] = [];

  public rowInstance: ValueSetRuleFilter = {property: {}};

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
