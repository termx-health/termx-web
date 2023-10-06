import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {TransformationDefinition, TransformationDefinitionResource} from '../services/transformation-definition';
import {StructureDefinition} from 'term-web/modeler/_lib';
import {TransformationDefinitionService} from 'term-web/modeler/transformer/services/transformation-definition.service';
import {MapSet} from 'term-web/resources/_lib';
import {saveAs} from 'file-saver';
import {Fhir} from 'fhir/fhir';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {launchFMLEditor} from 'term-web/modeler/transformer/components/fml.editor';
import {Bundle} from 'fhir/model/bundle';
import {catchError, defaultIfEmpty, forkJoin, map, Observable, of, shareReplay} from 'rxjs';
import {StructureDefinition as FhirStructureDefinition} from 'fhir/model/structure-definition';
import {group, HttpCacheService, isNil, LoadingManager} from '@kodality-web/core-util';
import {TerminologyServerLibService} from 'term-web/space/_lib';
import {HttpErrorResponse} from '@angular/common/http';


@Component({
  selector: 'tw-transformation-definition-resource-form',
  templateUrl: './transformation-definition-resource-form.component.html',
})
export class TransformationDefinitionResourceFormComponent implements OnChanges {
  @Input() public resource: TransformationDefinitionResource;
  @Input() public definition: TransformationDefinition;

  protected loader = new LoadingManager();
  private httpCache = new HttpCacheService();

  protected servers$ = this.serviceService.search({kinds: 'fhir', limit: -1}).pipe(map(resp => resp.data), shareReplay(1));
  protected urlSuffix: Record<TransformationDefinitionResource['type'], string> = {
    definition: '/StructureDefinition/',
    conceptmap: '/ConceptMap/',
    mapping: '/'
  };

  public constructor(
    private transformationDefinitionService: TransformationDefinitionService,
    private serviceService: TerminologyServerLibService,
    private notificationService: MuiNotificationService
  ) { }


  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['resource']) {
      const {type, source, reference} = this.resource ?? {};
      if (source === 'url') {
        if (reference.resourceServerId && reference.resourceUrl.startsWith(this.urlSuffix[type])) {
          this.resource.reference['_url'] = reference.resourceUrl.slice(this.urlSuffix[type].length);
        } else {
          this.resource.reference['_url'] = reference.resourceUrl;
        }
      }
    }
  }

  protected onDefinitionSelect(def: StructureDefinition): void {
    this.resource.reference.localId = def ? String(def.id) : undefined;
    this.resource.name = def ? def.code : undefined;
  }

  protected onMapSetSelect(ms: MapSet): void {
    this.resource.reference.localId = ms?.id;
    this.resource.name = ms?.id;
  }

  protected onStructureMapSelect(def: TransformationDefinition): void {
    this.resource.reference.localId = def ? String(def.id) : undefined;
    this.resource.name = def ? def.name : undefined;
  }

  protected onResourceUrlChange(res: TransformationDefinitionResource): void {
    if (res.reference.resourceServerId) {
      res.reference.resourceUrl = `${this.urlSuffix[res.type]}${res.reference['_url']}`;
    } else {
      res.reference.resourceUrl = res.reference['_url'];
    }
  }

  protected previewResourceUrl(resource: TransformationDefinitionResource): void {
    this.loader.wrap(`preview-${resource.name}`, this.transformationDefinitionService.transformResourceContent(resource, true)).pipe(
      map(resp => ({value: encodeURIComponent(JSON.stringify(resp))})),
      catchError((err: HttpErrorResponse) => of({error: err.error[0].message}))
    ).subscribe((resp: {value: any, error: string}) => {
      resource['_preview'] = resp;
    });
  }

  protected generateMap(): void {
    this.loader.wrap('generate', this.transformationDefinitionService.composeFml(this.definition)).subscribe(r => {
      this.resource.reference.content = r;
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

  protected compileMap(): void {
    this.transformationDefinitionService.parseFml(this.resource.reference.content).subscribe(r => {
      if (r.error) {
        this.notificationService.error('', r.error, {duration: 10000});
      } else {
        this.notificationService.success('ok');
      }
    });
  }

  protected launchEditor(): void {
    this.loader.wrap('visual-editor', forkJoin([
      this.isFml(this.resource.reference.content)
        ? this.transformationDefinitionService.parseFml(this.resource.reference.content).pipe(map(r => r.json))
        : of(this.resource.reference.content),
      // bundle
      this.httpCache.put('base-resources', this.transformationDefinitionService.baseResources()),
      // definitions
      this.transformationDefinitionService.transformResources(this.definition.resources),
      // import mappings
      forkJoin(this.definition.resources
        .filter(r => r.type === 'mapping')
        .map(r => this.transformationDefinitionService.transformResourceContent(r))
      ).pipe(defaultIfEmpty([]))
    ])).subscribe(([json, bundle, definitions, resources]: [string, Bundle, FhirStructureDefinition[], object[]]) => {
      if (isNil(json)) {
        return;
      }

      const entries = {
        ...group(bundle.entry, e => e.resource.url),
        ...group(definitions, e => e.url, e => ({resource: e}))
      };
      bundle.entry = Object.values(entries);

      launchFMLEditor({
        editorFacade: {
          getBundle: () => bundle,
          getStructureMap: () => JSON.parse(json),
          updateStructureMap: sm => {
            this.transformationDefinitionService.generateFml(sm).subscribe({
              next: fml => {
                sm['text'] = {
                  status: 'generated',
                  div: `<div>\n${fml.replace(/,\s\s/gm, ',\n    ').replace(/\s->\s/gm, ' ->\n   ')}</div>`
                };
              },
              error: err => this.notificationService.error("web.transformation-definition.resource-form.fml-generation-failed", err)
            }).add(() => this.resource.reference.content = JSON.stringify(sm, null, 2));
          },
          getImportStructureMaps: () => resources,
          renderFml: sm => this.transformationDefinitionService.generateFml(sm)
        }
      });
    });
  }

  protected switchToTextEditor(): void {
    if (this.hasFml(this.resource.reference.content)) {
      const fml = this.fmlContent(this.resource.reference.content);
      const fmlLines = fml.split('\n');
      const [_, url, name] = fmlLines[0].match(/map "(.+)" = "(.+)"/);
      this.resource.reference.content = `/// url = "${url}/${name}"\n` + fmlLines.slice(1).join("\n");
    }
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


  protected onContentChange(): void {
    this.resource.name = this.resource.name || this.findUrl(this.resource.reference.content);
  }

  protected getServerUrl = (serverId: number): Observable<string> => {
    const normalize = (url: string): string => url?.endsWith("/") ? url.slice(0, url.length - 1) : url;
    return this.servers$.pipe(
      map(servers => servers.find(s => s.id === serverId)),
      map(s => normalize(s?.rootUrl))
    );
  }

  protected isFml(txt: string): boolean {
    return txt?.startsWith('///');
  }

  protected hasFml(txt: string): boolean {
    return txt?.startsWith('{') && txt?.includes('fml-export');
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
    if (content?.startsWith('<')) {
      const xml = new DOMParser().parseFromString(content, 'text/xml');
      return xml.getElementsByTagName('url')[0].getAttribute('value');
    }
    if (content?.startsWith('{')) {
      return JSON.parse(content)['url'];
    }
  };

}
