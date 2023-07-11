import {Component, Input} from '@angular/core';
import {TransformationDefinitionResource} from '../services/transformation-definition';
import {StructureDefinition} from 'term-web/modeler/_lib';

@Component({
  selector: 'tw-transformation-definition-resource-form',
  templateUrl: './transformation-definition-resource-form.component.html',
})
export class TransformationDefinitionResourceFormComponent {
  @Input() public resource: TransformationDefinitionResource;

  public onDefinitionSelect(def: StructureDefinition): void {
    this.resource.reference.structureDefinitionId = def.id;
    this.resource.name = def.code;
  }
}
