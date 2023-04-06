import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {BooleanInput, isDefined, validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';
import {
  ObservationDefinition,
  ObservationDefinitionComponent,
  ObservationDefinitionMapping,
  ObservationDefinitionMappingTarget
} from 'term-web/observation-definition/_lib';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'tw-obs-def-mapping-list',
  templateUrl: './observation-definition-mapping-list.component.html',
})
export class ObservationDefinitionMappingListComponent implements OnChanges {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public mappings!: ObservationDefinitionMapping[];

  @Input() public observationDefinition: ObservationDefinition;
  @Input() public components: ObservationDefinitionComponent[];

  @ViewChild("form") public form?: NgForm;

  protected rowInstance: ObservationDefinitionMapping = {relation: 'equivalent'};
  protected targets: ObservationDefinitionMappingTarget[];

  public constructor(private translateService: TranslateService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['observationDefinition'] && this.observationDefinition) {
      this.targets = [...[{id: this.observationDefinition.id, type: 'observation-definition'}], ...(this.targets || [])];
    }
    if (changes['components'] && this.components) {
      const targets = this.components.filter(c => isDefined(c.id)).map(c => ({id: c.id, type: 'component'}));
      this.targets = [...(this.targets || []), ...targets];
    }
  }

  protected getTargetDisplay = (target: ObservationDefinitionMappingTarget, definition: ObservationDefinition, components: ObservationDefinitionComponent[]): string => {
    if (!isDefined(target) || !target.type || !target.id) {
      return '';
    }
    const lang = this.translateService.currentLang;
    if (target?.type === 'observation-definition') {
      return definition.names?.[lang];
    }
    if (target?.type === 'component') {
      return components?.find(c => c.id === target.id)?.names?.[lang];
    }
    return '';
  };

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }
}
