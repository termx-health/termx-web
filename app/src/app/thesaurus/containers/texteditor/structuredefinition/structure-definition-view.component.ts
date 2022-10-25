import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs';
import {FlatTreeControl} from '@angular/cdk/tree';
import {NzTreeFlatDataSource, NzTreeFlattener} from 'ng-zorro-antd/tree-view';
import {ThesaurusFhirMapperUtil} from '../../../services/thesaurus-fhir-mapper.util';
import {StructureDefinitionLibService} from 'terminology-lib/thesaurus';

@Component({
  selector: 'twa-structure-definition-view',
  templateUrl: './structure-definition-view.component.html'
})
export class StructureDefinitionViewComponent implements OnChanges {
  @Input() public processedValue?: {type: string, value: any};
  public dataSource?: any;

  public constructor(private http: HttpClient, private structureDefinitionService: StructureDefinitionLibService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['processedValue'] && this.processedValue) {
      if (this.processedValue.type === 'simplifier') {
        this.processSimplifier(this.processedValue.value);
      }
      if (this.processedValue.type === 'def') {
        this.processStructureDefinition(this.processedValue.value);
      }
    }
  }

  // --------- Simplifier ---------
  private processSimplifier(value: string): void {
    this.http.get<any>(value + '/content/json')
      .pipe(map(resp => ThesaurusFhirMapperUtil.mapToKeyValue(JSON.parse(resp.content))))
      .subscribe(obj => this.initDataSource(this.mapToTreeNode(obj)!));
  }

  private mapToTreeNode(object: any): TreeNode[] | undefined {
    if (!(object instanceof Object)) {
      return undefined;
    }
    return Object.keys(object).filter(key => !['type', 'targetProfiles', 'fixed', 'cardinality', 'short', 'definition', 'binding', 'bindingStrength'].includes(key)).map(key => {
      return {
        name: key,
        type: object[key]['type'],
        targetProfiles: object[key]['targetProfiles'],
        fixed: object[key]['fixed'],
        cardinality: object[key]['cardinality'],
        short: object[key]['short'],
        definition: object[key]['definition'],
        binding: object[key]['binding'],
        bindingStrength: object[key]['bindingStrength'],
        children: this.mapToTreeNode(object[key])};
    });
  }

  // --------- StructureDefinition ---------

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
    fixed: node.fixed,
    type: node.type,
    targetProfiles: node.targetProfiles,
    cardinality: node.cardinality,
    short: node.short,
    definition: node.definition,
    binding: node.binding,
    bindingStrength: node.bindingStrength,
    level
  });

  public treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );

  public lastWordFromUrl = (url: string): string | undefined => {
    return url.split('/').pop();
  };
}

interface TreeNode {
  name: string;
  fixed?: string;
  type?: string;
  targetProfiles?: string[];
  cardinality?: string;
  short?: string;
  definition?: string;
  binding?: string;
  bindingStrength?: string;
  children?: TreeNode[];
}

interface FlatNode extends TreeNode {
  expandable: boolean;
  level: number;
}
