import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import {LoadingManager} from '@kodality-web/core-util';
import {initializeWebComponent} from '@termx-health/structure-definition-viewer';
import {Fhir} from 'fhir/fhir';
import {map, Observable, tap} from 'rxjs';
import {ChefService} from 'term-web/integration/_lib';
import {StructureDefinition} from 'term-web/modeler/_lib';
import {StructureDefinitionLibService} from 'term-web/modeler/_lib/structure-definition/structure-definition-lib.service';
import { MuiSkeletonModule } from '@kodality-web/marina-ui';
import { JsonPipe } from '@angular/common';

@Component({
    selector: 'tw-structure-definition-tree',
    templateUrl: './structure-definition-tree.component.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [MuiSkeletonModule, JsonPipe]
})
export class StructureDefinitionTreeComponent implements OnChanges {
  private chefService = inject(ChefService);
  private structureDefinitionService = inject(StructureDefinitionLibService);

  @Input() public defId?: number;
  @Input() public defCode?: string;
  @Input() public content?: string;
  @Input() public type: 'diff' | 'snap' | 'hybrid' = 'hybrid';

  protected fhirJson: string;
  protected loader = new LoadingManager();

  public constructor() {
    initializeWebComponent('tx-sd-view');
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['defId'] && this.defId) {
      this.init();
    }
    if (changes['defCode'] && this.defCode) {
      this.defCode = this.decode(this.defCode);
      this.init();
    }
    if (changes['content']) {
      this.content = this.decode(this.content);
      this.processContent(this.content);
    }
  }


  private init(): void {
    const wrap = (loader: Observable<StructureDefinition>): Observable<StructureDefinition> =>
      this.loader.wrap('load', loader).pipe(tap(sd => this.processContent(sd.content)));

    if (this.defId) {
      wrap(this.structureDefinitionService.load(this.defId)).subscribe();
    }
    if (this.defCode) {
      wrap(this.structureDefinitionService.search({code: this.defCode, limit: 1}).pipe(map(sd => sd.data[0]))).subscribe();
    }
  }

  private processContent(content: string): void {
    if (content.startsWith('{')) {
      this.processObj(JSON.parse(content));
      return;
    }
    if (content.startsWith('<')) {
      this.processObj(new Fhir().xmlToObj(content));
      return;
    }
    if (
      content.startsWith('Resource:') ||
      content.startsWith("Logical:")
    ) { // or how to assume fsh?
      this.loader.wrap('fsh', this.chefService.fshToFhir({fsh: content})).subscribe(resp => this.processObj(resp.fhir[0]));
    }
  }

  private processObj(json: any): void {
    this.fhirJson = json;
  }


  protected encodeURIComponent = encodeURIComponent;

  private decode(v: string): string {
    try {
      return decodeURIComponent(v);
    } catch {
      return v;
    }
  }
}

