import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TransformationDefinition, TransformationDefinitionResource} from 'term-web/modeler/transformer/services/transformation-definition';

@Component({
  selector: 'tw-transformation-definition-resources',
  templateUrl: './transformation-definition-resources.component.html',
  styles: [`
    @import "../../../../styles/variables";

    
    .resource {
      padding: 0 0.5rem 0 1rem;
      border-left: 1px dashed @mui-border-color;
      cursor: pointer;
      margin-left: 0.5rem;

      &:hover {
        background: @mui-border-color-light;
      }
      
      &--selected {
        color: @mui-primary-color-6;
        background: @mui-border-color-light;
      }

      &--invalid {
        color: @mui-error;
      }
    }
    
    .resource-dir {
      font-weight: 800
    }
    
    .resource-add {
      padding: 0 0.5rem 0 1rem;
    }
  `]
})
export class TransformationDefinitionResourcesComponent {
  @Input() public definition: TransformationDefinition;
  @Input() public selected: TransformationDefinitionResource;
  @Output() public selectedChange = new EventEmitter<TransformationDefinitionResource>();
  public types = ['definition'];

  public onSelect(resource: TransformationDefinitionResource): void {
    this.selected = resource;
    this.selectedChange.emit(this.selected);
  }

  public onAdd(type: string): void {
    const resource = new TransformationDefinitionResource();
    resource.type = type;
    resource.reference = {};
    this.definition.resources = [...this.definition.resources, resource];
    this.onSelect(resource);
  }

  protected filterType = (r: TransformationDefinitionResource, type: string): boolean => {
    return r.type === type;
  };

  protected isInvalid = (r: TransformationDefinitionResource, dummy: TransformationDefinitionResource): boolean => {
    return !TransformationDefinitionResource.isValid(r);
  };

}
