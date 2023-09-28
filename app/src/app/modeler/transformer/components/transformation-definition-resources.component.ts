import {Component, Input, OnInit} from '@angular/core';
import {TransformationDefinition, TransformationDefinitionResource} from 'term-web/modeler/transformer/services/transformation-definition';
import {remove} from '@kodality-web/core-util';

@Component({
  selector: 'tw-transformation-definition-resources',
  templateUrl: './transformation-definition-resources.component.html',
  styles: [`
    @import "../../../../styles/variables";

    .tw-transformation-definition-collapse-panel {
      z-index: 1;

      ::ng-deep .m-collapse-panel_container--collapsed {
        width: 0px !important;
      }

      ::ng-deep .m-collapse-panel_content__wrapper {
        padding: 0 1rem 0 0;
      }
    }

    .tw-transformation-definition-container {
      flex: 1;
      padding-left: 1rem;
      border-left: 1px solid var(--color-borders);
      position: relative
    }

    ::ng-deep .fml-editor {
      z-index: 1000;
      position: fixed;
      inset: 0;
      border: 0;
      height: 100%;
      width: 100%;
      visibility: hidden;
    }

    .resource {
      padding: 0 0.5rem 0 1rem;
      border-left: 1px dashed @mui-border-color;
      cursor: pointer;
      margin-left: 0.5rem;
      word-break: break-all;

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
export class TransformationDefinitionResourcesComponent implements OnInit {
  @Input() public definition: TransformationDefinition;
  public types: TransformationDefinitionResource['type'][] = ['definition', 'conceptmap', 'mapping'];
  public selectedResource: TransformationDefinitionResource;

  public ngOnInit(): void {
    this.selectResource(this.definition.mapping);
  }

  public onAdd(type: any): void {
    const resource = new TransformationDefinitionResource();
    resource.type = type;
    resource.reference = {};
    this.definition.resources = [...this.definition.resources, resource];
    this.selectResource(resource);
  }

  protected selectResource(r: TransformationDefinitionResource): void {
    this.selectedResource = r;
  }

  protected filterType = (r: TransformationDefinitionResource, type: string): boolean => {
    return r.type === type;
  };

  protected deleteResource(r: TransformationDefinitionResource): void {
    this.selectedResource = null;
    this.definition.resources = remove(this.definition.resources, r);
  }

  protected isResourceInvalid = (r: TransformationDefinitionResource, dummy: any): boolean => {
    return !TransformationDefinitionResource.isValid(r);
  };

  protected compactName(name: string, source: TransformationDefinitionResource['source']): string {
    if (source === 'url') {
      return name?.includes("/") ? name.substring(name.lastIndexOf('/') + 1) : name;
    }
    return name;
  }
}
