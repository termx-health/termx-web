import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {NzTreeFlatDataSource, NzTreeFlattener} from 'ng-zorro-antd/tree-view';
import {ThesaurusFhirMapperUtil} from '../../services/thesaurus-fhir-mapper.util';
import {StructureDefinitionLibService} from 'lib/src/thesaurus';
import {isDefined} from '@kodality-web/core-util';
import {ChefService} from 'terminology-lib/integration';

@Component({
  selector: 'twa-structure-definition-tree',
  templateUrl: './structure-definition-tree.component.html'
})
export class StructureDefinitionTreeComponent implements OnChanges {
  @Input() public defCode?: string;
  @Input() public fsh?: string;
  @Input() public mode?: 'edit' | 'view' = 'view';
  @Output() public elementSelected = new EventEmitter<any>();
  public selectedElement?: any;
  public type?: 'diff' | 'snap' | 'hybrid' = 'hybrid';
  public dataSource?: any;
  public structureDefinitionValue?: any;

  public constructor(
    private chefService: ChefService,
    private structureDefinitionService: StructureDefinitionLibService
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['defCode'] && this.defCode) {
      this.processStructureDefinition(this.defCode);
    }

    if (changes['fsh'] && this.fsh) {
      this.processFsh(this.fsh);
    }
  }

  public reloadTree(): void {
    if (this.defCode) {
      this.processStructureDefinition(this.defCode);
    }
  }

  private mapToTreeNode(object: any): TreeNode[] | undefined {
    if (!(object instanceof Object)) {
      return undefined;
    }
    return Object.keys(object).filter(key => {
      const notElement = !['diff', 'snap'].includes(key);
      const correspondsToType = this.type === 'hybrid' || isDefined(object[key][this.type!]) || !isDefined(object[key][this.type === 'diff' ? 'snap' : 'diff']);
      return notElement && correspondsToType;
    }).map(key => {
      return {name: key, diff: object[key]['diff'], snap: object[key]['snap'], children: this.mapToTreeNode(object[key])};
    });
  }

  private processStructureDefinition(value: string): void {
    this.structureDefinitionService.search({code: value, limit: 1}).subscribe(sd => {
      const structureDefinition = sd.data[0]!;
      if (structureDefinition.contentFormat === 'json') {
        this.structureDefinitionValue = ThesaurusFhirMapperUtil.mapToKeyValue(JSON.parse(structureDefinition.content!));
        this.initDataSource(this.mapToTreeNode(this.structureDefinitionValue)!);
      }
      if (structureDefinition.contentFormat === 'fsh') {
        this.processFsh(structureDefinition.content!);
      }
    });
  }

  private processFsh(fsh: string): void {
    this.chefService.fshToFhir({fsh: fsh}).subscribe(resp => {
      this.structureDefinitionValue = ThesaurusFhirMapperUtil.mapToKeyValue(resp.fhir![0]);
      this.initDataSource(this.mapToTreeNode(this.structureDefinitionValue)!);
    });
  }

  private initDataSource(treeNodes: TreeNode[]): void {
    this.dataSource =
      new NzTreeFlatDataSource(this.treeControl, new NzTreeFlattener(this.transformer, node => node.level, node => node.expandable, node => node.children));
    this.dataSource.setData(treeNodes);
    this.treeControl.expandAll();
  }

  public hasChild = (_: number, node: FlatNode): boolean => node.expandable;

  private transformer = (node: TreeNode, level: number): FlatNode => {
    return (this.type === 'snap' ? this.snapTransformer(node, level) :
      this.type === 'diff' ? this.diffTransformer(node, level) : this.hybridTransformer(node, level));
  };

  private snapTransformer = (node: TreeNode, level: number): FlatNode => (
    {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      element: node.snap,
      type: node.snap?.type?.[0]?.code,
      targetProfile: node.snap?.type?.[0]?.targetProfile,
      fixedUri: node.snap?.fixedUri,
      fixedCoding: node.snap?.fixedCoding ? node.snap.fixedCoding : undefined,
      cardinality: isDefined(node.snap?.min) || isDefined(node.snap?.max) ?
        (isDefined(node.snap?.min) ? node.snap?.min : '*') + '..' + (isDefined(node.snap?.max) ? node.snap?.max : '*') : '',
      short: node.snap?.short,
      definition: isDefined(node.snap?.definition) && node.snap?.definition !== node.snap?.short ? node.snap?.definition : undefined,
      binding: node.snap?.binding,
      level
    });

  private diffTransformer = (node: TreeNode, level: number): FlatNode => (
    {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      element: node.diff,
      type: node.diff?.type?.[0]?.code,
      targetProfile: node.diff?.type?.[0]?.targetProfile,
      fixedUri: node.diff?.fixedUri,
      fixedCoding: node.diff?.fixedCoding ? node.diff.fixedCoding : undefined,
      cardinality: isDefined(node.diff?.min) || isDefined(node.diff?.max) ?
        (isDefined(node.diff?.min) ? node.diff?.min : '*') + '..' + (isDefined(node.diff?.max) ? node.diff?.max : '*') : '',
      short: node.diff?.short,
      definition: isDefined(node.diff?.definition) && node.diff?.definition !== node.diff?.short ? node.diff?.definition : undefined,
      binding: node.diff?.binding,
      level
    });

  private hybridTransformer = (node: TreeNode, level: number): FlatNode => (
    {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      element: node.diff || node.snap,
      type: node.diff?.type?.[0]?.code,
      targetProfile: node.diff?.type?.[0]?.targetProfile,
      fixedUri: node.diff?.fixedUri,
      fixedCoding: node.diff?.fixedCoding ? node.diff.fixedCoding : undefined,
      cardinality: isDefined(node.diff?.min) || isDefined(node.diff?.max) ?
        (isDefined(node.diff?.min) ? node.diff?.min : '*') + '..' + (isDefined(node.diff?.max) ? node.diff?.max : '*') : '',
      short: node.diff?.short,
      definition: isDefined(node.diff?.definition) && node.diff?.definition !== node.diff?.short ? node.diff?.definition : undefined,
      binding: node.diff?.binding,
      level
    });

  public onTypeChange(type: 'diff' | 'snap' | 'hybrid'): void {
    this.type = type;
    this.initDataSource(this.mapToTreeNode(this.structureDefinitionValue)!);
  }

  public treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );

  public lastWordFromUrl = (url: string): string | undefined => {
    return url.split('/').pop();
  };

  public selectElement(element: any): void {
    if (element) {
      this.selectedElement = element;
      this.elementSelected.emit(element);
    }
  }
}

interface TreeNode {
  name: string;
  fixedUri?: string;
  fixedCoding?: any;
  type?: string;
  targetProfile?: string[];
  cardinality?: string;
  short?: string;
  definition?: string;
  binding?: {valueSet?: string, strength?: string};
  element?: Element;
  diff?: Element;
  snap?: Element;
  children?: TreeNode[];
}

interface FlatNode extends TreeNode {
  expandable: boolean;
  level: number;
}

export class Element {
  public id?: string;
  public path?: string;
  public fixedUri?: string;
  public fixedCoding?: {code?: string, system?: string, display?: string};
  public min?: number;
  public max?: string;
  public short?: string;
  public definition?: string;
  public binding?: {valueSet?: string, strength?: string};
  public type?: ElementType[];
  public constraint?: ElementConstraint[];
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
