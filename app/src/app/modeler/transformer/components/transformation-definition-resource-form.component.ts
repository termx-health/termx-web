import {Component, Input} from '@angular/core';
import {TransformationDefinition, TransformationDefinitionResource} from '../services/transformation-definition';
import {StructureDefinition} from 'term-web/modeler/_lib';
import {TransformationDefinitionService} from 'term-web/modeler/transformer/services/transformation-definition.service';
import {MapSet} from 'term-web/resources/_lib';
import {saveAs} from 'file-saver';
import {Fhir} from 'fhir/fhir';
import {MuiNotificationService} from '@kodality-web/marina-ui';

@Component({
  selector: 'tw-transformation-definition-resource-form',
  templateUrl: './transformation-definition-resource-form.component.html',
})
export class TransformationDefinitionResourceFormComponent {
  @Input() public resource: TransformationDefinitionResource;
  @Input() public definition: TransformationDefinition;

  public constructor(private transformationDefinitionService: TransformationDefinitionService, private notificationService: MuiNotificationService) {
  }

  public onDefinitionSelect(def: StructureDefinition): void {
    this.resource.reference.localId = String(def.id);
    this.resource.name = def.code;
  }

  public onMapSetSelect(ms: MapSet): void {
    this.resource.reference.localId = ms.id;
    this.resource.name = ms.id;
  }

  protected generateMapping(): void {
    this.transformationDefinitionService.generateFml(this.definition).subscribe(r => this.resource.reference.content = r);
  }

  protected downloadMap(format: 'json' | 'xml'): void {
    this.transformationDefinitionService.parseFml(this.resource.reference.content).subscribe(r => {
      if (r.error) {
        this.notificationService.error(r.error);
      }
      if (format === 'json') {
        saveAs(new Blob([r.json], {type: 'application/json'}), `${this.definition.name}.json`);
      }
      if (format === 'xml') {
        const xml = new Fhir().jsonToXml(r.json);
        saveAs(new Blob([xml], {type: 'application/xml'}), `${this.definition.name}.xml`);
      }
    });
  }

  protected compile(): void {
    this.transformationDefinitionService.parseFml(this.resource.reference.content).subscribe(r => {
      if (r.error) {
        this.notificationService.error('', r.error, {duration: 10000});
      } else {
        this.notificationService.success('ok');
      }
    });
  }

  public isFml(txt: string): boolean {
    return txt.startsWith('///');
  }

  public onContentChange(): void {
    this.resource.name = this.resource.name || this.findUrl(this.resource.reference.content);
  }

  protected findUrl = (content: string): string => {
    if (content.startsWith('<')) {
      const xml = new DOMParser().parseFromString(content, 'text/xml');
      return xml.getElementsByTagName('url')[0].getAttribute('value');
    }
    if (content.startsWith('{')) {
      return JSON.parse(content)['url'];
    }
  };
}
