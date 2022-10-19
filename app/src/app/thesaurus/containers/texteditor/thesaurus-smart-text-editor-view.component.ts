import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable, of} from 'rxjs';
import { FlatTreeControl } from '@angular/cdk/tree';
import { NzTreeFlatDataSource, NzTreeFlattener } from 'ng-zorro-antd/tree-view';
import {ThesaurusFhirMapperUtil} from '../../services/thesaurus-fhir-mapper.util';

@Component({
  selector: 'twa-smart-text-editor-view',
  templateUrl: './thesaurus-smart-text-editor-view.component.html'
})
export class ThesaurusSmartTextEditorViewComponent implements OnChanges {
  @Input() public valueType?: 'html' | 'markdown';
  @Input() public value?: string;

  public processedValue: {type: string, value: any}[] = [];

  public constructor(private http: HttpClient) {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && this.value) {
      this.processValue(this.value);
    }
  }

  private processValue(value: string): void {
    this.processedValue = [];
    value.split(/{{|}}/).forEach((v, i) => {
      if (i % 2 == 0) {
        this.processedValue.push({type: 'text', value: v});
      } else {
        const template = v.split(/:(.*)|\|/s);
        this.extractJson(template[0], template[1]).subscribe(obj => {
          const dataSource = new NzTreeFlatDataSource(this.treeControl, new NzTreeFlattener(this.transformer, node => node.level, node => node.expandable, node => node.children));
          dataSource.setData(this.mapToTreeNode(obj)!);
          this.processedValue.push({type: template[0], value: dataSource});
        });
      }
    });
  }

  private extractJson(type: string, value: string): Observable<any> {
    if (type === 'simplifier') {
      return this.http.get<any>(value + 'content/json').pipe(map(resp => ThesaurusFhirMapperUtil.mapToKeyValue(JSON.parse(resp.content))));
    }
    return of(value);
  }

  private mapToTreeNode(object: any): TreeNode[] | undefined {
    if (!(object instanceof Object)) {
      return undefined;
    }
    return Object.keys(object).filter(key => key !== 'description').map(key => {
      return {name: key, description: object[key]['description'], children: this.mapToTreeNode(object[key])};
    });
  }

  public hasChild = (_: number, node: FlatNode): boolean => node.expandable;

  private transformer = (node: TreeNode, level: number): FlatNode => ({
    expandable: !!node.children && node.children.length > 0,
    description: node.description,
    name: node.name,
    level
  });

  public treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );

}

interface TreeNode {
  name: string;
  description?: string;
  children?: TreeNode[];
}

interface FlatNode {
  expandable: boolean;
  name: string;
  description?: string;
  level: number;
}
