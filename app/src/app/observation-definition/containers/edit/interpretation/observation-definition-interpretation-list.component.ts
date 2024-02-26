import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {BooleanInput, copyDeep, isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {TranslateService} from '@ngx-translate/core';
import {
  ObservationDefinition,
  ObservationDefinitionComponent,
  ObservationDefinitionInterpretation,
  ObservationDefinitionInterpretationRange,
  ObservationDefinitionInterpretationState,
  ObservationDefinitionInterpretationTarget,
  ObservationDefinitionLibService
} from 'term-web/observation-definition/_lib';

@Component({
  selector: 'tw-obs-def-interpretation-list',
  templateUrl: './observation-definition-interpretation-list.component.html',
})
export class ObservationDefinitionInterpretationListComponent implements OnInit, OnChanges {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public interpretations!: ObservationDefinitionInterpretation[];

  @Input() public components: ObservationDefinitionComponent[];

  @ViewChild("form") public form?: NgForm;

  protected loader = new LoadingManager();
  protected rowInstance: ObservationDefinitionInterpretation = {state: {}, range: {numericRange: {}, codeSystemConcepts: []}};
  protected targets: ObservationDefinitionInterpretationTarget[];
  protected observationDefinitions: ObservationDefinition[];

  protected stateModalData: {visible?: boolean, state?: ObservationDefinitionInterpretationState, source?: ObservationDefinitionInterpretationState} = {};
  protected rangeModalData: {visible?: boolean, range?: ObservationDefinitionInterpretationRange, source?: ObservationDefinitionInterpretationRange, target?: ObservationDefinitionInterpretationTarget} = {};

  public constructor(private observationDefinitionService: ObservationDefinitionLibService, private translateService: TranslateService) {}

  public ngOnInit(): void {
    this.loader.wrap('def', this.observationDefinitionService.search({types: 'Quantity,integer,CodeableConcept', decoratedValue: true, limit: -1}))
      .subscribe(resp => {
        this.observationDefinitions = resp.data;

        const targets = resp.data.map(od => ({id: od.id, type: 'observation-definition'}));
        this.targets = [...targets, ...(this.targets || [])];
      });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['components'] && this.components) {
      const targets = this.components.filter(c => isDefined(c.id) && ['Quantity', 'integer', 'CodeableConcept'].includes(c.type))
        .map(c => ({id: c.id, type: 'component'}));
      this.targets = [...targets, ...(this.targets || [])];
    }

    if (changes['interpretations'] && this.interpretations) {
      this.interpretations.forEach(i => {
        i.state ??= {};
        i.state.age ??= {};
        i.state.gestationAge ??= {};
        i.range ??= {};
        i.range.numericRange ??= {};
      });
    }
  }

  protected toggleStateModal(state?: ObservationDefinitionInterpretationState): void {
    this.stateModalData = {visible: isDefined(state), state: copyDeep(state), source: state};
  }

  protected toggleRangeModal(range?: ObservationDefinitionInterpretationRange, target?: ObservationDefinitionInterpretationTarget): void {
    this.rangeModalData = {visible: isDefined(range), range: copyDeep(range), source: range, target: target};
  }


  protected confirmStateModal(): void {
    const i = this.interpretations.find(i => i.state === this.stateModalData.source);
    i.state = {
      gender: this.stateModalData.state.gender,
      age: this.stateModalData.state.age,
      gestationAge: this.stateModalData.state.gestationAge
    };

    this.stateModalData = {state: {age: {}, gestationAge: {}}};
  }

  protected confirmRangeModal(): void {
    const numeric = this.checkType(this.rangeModalData.target, this.observationDefinitions, this.components, 'numeric');
    const codeableConcept = this.checkType(this.rangeModalData.target, this.observationDefinitions, this.components, 'CodeableConcept');

    const i = this.interpretations.find(i => i.range === this.rangeModalData.source);
    i.range = {
      numericRange: numeric ? this.rangeModalData.range.numericRange : undefined,
      valueSet: codeableConcept ? this.rangeModalData.range.valueSet : undefined,
      codeSystem: codeableConcept ? this.rangeModalData.range.codeSystem : undefined,
      codeSystemConcepts: codeableConcept ? this.rangeModalData.range.codeSystemConcepts : undefined
    };

    this.rangeModalData = {range: {}};
  }

  protected checkType = (target: ObservationDefinitionInterpretationTarget, definitions: ObservationDefinition[], components: ObservationDefinitionComponent[], type: 'numeric' | 'CodeableConcept' | 'complex'): boolean => {
    if (!isDefined(target) || !target.type || !target.id) {
      return undefined;
    }

    let targetType = undefined;
    if (target?.type === 'observation-definition') {
      targetType = definitions?.find(od => od.id === target.id)?.value?.type;
    }
    if (target?.type === 'component') {
      targetType = components?.find(c => c.id === target.id)?.type;
    }

    if (type === 'numeric') {
      return ['integer', 'Quantity'].includes(targetType);
    }
    if (type === 'CodeableConcept') {
      return targetType === 'CodeableConcept';
    }
    if (type === 'complex') {
      return ['integer', 'Quantity', 'CodeableConcept'].includes(targetType);
    }
    return false;
  };

  protected getTargetDisplay = (target: ObservationDefinitionInterpretationTarget, definitions: ObservationDefinition[], components: ObservationDefinitionComponent[]): string => {
    if (!isDefined(target) || !target.type || !target.id) {
      return '';
    }
    const lang = this.translateService.currentLang;
    if (target?.type === 'observation-definition') {
      return definitions?.find(od => od.id === target.id)?.names?.[lang];
    }
    if (target?.type === 'component') {
      return components?.find(c => c.id === target.id)?.names?.[lang];
    }
    return '';
  };

  protected getStateDisplay = (state: ObservationDefinitionInterpretationState, def?: string): string => {
    if (!isDefined(state)) {
      return def || '';
    }
    const display = [state.gender, state.age ? ((state.age.min || '...') + '-' + (state.age.max || '...')) : undefined].filter(s => isDefined(s));
    return display.length > 0 ? display.join(' ') : (def || '');
  };

  protected getRangeDisplay = (range: ObservationDefinitionInterpretationRange, target: ObservationDefinitionInterpretationTarget, def?: string): string => {
    const numeric = this.checkType(target, this.observationDefinitions, this.components, 'numeric');
    const codeableConcept = this.checkType(target, this.observationDefinitions, this.components, 'CodeableConcept');

    if (codeableConcept) {
      if (!range.valueSet && !range.codeSystem && !range.codeSystemConcepts) {
        return def || '';
      }
      const display = [range.valueSet, range.codeSystem, ...(range.codeSystemConcepts || [])].filter(s => isDefined(s));
      return display.length > 0 ? display.join(' | ') : (def || '');
    }

    if (numeric) {
      return ((range.numericRange?.min || '...') + '-' + (range.numericRange?.max || '...'));
    }

    return def || '';
  };

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }
}
