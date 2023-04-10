import {Component, forwardRef, Input, OnChanges, SimpleChanges} from '@angular/core';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
import {LocalizedName} from '@kodality-web/marina-util';
import {SnomedLibService} from 'term-web/integration/_lib';
import {ValueSetLibService} from 'term-web/resources/_lib';
import {group, isDefined} from '@kodality-web/core-util';
import {map, Observable, of} from 'rxjs';

@Component({
  selector: 'tw-obs-def-protocol-value-select',
  templateUrl: './observation-definition-protocol-value-select.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ObservationDefinitionProtocolValueSelectComponent), multi: true}]
})
export class ObservationDefinitionProtocolValueSelectComponent implements OnChanges {
  @Input() public valueSet?: string;

  public value?: string[];
  public data: {[code: string]: {code: string, names: LocalizedName}} = {};
  public snomedEcl: string;

  protected drawerOpened: boolean;

  public onChange = (x: any) => x;
  public onTouched = (x: any) => x;

  public constructor(private snomedService: SnomedLibService, private valueSetService: ValueSetLibService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['valueSet'] && this.valueSet) {
      this.loadData(this.valueSet);
    }
  }

  public writeValue(obj: string[]): void {
    this.loadSelectedData(obj).subscribe(() => this.value = obj);
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

  private loadData(valueSet: string): void {
    this.valueSetService.loadRuleSet(valueSet).subscribe(ruleSet => {
      const eclRules = ruleSet.rules.filter(r => r.codeSystem === 'snomed-ct' && r.filters?.length > 0);
      this.snomedEcl = eclRules.flatMap(r => r.filters)
        .map(f => (f.operator === 'is-a' ? '<<' : f.operator === 'in' ? '^': '') + f.value)
        .join(' or ');

      ruleSet.rules = ruleSet.rules.filter(r => !(r.codeSystem === 'snomed-ct' && r.filters?.length > 0));
      this.valueSetService.expand({valueSet: valueSet, ruleSet: ruleSet}).subscribe(concepts => {
        const data = group(concepts, c => c.concept.code, c => ({code: c.concept.code, names: group([c.display, ...c.additionalDesignations], d => (d.language || 'en'), d => d.name)}));
        this.data = {...data};
      });
    });
  }

  protected onSelect(id: string): void {
    this.snomedService.loadConcept(id).subscribe(concept => {
      this.data = {...(this.data), [concept.conceptId]: {code: concept.conceptId, names: {[concept.pt.lang]: concept.pt.term}}};
      setTimeout(() => {
        this.value = [...(this.value || []), id];
        this.fireOnChange();
      }, 200);
      this.drawerOpened = false;
    });
  }

  private loadSelectedData(codes: string[]): Observable<any> {
    if (!isDefined(codes)) {
      return of();
    }
    return this.snomedService.findConcepts({conceptIds: codes}).pipe(map(resp => {
      const data = {
        ...group(resp.items, c => c.conceptId, c => ({code: c.conceptId, names: {[c.pt.lang]: c.pt.term}})),
        ...group(codes.filter(code => !resp.items.find(i => i.conceptId === code)), c => c, c => ({code: c, names: {}}))
      };
      this.data = {...data, ...this.data};
    }));
  }
}
