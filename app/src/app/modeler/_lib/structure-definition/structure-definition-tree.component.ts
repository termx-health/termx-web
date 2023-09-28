import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {StructureDefinitionLibService} from './structure-definition-lib.service';
import {isDefined, LoadingManager} from '@kodality-web/core-util';
import {ChefService} from 'term-web/integration/_lib';
import {MuiTreeComponent, MuiTreeNode, MuiTreeNodeOptions} from '@kodality-web/marina-ui';
import {StructureDefinitionFhirMapperUtil} from 'term-web/modeler/structure-definition/services/structure-definition-fhir-mapper.util';
import {map, Observable} from 'rxjs';
import {StructureDefinition} from 'term-web/modeler/_lib';
import {Fhir} from 'fhir/fhir';

@Component({
  selector: 'tw-structure-definition-tree',
  templateUrl: './structure-definition-tree.component.html',
  styles: [`
    ::ng-deep .structure-definition-tree {
      .m-tree-node__option {
        width: 100%;

        &:not(.m-tree-node__option--leaf) {
          border: 1px solid #d2d2d2;
        }

        &--selected {
          background: #eee;
          color: initial;
        }
      }

      .m-tree-title label {
        cursor: inherit;
      }
    }
  `]
})
export class StructureDefinitionTreeComponent implements OnChanges {
  @Input() public defId?: number;
  @Input() public defCode?: string;
  @Input() public content?: string;
  @Input() public mode?: 'edit' | 'view' = 'view';
  @Output() public elementSelected = new EventEmitter<any>();

  protected type?: 'diff' | 'snap' | 'hybrid' = 'hybrid';
  protected structureDefinitionValue?: any;

  @ViewChild(MuiTreeComponent) private tree: MuiTreeComponent;
  protected treeOptions: MuiTreeNodeOptions[];

  protected loader = new LoadingManager();

  public constructor(
    private chefService: ChefService,
    private structureDefinitionService: StructureDefinitionLibService
  ) {
  }


  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['defCode'] && this.defCode) {
      this.defCode = decodeURIComponent(this.defCode);
      this.reloadTree();
    }
    if (changes['defId'] && this.defId) {
      this.reloadTree();
    }
    if (changes['content']) {
      this.content = decodeURIComponent(this.content);
      this.processContent(this.content);
    }
  }

  public reloadTree(): void {
    if (this.defCode) {
      this.processStructureDefinition(this.structureDefinitionService.search({code: this.defCode, limit: 1}).pipe(map(sd => sd.data[0]!)));
    }
    if (this.defId) {
      this.processStructureDefinition(this.structureDefinitionService.load(this.defId));
    }
  }


  private processStructureDefinition(loader: Observable<StructureDefinition>): void {
    this.loader.wrap('tree', loader).subscribe(sd => this.processContent(sd.content));
  }

  private processContent(content: string): void {
    this.structureDefinitionValue = undefined;
    this.treeOptions = undefined;
    if (content.startsWith('{')) {
      this.processObj(JSON.parse(content));
      return;
    }
    if (content.startsWith('<')) {
      this.processObj(new Fhir().xmlToObj(content));
      return;
    }
    if (content.startsWith('Resource:') || content.startsWith("Logical:")) { // or how to assume fsh?
      this.loader.wrap('fsh', this.chefService.fshToFhir({fsh: content})).subscribe(resp => this.processObj(resp.fhir[0]));
    }
  }

  private processObj(def: any): void {
    try {
      this.structureDefinitionValue = StructureDefinitionFhirMapperUtil.mapToKeyValue(def);
      this.initTree(this.structureDefinitionValue);
    } catch (e) {
      console.error("Failed to init structure definition from JSON", e);
    }
  }

  protected onTypeChange(type: 'diff' | 'snap' | 'hybrid'): void {
    this.type = type;
    this.initTree(this.structureDefinitionValue);
  }

  protected selectElement(node: MuiTreeNode<StructureDefinitionData>): void {
    const element = node.data.element;
    if (element) {
      this.elementSelected.emit(element);
    }
  }

  public unselect(): void {
    this.tree.mSelectedKeys.forEach(k => this.tree.unselect(k));
  }


  private initTree(val: any): void {
    this.treeOptions = undefined;
    setTimeout(() => this.treeOptions = this.mapDefToNode(val));
  }

  private mapDefToNode(object: any): MuiTreeNodeOptions[] | undefined {
    if (!(object instanceof Object)) {
      return undefined;
    }

    return Object.keys(object).filter(key => {
      const notElement = !['diff', 'snap', 'el'].includes(key);
      const correspondsToType = this.type === 'hybrid' || isDefined(object[key][this.type!]) || !isDefined(object[key][this.type === 'diff' ? 'snap' : 'diff']);
      return notElement && correspondsToType;
    }).map(key => {
      const data = this.transformer({
        mappings: object[key]['el']?.mapping,
        diff: object[key]['diff'],
        snap: object[key]['snap'],
      });
      return ({
        key: key,
        title: key,
        children: this.mapDefToNode(object[key]),
        selectable: !!data.element && this.mode === 'edit',
        data: data,
      });
    });
  }


  private transformer = (node: {snap: Element, diff: Element, mappings: ElementMapping}): StructureDefinitionData => {
    switch (this.type) {
      case 'snap':
        return this.snapTransformer(node);
      case 'diff':
        return this.diffTransformer(node);
      case 'hybrid':
        return this.hybridTransformer(node);
    }
  };

  private snapTransformer = ({snap, mappings}: {snap: Element, mappings: ElementMapping}): StructureDefinitionData => ({
    element: snap,
    type: snap?.type?.[0]?.code,
    targetProfile: snap?.type?.[0]?.targetProfile,
    fixedUri: snap?.fixedUri,
    fixedCode: snap?.fixedCode,
    fixedCoding: snap?.fixedCoding ? snap.fixedCoding : undefined,
    fixedCodeableConcept: snap?.fixedCodeableConcept,
    patternCodeableConcept: snap?.patternCodeableConcept,
    cardinality: isDefined(snap?.min) || isDefined(snap?.max) ? (isDefined(snap?.min) ? snap?.min : '*') + '..' + (isDefined(snap?.max) ? snap?.max : '*') : '',
    short: snap?.short,
    definition: isDefined(snap?.definition) && snap?.definition !== snap?.short ? snap?.definition : undefined,
    binding: snap?.binding,
    mappings: snap?.mapping || mappings,
  });

  private diffTransformer = ({diff, mappings}: {diff: Element, mappings: ElementMapping}): StructureDefinitionData => ({
    element: diff,
    type: diff?.type?.[0]?.code,
    targetProfile: diff?.type?.[0]?.targetProfile,
    fixedUri: diff?.fixedUri,
    fixedCode: diff?.fixedCode,
    fixedCoding: diff?.fixedCoding,
    fixedCodeableConcept: diff?.fixedCodeableConcept,
    patternCodeableConcept: diff?.patternCodeableConcept,
    cardinality: isDefined(diff?.min) || isDefined(diff?.max) ? (isDefined(diff?.min) ? diff?.min : '*') + '..' + (isDefined(diff?.max) ? diff?.max : '*') : '',
    short: diff?.short,
    definition: isDefined(diff?.definition) && diff?.definition !== diff?.short ? diff?.definition : undefined,
    binding: diff?.binding,
    mappings: diff?.mapping || mappings,
  });

  private hybridTransformer = ({diff, snap, mappings}: {snap: Element, diff: Element, mappings: ElementMapping}): StructureDefinitionData => ({
    element: diff || snap,
    type: diff?.type?.[0]?.code,
    targetProfile: diff?.type?.[0]?.targetProfile,
    fixedUri: diff?.fixedUri,
    fixedCode: diff?.fixedCode,
    fixedCoding: diff?.fixedCoding,
    fixedCodeableConcept: diff?.fixedCodeableConcept,
    patternCodeableConcept: diff?.patternCodeableConcept,
    cardinality: isDefined(diff?.min) || isDefined(diff?.max) ? (isDefined(diff?.min) ? diff?.min : '*') + '..' + (isDefined(diff?.max) ? diff?.max : '*') : '',
    short: diff?.short,
    definition: isDefined(diff?.definition) && diff?.definition !== diff?.short ? diff?.definition : undefined,
    binding: diff?.binding,
    mappings: diff?.mapping || mappings,
  });


  protected lastWordFromUrl = (url: string): string | undefined => {
    return url.split('/').pop();
  };
}

export interface StructureDefinitionData {
  fixedUri?: string;
  fixedCode?: string;
  fixedCoding?: any;
  fixedCodeableConcept?: any;
  patternCodeableConcept?: any;
  type?: string;
  targetProfile?: string[];
  cardinality?: string;
  short?: string;
  definition?: string;
  binding?: {valueSet?: string, strength?: string};
  mappings?: ElementMapping;
  element?: Element;
  diff?: Element;
  snap?: Element;
}

export class Element {
  public id?: string;
  public path?: string;
  public fixedUri?: string;
  public fixedCode?: string;
  public fixedCoding?: {code?: string, system?: string, display?: string};
  public fixedCodeableConcept?: {coding: {code?: string, system?: string, display?: string}[]};
  public patternCodeableConcept?: {coding: {code?: string, system?: string, display?: string}[]};
  public min?: number;
  public max?: string;
  public short?: string;
  public definition?: string;
  public binding?: {valueSet?: string, strength?: string};
  public mapping?: ElementMapping;
  public type?: ElementType[];
  public constraint?: ElementConstraint[];
}

export class ElementMapping {
  public identity?: string;
  public map?: string;
}

export class ElementType {
  public code?: string;
  public targetProfile?: string[];
  public profile?: string[];
}

export class ElementConstraint {
  public key?: string;
  public requirements?: string;
  public severity?: 'error' | 'warning';
  public human?: string;
  public expression?: string;
  public source?: string;
}
