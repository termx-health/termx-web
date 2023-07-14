import {Component, Input} from '@angular/core';
import {TransformationDefinition, TransformationDefinitionMapping} from '../services/transformation-definition';
import {TransformationDefinitionService} from 'term-web/modeler/transformer/services/transformation-definition.service';

@Component({
  selector: 'tw-transformation-definition-mapping-form',
  templateUrl: './transformation-definition-mapping-form.component.html',
})
export class TransformationDefinitionMappingFormComponent {
  @Input() public definition: TransformationDefinition;
  @Input() public mapping: TransformationDefinitionMapping;

  public constructor(private transformationDefinitionService: TransformationDefinitionService) {
  }

  protected generateMapping(): void {
    this.transformationDefinitionService.generateFml(this.definition).subscribe(r => this.mapping.reference.content = r);
  }
}
