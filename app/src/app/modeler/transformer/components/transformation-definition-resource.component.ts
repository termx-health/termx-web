import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {unique, uniqueBy, group, LoadingManager} from '@kodality-web/core-util';
import {TransformationDefinition, TransformationDefinitionResource} from 'term-web/modeler/_lib/transformer/transformation-definition';
import {TransformationDefinitionService} from 'term-web/modeler/transformer/services/transformation-definition.service';

@Component({
  selector: 'tw-transformation-definition-resource',
  templateUrl: './transformation-definition-resource.component.html',
  styles: [`
    @import "../../../../styles/variables";

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

      &--imported {
        color: var(--color-green-7);
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
export class TransformationDefinitionResourceComponent implements OnInit {
  @Input() public definition: TransformationDefinition;
  @Input() public type: TransformationDefinitionResource['type'];

  @Input() public selectedResource: TransformationDefinitionResource;
  @Output() public selectedResourceChange = new EventEmitter<TransformationDefinitionResource>()

  protected loader = new LoadingManager<'import'>();

  public constructor(
    private service: TransformationDefinitionService
  ) { }

  public ngOnInit(): void {
    this.onResourceSelect(this.definition.mapping);
  }

  protected onResourceSelect(r: TransformationDefinitionResource): void {
    this.selectedResource = r;
    this.selectedResourceChange.emit(r);
  }

  public onResourceAdd(type: TransformationDefinitionResource['type']): void {
    const resource = new TransformationDefinitionResource();
    resource.type = type;
    resource.reference = {};
    this.definition.resources = [...this.definition.resources, resource];
    this.onResourceSelect(resource);
  }

  protected onResourceDelete(r: TransformationDefinitionResource): void {
    // todo: call from parent

    // this.selectedResource = null;
    // this.definition.resources = remove(this.definition.resources, r);
  }

  protected importResourcesFromImportMaps(): void {
    const importMapIds = this.definition.resources
      .filter(r => r.type === 'mapping')
      .filter(r => r.source === 'local')
      .map(im => im.reference.localId)
      .filter(unique);

    this.loader.wrap('import', this.service.search({
      ids: importMapIds.join(','),
      limit: importMapIds.length
    })).subscribe(resp => {
      const resources = resp.data.flatMap(td => td.resources ?? []).filter(r => r.type === 'definition');
      const resourcesUnique = uniqueBy(resources, r => r.name);

      const merged = {
        ...group(this.definition.resources, r => r.name),
        ...group(resourcesUnique, r => r.name, r => ({...r, _imported: true}))
      };

      this.definition.resources = Object.values(merged);
    });
  }


  // Utils

  protected filterByType = (r: TransformationDefinitionResource, type: string): boolean => {
    return r.type === type;
  };

  protected isResourceInvalid = (r: TransformationDefinitionResource, _: any): boolean => {
    return !TransformationDefinitionResource.isValid(r);
  };

  protected compactName = (name: string, source: TransformationDefinitionResource['source']): string => {
    if (source === 'url') {
      return name?.includes("/") ? name.substring(name.lastIndexOf('/') + 1) : name;
    }
    return name;
  };
}
