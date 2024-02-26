import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {BooleanInput, isDefined, validateForm} from '@kodality-web/core-util';
import {TranslateService} from '@ngx-translate/core';
import {
  ObservationDefinition,
  ObservationDefinitionComponent,
  ObservationDefinitionMapping,
  ObservationDefinitionMappingTarget
} from 'term-web/observation-definition/_lib';

@Component({
  selector: 'tw-obs-def-mapping-list',
  templateUrl: './observation-definition-mapping-list.component.html',
})
export class ObservationDefinitionMappingListComponent implements OnChanges {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public mappings!: ObservationDefinitionMapping[];
  @Input() public positionUsed: boolean;
  @Input() public dataCollectionCircumstancesUsed: boolean;

  @Input() public observationDefinition: ObservationDefinition;
  @Input() public components: ObservationDefinitionComponent[];

  @ViewChild("form") public form?: NgForm;

  protected rowInstance: ObservationDefinitionMapping = {relation: 'equivalent'};
  protected targets: ObservationDefinitionMappingTarget[];

  public constructor(private translateService: TranslateService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['observationDefinition'] && this.observationDefinition?.id) {
      this.targets = [...[{id: this.observationDefinition.id, type: 'observation-definition'}], ...(this.targets || [])];
    }
    if (changes['components'] && this.components) {
      const targets = this.components.filter(c => isDefined(c.id)).map(c => ({id: c.id, type: 'component'}));
      this.targets = [...(this.targets || []), ...targets];
    }
    if (changes['positionUsed'] && this.positionUsed) {
      this.targets = [...(this.targets || []), {type: 'position'}];
    }
    if (changes['dataCollectionCircumstancesUsed'] && this.dataCollectionCircumstancesUsed) {
      this.targets = [...(this.targets || []), {type: 'data-collection-circumstances'}];
    }
  }

  protected getTargetDisplay = (target: ObservationDefinitionMappingTarget, definition: ObservationDefinition, components: ObservationDefinitionComponent[]): string => {
    if (!isDefined(target) || !target.type) {
      return '';
    }
    const lang = this.translateService.currentLang;
    if (target?.type === 'observation-definition') {
      return definition.names?.[lang];
    }
    if (target?.type === 'component') {
      return components?.find(c => c.id === target.id)?.names?.[lang];
    }
    return target.type;
  };

  protected compareTargets = (t1: ObservationDefinitionMappingTarget, t2: ObservationDefinitionMappingTarget): boolean => {
    return t1 && t2 && (t1.id === t2.id || !t1.id && !t2.id && t1.type === t2.type);
  };

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }
}
