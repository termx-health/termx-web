import {Component, Input} from '@angular/core';
import {TransformationDefinition, TransformationDefinitionResource} from '../services/transformation-definition';
import {StructureDefinition} from 'term-web/modeler/_lib';
import {TransformationDefinitionService} from 'term-web/modeler/transformer/services/transformation-definition.service';
import {MapSet} from 'term-web/resources/_lib';
import {saveAs} from 'file-saver';
import {Fhir} from 'fhir/fhir';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {launchFMLEditor} from 'term-web/modeler/transformer/components/fml.editor';
import {Bundle} from 'fhir/model/bundle';
import {forkJoin, map, of} from 'rxjs';
import {StructureDefinition as FhirStructureDefinition} from 'fhir/model/structure-definition';
import {HttpCacheService, isNil, LoadingManager} from '@kodality-web/core-util';

@Component({
  selector: 'tw-transformation-definition-resource-form',
  templateUrl: './transformation-definition-resource-form.component.html',
})
export class TransformationDefinitionResourceFormComponent {
  @Input() public resource: TransformationDefinitionResource;
  @Input() public definition: TransformationDefinition;

  protected loader = new LoadingManager();
  private httpCache = new HttpCacheService();

  public constructor(
    private transformationDefinitionService: TransformationDefinitionService,
    private notificationService: MuiNotificationService
  ) { }

  protected onDefinitionSelect(def: StructureDefinition): void {
    this.resource.reference.localId = String(def.id);
    this.resource.name = def.code;
  }

  protected onMapSetSelect(ms: MapSet): void {
    this.resource.reference.localId = ms.id;
    this.resource.name = ms.id;
  }


  protected generateMapping(): void {
    this.transformationDefinitionService.composeFml(this.definition).subscribe(r => this.resource.reference.content = r);
  }

  protected launchEditor(): void {
    this.loader.wrap('visual-editor', forkJoin([
      this.httpCache.put('base-resources', this.transformationDefinitionService.baseResources()),
      this.transformationDefinitionService.transformResources(this.definition.resources),
      this.isFml(this.resource.reference.content)
        ? this.transformationDefinitionService.parseFml(this.resource.reference.content).pipe(map(r => r.json))
        : of(this.resource.reference.content)
    ])).subscribe(([bundle, definitions, json]: [Bundle, FhirStructureDefinition[], string]) => {
      bundle.entry.push(...definitions.map(def => ({resource: def})));
      if (isNil(json)) {
        return;
      }

      launchFMLEditor({
        editorFacade: {
          getBundle: () => bundle,
          getStructureMap: () => JSON.parse(json),
          updateStructureMap: sm => {
            this.transformationDefinitionService.generateFml(sm)
              .subscribe({
                next: fml => {
                  sm['text'] = {
                    status: 'generated',
                    div: `<div>\n${fml.replace(/,\s\s/gm, ',\n    ').replace(/\s->\s/gm, ' ->\n   ')}</div>`
                  };
                },
                error: err => this.notificationService.error("web.transformation-definition.resource-form.fml-generation-failed", err)
              })
              .add(() => this.resource.reference.content = JSON.stringify(sm, null, 2));
          }
        }
      });
    });
  }

  protected downloadMap(format: 'json' | 'xml'): void {
    this.transformationDefinitionService.parseFml(this.resource.reference.content).subscribe(r => {
      if (r.error) {
        this.notificationService.error(r.error);
      }
      this.downloadContent(r.json, format);
    });
  }

  protected downloadContent(content: string, format: "plain" | "json" | "xml"): void {
    if (format === 'plain') {
      saveAs(new Blob([content], {type: 'plain/text'}), `${this.definition.name}.txt`);
    }

    if (format === 'json') {
      saveAs(new Blob([content], {type: 'application/json'}), `${this.definition.name}.json`);
    }
    if (format === 'xml') {
      const xml = new Fhir().jsonToXml(content);
      saveAs(new Blob([xml], {type: 'application/xml'}), `${this.definition.name}.xml`);
    }
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


  protected onContentChange(): void {
    this.resource.name = this.resource.name || this.findUrl(this.resource.reference.content);
  }

  protected isFml(txt: string): boolean {
    return txt.startsWith('///');
  }

  protected isEditor(txt: string): boolean {
    return txt.startsWith('{') && txt.includes('fml-export');
  }

  protected fmlContent(txt: string): string {
    return txt?.startsWith('{')
      ? JSON.parse(txt)['text']?.['div']
        .replace(/^<div>/, '')
        .replace(/<\/div>$/, '')
        .replace(/^\n/, '')
        .replace(/\n$/, '')
      : undefined;
  }

  protected svgContent(txt: string): string {
    return JSON.parse(txt)['extension'].find(ext => ext['url'] === 'fml-svg')?.valueString;
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
