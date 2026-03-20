import { AsyncPipe } from '@angular/common';
import { Component, inject, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ApplyPipe, AutofocusDirective, BooleanInput, isDefined, validateForm } from '@kodality-web/core-util';
import { MarinPageLayoutModule, MuiButtonModule, MuiCardModule, MuiCoreModule, MuiEditableTableModule, MuiFormModule, MuiIconModule, MuiInputModule, MuiModalModule, MuiNumberInputModule, MuiTextareaModule } from '@kodality-web/marina-ui';
import { TranslatePipe } from '@ngx-translate/core';
import { map, Observable, shareReplay } from 'rxjs';
import { AddButtonComponent } from 'term-web/core/ui/components/add-button/add-button.component';
import { TerminologyConceptSearchComponent } from 'term-web/core/ui/components/inputs/terminology-concept-select/terminology-concept-search.component';
import { StatusTagComponent } from 'term-web/core/ui/components/publication-status-tag/status-tag.component';
import { CodeSystemLibService, EntityProperty, ValueSetLibService, ValueSetVersionConcept, ValueSetVersionRule } from 'term-web/resources/_lib';
import { LocalizedConceptNamePipe } from 'term-web/resources/_lib/code-system/pipe/localized-concept-name-pipe';
import { ValueSetConceptSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-concept-select.component';
import { CodeSystemCodingReferenceService } from 'term-web/resources/code-system/services/code-system-coding-reference.service';

@Component({
    selector: 'tw-value-set-rule-concept-list',
    templateUrl: 'value-set-rule-concept-list.component.html',
    imports: [
        MuiCardModule,
        MarinPageLayoutModule,
        MuiCoreModule,
        ApplyPipe,
        AsyncPipe,
        FormsModule,
        MuiEditableTableModule,
        MuiNumberInputModule,
        TerminologyConceptSearchComponent,
        AutofocusDirective,
        MuiInputModule,
        ValueSetConceptSelectComponent,
        LocalizedConceptNamePipe,
        MuiTextareaModule,
        MuiIconModule,
        AddButtonComponent,
        StatusTagComponent,
        MuiModalModule,
        MuiFormModule,
        MuiButtonModule,
        TranslatePipe,
    ],
})
export class ValueSetRuleConceptListComponent implements OnChanges {
  private codeSystemService = inject(CodeSystemLibService);
  private codingReferenceService = inject(CodeSystemCodingReferenceService);

  @Input() public valueSet?: string;
  @Input() public valueSetVersion?: string;
  @Input() public lockedDate?: Date;
  @Input() public inactiveConcepts?: boolean;
  @Input() public rule?: ValueSetVersionRule;
  @Input() @BooleanInput() public viewMode: string | boolean = false;

  protected rowInstance: ValueSetVersionConcept = {additionalDesignations: [], display: {}, concept: {}};
  protected csContentPresent: boolean = true;
  protected conceptReferenceProperty: EntityProperty = {type: 'Coding'};
  private statusCache = new Map<string, Observable<string | undefined>>();

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

  protected conceptReferenceValue = (item: ValueSetVersionConcept): {code?: string, codeSystem?: string, codeSystemVersion?: string} => {
    return {
      code: item?.concept?.code,
      codeSystem: item?.concept?.codeSystem || this.rule?.codeSystem,
      codeSystemVersion: this.rule?.codeSystemVersion?.version
    };
  };

  protected conceptReferenceStatus = (item: ValueSetVersionConcept, code?: string): Observable<string | undefined> => {
    const key = [
      item?.concept?.codeSystem || this.rule?.codeSystem || '',
      code || item?.concept?.code || '',
      this.rule?.codeSystemVersion?.version || ''
    ].join('|');

    if (!this.statusCache.has(key)) {
      this.statusCache.set(
        key,
        this.codingReferenceService.load(this.conceptReferenceProperty, this.conceptReferenceValue(item))
          .pipe(
            map(reference => reference?.status),
            shareReplay({bufferSize: 1, refCount: true})
          )
      );
    }

    return this.statusCache.get(key)!;
  };

  protected getCodeLabel = (name: string | undefined, code: string | undefined): string | undefined => {
    if (!name) {
      return code;
    }
    if (!code || name === code) {
      return name;
    }
    return `${code} ${name}`;
  };

}
