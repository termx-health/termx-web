import {Component, EventEmitter, Input, Output} from '@angular/core';
import {BooleanInput, copyDeep, isDefined} from '@kodality-web/core-util';
import {ValueSetVersionConcept} from 'lib/src/resources';
import {SnomedLibService} from 'terminology-lib/integration';
import {MeasurementUnit} from 'terminology-lib/measurementunit';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'twa-value-set-rule-concept-list',
  templateUrl: 'value-set-rule-concept-list.component.html',
})
export class ValueSetRuleConceptListComponent {
  @Input() public codeSystem?: string;
  @Input() public codeSystemVersionId?: number;
  @Input() public lockedDate?: Date;
  @Input() public inactiveConcepts?: Boolean;
  @Input() public concepts: ValueSetVersionConcept[] = [];
  @Input() @BooleanInput() public viewMode: string | boolean = false;

  @Output() public conceptsChange: EventEmitter<ValueSetVersionConcept[]> = new EventEmitter<ValueSetVersionConcept[]>();

  public modalData: {
    visible?: boolean,
    index?: number,
    concept?: ValueSetVersionConcept
    measurementUnit?: MeasurementUnit
  } = {};

  public constructor(
    private snomedService: SnomedLibService,
    private translateService: TranslateService
  ) {}

  public addRow(): void {
    this.concepts = [...this.concepts || []];
    this.toggleModal({});
  }

  public removeRow(index: number): void {
    this.concepts.splice(index, 1);
    this.concepts = [...this.concepts];
    this.conceptsChange.emit(this.concepts);
  }

  public toggleModal(concept?: ValueSetVersionConcept, index?: number): void {
    this.modalData = {
      visible: !!concept,
      concept: copyDeep(concept),
      index: index,
    };
  }

  public confirmModalConcept(): void {
    if (isDefined(this.modalData.index)) {
      this.concepts[this.modalData.index!] = this.modalData.concept!;
      this.concepts = [...this.concepts];
    } else {
      this.concepts = [...this.concepts, this.modalData.concept!];
    }

    this.conceptsChange.emit(this.concepts);
    this.modalData.visible = false;
  }

  public conceptSelected(conceptId: string): void {
    if (!conceptId) {
      return;
    }
    this.snomedService.loadConcept(conceptId).subscribe(concept => {
      this.modalData.concept = {
        concept: {code: concept.conceptId, codeSystem: this.codeSystem},
        display: {name: concept.pt?.term, language: concept.pt?.lang}
      };
      this.confirmModalConcept();
    });
  }

  public measurementUnitSelected(mu: MeasurementUnit): void {
    if (!mu) {
      return;
    }
    const lang = this.translateService.currentLang;
    this.modalData.concept = {
      concept: {code: mu.code, codeSystem: this.codeSystem},
      display: {name: mu.names?.[lang], language: lang }
    };
  }
}
