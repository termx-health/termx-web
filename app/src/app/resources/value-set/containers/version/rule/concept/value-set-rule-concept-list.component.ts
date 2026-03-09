import { Component, Input, OnChanges, SimpleChanges, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { BooleanInput, isDefined, validateForm, AutofocusDirective } from '@kodality-web/core-util';
import {CodeSystemLibService, ValueSetLibService, ValueSetVersionConcept, ValueSetVersionRule} from 'term-web/resources/_lib';
import { MuiCardModule, MarinPageLayoutModule, MuiCoreModule, MuiEditableTableModule, MuiNumberInputModule, MuiInputModule, MuiTextareaModule, MuiIconModule, MuiModalModule, MuiFormModule, MuiButtonModule } from '@kodality-web/marina-ui';
import { TerminologyConceptSearchComponent } from 'term-web/core/ui/components/inputs/terminology-concept-select/terminology-concept-search.component';
import { ValueSetConceptSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-concept-select.component';
import { AddButtonComponent } from 'term-web/core/ui/components/add-button/add-button.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'tw-value-set-rule-concept-list',
    templateUrl: 'value-set-rule-concept-list.component.html',
    imports: [
        MuiCardModule,
        MarinPageLayoutModule,
        MuiCoreModule,
        FormsModule,
        MuiEditableTableModule,
        MuiNumberInputModule,
        TerminologyConceptSearchComponent,
        AutofocusDirective,
        MuiInputModule,
        ValueSetConceptSelectComponent,
        MuiTextareaModule,
        MuiIconModule,
        AddButtonComponent,
        MuiModalModule,
        MuiFormModule,
        MuiButtonModule,
        TranslatePipe,
    ],
})
export class ValueSetRuleConceptListComponent implements OnChanges {
  private valueSetService = inject(ValueSetLibService);
  private codeSystemService = inject(CodeSystemLibService);

  @Input() public valueSet?: string;
  @Input() public valueSetVersion?: string;
  @Input() public lockedDate?: Date;
  @Input() public inactiveConcepts?: boolean;
  @Input() public rule?: ValueSetVersionRule;
  @Input() @BooleanInput() public viewMode: string | boolean = false;

  protected rowInstance: ValueSetVersionConcept = {additionalDesignations: [], display: {}, concept: {}};
  protected csContentPresent: boolean = true;

  protected modalData: {visible?: boolean, content?: string} = {};

  @ViewChild("form") public form?: NgForm;

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
    const displayLang = this.modalData.content.split('\n')[0].split(';')[1].split("#")[1];
    const langs = this.modalData.content.split('\n')[0].split(';').splice(2, this.modalData.content.split('\n')[0].split(';').length).map(l => l.split("#")[1]);
    this.rule.concepts = [...rows
      .map(r => this.parseRow(r))
      .filter(cols => isDefined(cols?.[0]) && cols?.[0] !== '')
      .map(cols => {
        const concept = new ValueSetVersionConcept();
        concept.concept = {code: cols?.[0]};
        concept.display = {name: cols?.[1], language: displayLang};
        const additionalDesignations = cols.slice(2, cols.length);
        concept.additionalDesignations = additionalDesignations.flatMap((ad, i) => ad.split("#").map(ads => ({name: ads, language: langs[i]})));
        concept.additionalDesignations = concept.additionalDesignations.filter(ad => isDefined(ad.name) && ad.name !== '');
        return concept;
      })];
    this.modalData.visible = false;
  }

  public openModal(): void {
    let displayLangs = this.rule.concepts?.map(c => c.display?.language);
    displayLangs = displayLangs?.filter((l, i) => displayLangs.indexOf(l) === i).filter(l => isDefined(l));
    let adLangs = this.rule.concepts?.flatMap(c => c.additionalDesignations?.map(d => d.language));
    adLangs = adLangs?.filter((l, i) => adLangs.indexOf(l) === i).filter(l => isDefined(l));
    this.modalData.content = ['code',
      ...(displayLangs?.length ? [displayLangs[0]] : [undefined]).map(l => 'display' + (l ? '#' + l : '')),
      ...(adLangs || []).map(l => 'additionalDesignation#' + l)].join(';') + '\n';
    this.rule.concepts?.forEach(c => this.modalData.content +=
      [(c.concept.code || ''), (c.display?.name || ''),
        ...adLangs.map(l => c.additionalDesignations?.filter(ad => ad.language === l)?.map(ad => ad.name).join("#"))]
        .filter(c => isDefined(c))
        .map(c => this.addBracesIfSemicolon(c))
        .join(";") + '\n');
    this.modalData.visible = true;
  }

  private addBracesIfSemicolon(str: string): string {
    if (str.includes(';')) {
      return `"${str}"`;
    }
    return str;
  }

  private parseRow(row: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of row){
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ';' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }

}
