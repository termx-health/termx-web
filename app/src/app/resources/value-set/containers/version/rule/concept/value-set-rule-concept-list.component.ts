import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {BooleanInput, isDefined, validateForm} from '@kodality-web/core-util';
import {CodeSystemLibService, ValueSetLibService, ValueSetVersionConcept, ValueSetVersionRule} from 'app/src/app/resources/_lib';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'tw-value-set-rule-concept-list',
  templateUrl: 'value-set-rule-concept-list.component.html',
})
export class ValueSetRuleConceptListComponent implements OnChanges {
  @Input() public valueSet?: string;
  @Input() public valueSetVersion?: string;
  @Input() public lockedDate?: Date;
  @Input() public inactiveConcepts?: Boolean;
  @Input() public rule?: ValueSetVersionRule;
  @Input() @BooleanInput() public viewMode: string | boolean = false;

  protected rowInstance: ValueSetVersionConcept = {additionalDesignations: [], display: {}, concept: {}};
  protected csContentPresent: boolean = true;

  protected modalData: {visible?: boolean, content?: string} = {};

  @ViewChild("form") public form?: NgForm;

  public constructor(private valueSetService: ValueSetLibService, private codeSystemService: CodeSystemLibService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['rule'] && this.rule?.codeSystem) {
      if (['snomed-ct', 'ucum', 'observation-definition'].includes(this.rule.codeSystem)) {
        return;
      }
      this.codeSystemService.load(this.rule.codeSystem).subscribe(cs => {
        this.csContentPresent = cs.content !== 'not-present';
      });
    }
  }

  protected removeDesignation(c: ValueSetVersionConcept, i: number): void {
    c.additionalDesignations?.splice(i, 1);
    c.additionalDesignations = [...c.additionalDesignations];
  }

  protected addDesignation(c: ValueSetVersionConcept): void {
    c.additionalDesignations = [...(c.additionalDesignations || []), {}];
  }

  public validate(): boolean {
    return validateForm(this.form);
  }

  protected addConcepts(): void {
    const rows = this.modalData.content.split('\n').slice(1, this.modalData.content.split('\n').length);
    const langs = this.modalData.content.split('\n')[0].split(',').splice(2, this.modalData.content.split('\n')[0].split(',').length).map(l => l.split("#")[1]);
    this.rule.concepts = [...rows.map(r => {
      const concept = new ValueSetVersionConcept();
      const cols = r.split(',');
      concept.concept = {code: cols?.[0]};
      concept.display = {name: cols?.[1]};
      const additionalDesignations = cols.slice(2, cols.length);
      concept.additionalDesignations = additionalDesignations.map((ad, i) => ({name: ad, language: langs[i]}));
      return concept;
    })];
    this.modalData.visible = false;
  }

  public openModal(): void {
    let langs = this.rule.concepts?.flatMap(c => c.additionalDesignations?.map(d => d.language));
    langs = langs.filter((l, i) => langs.indexOf(l) === i).filter(l => isDefined(l));
    this.modalData.content = ['ConceptId', 'Display', ...(langs || []).map(l => 'lang#' + l)].join(',') + '\n';
    this.rule.concepts?.forEach(c => this.modalData.content +=
      [(c.concept.code || ''), (c.display?.name || ''), ...langs.map(l => c.additionalDesignations?.find(ad => ad.language === l)?.name)].filter(c => isDefined(c)).join(",") + '\n');
    this.modalData.visible = true;
  }
}
