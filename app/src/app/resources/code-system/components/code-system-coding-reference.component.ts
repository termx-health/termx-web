import { Component, DoCheck, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { MuiDividerModule } from '@kodality-web/marina-ui';
import { BooleanInput } from '@kodality-web/core-util';
import { StatusTagComponent } from 'term-web/core/ui/components/publication-status-tag/status-tag.component';
import { EntityProperty } from 'term-web/resources/_lib';
import { CodeSystemCodingReferenceService, CodingReferenceSummary } from 'term-web/resources/code-system/services/code-system-coding-reference.service';

@Component({
  selector: 'tw-code-system-coding-reference',
  standalone: true,
  template: `
    @if (reference) {
      <span class="coding-reference" [class.coding-reference--compact]="compact">
        @if (reference.status) {
          <m-divider mVertical />
          <tw-status-tag [status]="reference.status" compact />
        }
        @if (reference.version) {
          <m-divider mVertical />
          <span>{{ reference.version }}</span>
        }
        @if (!compact && reference.href) {
          <m-divider mVertical />
          <a [href]="reference.href" target="_blank" rel="noopener noreferrer">{{ reference.code }}</a>
        }
      </span>
    }
  `,
  styles: [`
    .coding-reference {
      display: inline-flex;
      align-items: center;
      gap: .5rem;
      flex-wrap: wrap;
      font-size: 12px;
      color: var(--text-color-secondary);
    }

    .coding-reference--compact {
      gap: .15rem;
    }
  `],
  imports: [MuiDividerModule, StatusTagComponent]
})
export class CodeSystemCodingReferenceComponent implements OnChanges, DoCheck {
  private codingReferenceService = inject(CodeSystemCodingReferenceService);

  @Input() @BooleanInput() public compact: boolean | string = false;
  @Input() public property?: EntityProperty;
  @Input() public value?: any;

  protected reference?: CodingReferenceSummary;
  private lastLookupKey?: string;

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['property'] || changes['value']) {
      this.refreshReference();
    }
  }

  public ngDoCheck(): void {
    this.refreshReference();
  }

  private refreshReference(): void {
    const lookupKey = this.getLookupKey();
    if (lookupKey === this.lastLookupKey) {
      return;
    }
    this.lastLookupKey = lookupKey;
    this.loadReference();
  }

  private loadReference(): void {
    this.reference = undefined;
    const lookupKey = this.lastLookupKey;
    this.codingReferenceService.load(this.property, this.value).subscribe(reference => {
      if (lookupKey === this.lastLookupKey) {
        this.reference = reference;
      }
    });
  }

  private getLookupKey(): string | undefined {
    if (this.property?.type !== 'Coding') {
      return undefined;
    }

    return [
      this.property?.id ?? this.property?.name ?? '',
      this.value?.codeSystem ?? '',
      this.value?.code ?? '',
      this.value?.codeSystemVersion ?? ''
    ].join('|');
  }
}
