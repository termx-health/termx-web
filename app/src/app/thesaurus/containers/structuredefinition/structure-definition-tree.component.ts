import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {NzTreeFlatDataSource, NzTreeFlattener} from 'ng-zorro-antd/tree-view';
import {ThesaurusFhirMapperUtil} from '../../services/thesaurus-fhir-mapper.util';
import {StructureDefinitionLibService} from 'lib/src/thesaurus';
import {isDefined} from '@kodality-web/core-util';

@Component({
  selector: 'twa-structure-definition-tree',
  templateUrl: './structure-definition-tree.component.html'
})
export class StructureDefinitionTreeComponent implements OnChanges {
  @Input() public defCode?: string;
  @Input() public mode?: 'edit' | 'view' = 'view';
  @Output() public elementSelected = new EventEmitter<any>();
  public dataSource?: any;

  public constructor(private structureDefinitionService: StructureDefinitionLibService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['defCode'] && this.defCode) {
      this.processStructureDefinition(this.defCode);
    }
  }

  public reloadTree(): void{
    if (this.defCode) {
      this.processStructureDefinition(this.defCode);
    }
  }

  private mapToTreeNode(object: any): TreeNode[] | undefined {
    if (!(object instanceof Object)) {
      return undefined;
    }
    return Object.keys(object)
      .filter(key => !['element'].includes(key)).map(key => {
        return {name: key, element: object[key]['element'], children: this.mapToTreeNode(object[key])};
      });
  }

  private processStructureDefinition(value: string): void {
    this.structureDefinitionService.search({code: value, limit: 1}).subscribe(sd => {
      const structureDefinition = sd.data[0]!;
      if (structureDefinition.contentFormat === 'json') {
        this.initDataSource(this.mapToTreeNode(ThesaurusFhirMapperUtil.mapToKeyValue(JSON.parse(structureDefinition.content!)))!);
      }
      if (structureDefinition.contentFormat === 'fsh') {
        //TODO
      }
    });
  }

  private initDataSource(treeNodes: TreeNode[]): void {
    this.dataSource = new NzTreeFlatDataSource(this.treeControl, new NzTreeFlattener(this.transformer, node => node.level, node => node.expandable, node => node.children));
    this.dataSource.setData(treeNodes);
    this.treeControl.expandAll();
  }

  public hasChild = (_: number, node: FlatNode): boolean => node.expandable;

  private transformer = (node: TreeNode, level: number): FlatNode => ({
    expandable: !!node.children && node.children.length > 0,
    name: node.name,
    element: node.element,
    type: node.element?.type?.[0]?.code,
    targetProfile: node.element?.type?.[0]?.targetProfile,
    fixedUri: node.element?.fixedUri,
    fixedCoding: node.element?.fixedCoding ? node.element.fixedCoding.code : undefined,
    cardinality: isDefined(node.element?.min) || isDefined(node.element?.max) ? (isDefined(node.element?.min) ? node.element?.min : '*') + '..' + (isDefined(node.element?.max) ? node.element?.max : '*') : '',
    short: node.element?.short,
    definition: isDefined(node.element?.definition) && node.element?.definition !== node.element?.short ? node.element?.definition : undefined,
    binding: node.element?.binding,
    level
  });

  public treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );

  public lastWordFromUrl = (url: string): string | undefined => {
    return url.split('/').pop();
  };

  public selectElement(element: any): void {
    this.elementSelected.emit(element);
  }
}

interface TreeNode {
  name: string;
  fixedUri?: string;
  fixedCoding?: string;
  type?: string;
  targetProfile?: string[];
  cardinality?: string;
  short?: string;
  definition?: string;
  binding?: {valueSet?: string, strength?: string};
  element?: Element;
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
  public max?: number;
  public short?: string;
  public definition?: string;
  public binding?: {valueSet?: string, strength?: string};
  public type?: ElementType[];
  public constraint?: ElementConstraint[];
}

export class ElementType {
  public code?: string;
  public targetProfile?: string[];
}

export class ElementConstraint {
  public key?: string;
  public requirements?: string;
  public severity?: 'error' | 'warning';
  public human?: string;
  public expression?: string;
  public source?: string;
}
