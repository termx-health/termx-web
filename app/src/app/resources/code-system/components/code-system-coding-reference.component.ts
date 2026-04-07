import { Component, DoCheck, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { MuiDividerModule } from '@termx-health/ui';
import { BooleanInput } from '@termx-health/core-util';
import { environment } from 'environments/environment';
import { StatusTagComponent } from 'term-web/core/ui/components/publication-status-tag/status-tag.component';
import { EntityProperty } from 'term-web/resources/_lib';
import { CodeSystemCodingReferenceService, CodingReferenceSummary } from 'term-web/resources/code-system/services/code-system-coding-reference.service';

@Component({
  selector: 'tw-code-system-coding-reference',
  standalone: true,
  template: `
    @if (displayCode) {
      <span class="coding-reference">
        @if (!compact) {
          @if (reference?.href) {
            @if (embedded) {
              <a [href]="reference?.href">{{ displayCode }}</a>
            } @else {
              <a [href]="reference?.href" target="_blank" rel="noopener noreferrer">{{ displayCode }}</a>
            }
          } @else {
            <a>{{ displayCode }}</a>
          }
        }
        @if (reference?.status) {
          <m-divider mVertical />
          <tw-status-tag [status]="reference?.status" [extraText]="reference?.version ? '| ' + reference?.version : undefined" compact />
        }
      </span>
    }
  `,
  styles: [`
    .coding-reference {
      display: flex;
      align-items: center;
      gap: .25rem;
      flex-wrap: wrap;
      font-size: 12px;
      color: var(--text-color-secondary);
    }

    .coding-reference a {
      font-size: 14px;
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

  protected readonly embedded = !!environment.embedded;

  protected get displayCode(): string | undefined {
    return this.reference?.code || this.value?.code;
  }

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
