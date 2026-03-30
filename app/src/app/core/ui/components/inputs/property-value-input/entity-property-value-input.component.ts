import {Component, DoCheck, forwardRef, Input, OnChanges, SimpleChanges, ViewChild, inject} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgForm, FormsModule } from '@angular/forms';
import { BooleanInput, DestroyService, isDefined, validateForm, ApplyPipe, IncludesPipe, LocalDatePipe, ToBooleanPipe } from '@termx-health/core-util';
import {EntityProperty} from 'term-web/resources/_lib';
import { MuiFormModule, MuiTextareaModule, MuiCheckboxModule, MuiDatePickerModule, MuiNumberInputModule, MuiSelectModule, MuiTooltipModule } from '@termx-health/ui';
import { AsyncPipe } from '@angular/common';
import { TerminologyConceptSearchComponent } from 'term-web/core/ui/components/inputs/terminology-concept-select/terminology-concept-search.component';
import { CodeSystemSearchComponent } from 'term-web/resources/_lib/code-system/containers/code-system-search.component';
import { ValueSetConceptSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-concept-select.component';
import { LocalizedConceptNamePipe } from 'term-web/resources/_lib/code-system/pipe/localized-concept-name-pipe';
import { CodeSystemCodingReferenceService, CodingReferenceSummary } from 'term-web/resources/code-system/services/code-system-coding-reference.service';
import { environment } from 'environments/environment';


@Component({
    selector: 'tw-property-value-input',
    templateUrl: './entity-property-value-input.component.html',
    styles: [`
      .coding-compact-view {
        display: inline-flex;
        align-items: baseline;
        gap: 0.5rem;
        flex-wrap: wrap;
        max-width: 100%;
      }
    `],
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => EntityPropertyValueInputComponent), multi: true },
        DestroyService
    ],
    imports: [FormsModule, MuiFormModule, MuiTextareaModule, MuiCheckboxModule, MuiDatePickerModule, MuiNumberInputModule, TerminologyConceptSearchComponent, CodeSystemSearchComponent, MuiSelectModule, ValueSetConceptSelectComponent, MuiTooltipModule, AsyncPipe, ApplyPipe, IncludesPipe, LocalDatePipe, ToBooleanPipe, LocalizedConceptNamePipe]
})
export class EntityPropertyValueInputComponent implements OnChanges, DoCheck, ControlValueAccessor {
  private codingReferenceService = inject(CodeSystemCodingReferenceService);

  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() @BooleanInput() public required: boolean | string = false;
  @Input() @BooleanInput() public showCodingReference: boolean | string = false;
  @Input() @BooleanInput() public showStatus: boolean | string = false;
  @Input() @BooleanInput() public compact: boolean | string = false;
  @Input() public codeSystem?: string;
  @Input() public property?: EntityProperty;

  @ViewChild("form") public form?: NgForm;

  public value?: any;
  protected codingReference?: CodingReferenceSummary;
  protected embedded = !!environment.embedded;
  private lastReferenceKey?: string;

  public onChange = (x: any): void => x;
  public onTouched = (x: any): void => x;

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['property'] && this.property) {
      this.prepareValue(this.property);
    }
    if (changes['property'] || changes['showCodingReference'] || changes['compact']) {
      this.refreshCodingReference();
    }
  }

  public ngDoCheck(): void {
    this.refreshCodingReference();
  }

  public writeValue(obj: any): void {
    this.value = obj;
    this.prepareValue(this.property);
  }

  public fireOnChange(): void {
    this.onChange(this.value);
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public valid(): boolean {
    return validateForm(this.form);
  }

  protected codingType = (property: EntityProperty): string => {
    if (isDefined(property?.rule?.valueSet)) {
      return 'value-set';
    }
    if (property?.rule?.codeSystems?.length > 0) {
      return 'code-system';
    }
    return 'undefined';
  };

  protected getFilterPropertyValues = (property: EntityProperty): string => {
    return property.rule?.filters
      ?.filter(f => (isDefined(f.property?.name) || isDefined(f.association)) && isDefined(f.value))
      ?.map(f => (f.property?.name || f.association) + '|' + (f.value?.code || f.value))
      .join(';');
  };

  private prepareValue(property: EntityProperty): void {
    if (property?.type === 'Coding') {
      this.value ??= {};
    }
    if (property?.type === 'dateTime' && typeof this.value === 'string' && this.value) {
      // Convert ISO date string to Date object for date picker
      try {
        this.value = new Date(this.value);
      } catch {
        // ignore invalid date strings
      }
    }
  }

  private refreshCodingReference(): void {
    const referenceKey = this.getReferenceKey();
    if (referenceKey === this.lastReferenceKey) {
      return;
    }

    this.lastReferenceKey = referenceKey;
    this.codingReference = undefined;

    if (!referenceKey) {
      return;
    }

    this.codingReferenceService.load(this.property, this.value).subscribe(reference => {
      if (referenceKey === this.lastReferenceKey) {
        this.codingReference = reference;
      }
    });
  }

  private getReferenceKey(): string | undefined {
    if (!this.showCodingReference || !this.property || this.property.type !== 'Coding') {
      return undefined;
    }

    return [
      this.property?.id ?? this.property?.name ?? '',
      this.value?.codeSystem ?? '',
      this.value?.code ?? '',
      this.value?.codeSystemVersion ?? '',
      this.compact ? 'compact' : 'default'
    ].join('|');
  }
}
