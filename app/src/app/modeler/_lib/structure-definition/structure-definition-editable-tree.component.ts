import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {isDefined, LoadingManager} from '@kodality-web/core-util';
import {StructureDefinitionFhirMapperUtil} from 'term-web/modeler/structure-definition/services/structure-definition-fhir-mapper.util';
import {Element, StructureDefinitionUtil} from 'term-web/modeler/_lib';
import {DropListComponent, DropListMoveEvent, DropListNode} from 'term-web/core/ui/components/drop-list/drop-list.component';

function findInTree<Node, Key>(nodesToSearch: Node[], key: Key, getKey: (n: Node) => Key, getChildren: (n: Node) => Node[]): Node {
  for (let node of nodesToSearch) {
    if (getKey(node) == key) {
      return node;
    }
    const ret = findInTree(getChildren(node) ?? [], key, getKey, getChildren);
    if (ret) {
      return ret;
    }
  }
}

@Component({
  selector: 'tw-structure-definition-editable-tree',
  templateUrl: './structure-definition-editable-tree.component.html'
})
export class StructureDefinitionEditableTreeComponent implements OnChanges {
  @Input() public content?: string; //fhir json structure definition
  @Output() public elementSelected = new EventEmitter<any>();
  @Output() public elementDeleted = new EventEmitter<string>();

  @ViewChild(DropListComponent) private tree: DropListComponent;

  protected type?: 'diff' | 'snap' | 'hybrid' = 'hybrid';

  protected structureDefinition: any;
  protected structureDefinitionMap: {[key: string]: any};

  protected nodes: DropListNode[] = [];
  protected selectedKey: string;

  protected loader = new LoadingManager();

  public constructor() {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['content'] && isDefined(this.content)) {
      this.processContent(this.content);
    }
  }

  private processContent(fhirSD: string): void {
    try {
      this.structureDefinition = JSON.parse(fhirSD);
      this.initData(this.structureDefinition);
    } catch (e) {
      console.error("Failed to init structure definition from JSON", e);
    }
  }

  private initData(structureDefinition: any): void {
    this.structureDefinitionMap = StructureDefinitionFhirMapperUtil.mapToKeyValue(structureDefinition);
    this.initNodes();
  }

  protected onTypeChange(type: 'diff' | 'snap' | 'hybrid'): void {
    this.type = type;
    this.initNodes();
  }

  protected openElement(el: Element): void {
    if (el) {
      this.elementSelected.emit(el);
    }
  }

  private initNodes(): void {
    this.nodes = this.mapToNodeList(this.structureDefinitionMap);
  }

  private mapToNodeList(object: any): DropListNode[] | undefined {
    if (!(object instanceof Object)) {
      return undefined;
    }

    return Object.keys(object).filter(key => {
      const notElement = !['diff', 'snap', 'el'].includes(key);
      const correspondsToType = this.type === 'hybrid' || isDefined(object[key][this.type!]) || !isDefined(object[key][this.type === 'diff' ? 'snap' : 'diff']);
      return notElement && correspondsToType;
    }).map(key => {
      const element = this.transformer({diff: object[key]['diff'], snap: object[key]['snap']});
      const children = this.mapToNodeList(object[key]);
      return ({
        key: key,
        title: key,
        expandable: children?.length > 0,
        expanded: true,
        children: children,
        data: element
      });
    });
  }

  private transformer = (node: {snap: Element, diff: Element}): Element => {
    switch (this.type) {
      case 'snap':
        return node.snap;
      case 'diff':
        return node.diff;
      case 'hybrid':
        return node.diff || node.snap;
    }
  };

  public embedElement(element: Element, upperElId?: string): void {
    if (['diff', 'hybrid'].includes(this.type) && this.structureDefinition.differential) {
      this.structureDefinition.differential.element = this.mergeEl(element, this.structureDefinition.differential.element, upperElId);
    } else if ('snap' === this.type && this.structureDefinition.snapshot) {
      this.structureDefinition.snapshot.element = this.mergeEl(element, this.structureDefinition.snapshot.element, upperElId);
    }
    this.initData(this.structureDefinition);
  }

  public changeElementId(prevId: string, newId: string): void {
    StructureDefinitionUtil.changeId(prevId, newId, this.structureDefinition.differential?.element);
    StructureDefinitionUtil.changeId(prevId, newId, this.structureDefinition.snapshot?.element);
    this.initData(this.structureDefinition);
  }

  private changeId(prevId: string, newId: string, elements: Element[]): void {
    const el = elements?.find(e => e.id === prevId);
    if (isDefined(el)) {
      el.id = newId;
      elements[elements.indexOf(el)] = el;
    }

    const subElements = elements?.filter(e => {
      if (!e.path.startsWith(prevId)) {
        return false;
      }
      const subElId = e.path.replace(prevId, '');
      return subElId.startsWith('.');
    });

    subElements?.forEach(subEl => {
      subEl.id = subEl.id.replace(prevId, newId);
      subEl.path = subEl.path.replace(prevId, newId);
      elements[elements.indexOf(subEl)] = subEl;
    });
  }

  public deleteElement(element: Element): void {
    if (this.structureDefinition.differential) {
      this.structureDefinition.differential.element = this.structureDefinition.differential?.element?.filter(el => el !== element);
    }
    if (this.structureDefinition.snapshot) {
      this.structureDefinition.snapshot.element = this.structureDefinition.snapshot?.element?.filter(el => el !== element);
    }
    this.initData(this.structureDefinition);
    this.elementDeleted.emit(element.id);
  }

  public getFhirSD(): string {
    return JSON.stringify(this.structureDefinition);
  }


  /* Drop list API */

  protected onSelect(node: DropListNode): void {
    this.selectedKey = node.key;
    this.openElement(node['data']);
  }

  protected onMove(event: DropListMoveEvent): void {
    const target = this.findNode(this.nodes, event.targetContainerId);
    const el: Element = event.node['data'];
    this.deleteElement(el);

    const key = event.node.key;
    const id = (target['data']?.path ? target['data'].path : target.key) + '.' + key;
    el.id = id;
    el.path = id;
    const upperElId = target.children?.length > (event.index - 1) && event.index !== 0 ?
      target.children[event.index - 1]['data'].id : (target['data']?.id || target.key);
    this.embedElement(el, upperElId);

    this.onSelect(event.node);
  }

  public onChildAdd(event: MouseEvent, node?: DropListNode): void {
    event.preventDefault();
    event.stopImmediatePropagation();

    const key = 'new';
    const id = (node['data']?.path ? node['data'].path : node.key) + '.' + key;
    this.embedElement({id: id, path: id, fixedCoding: {}});

    const n = this.findNode(this.nodes, key);
    this.onSelect(n);
  }

  public onDelete(event: MouseEvent, node?: DropListNode): void {
    event.preventDefault();
    event.stopImmediatePropagation();
    this.deleteElement(node['data']);
  }

  private mergeEl(element: Element, elements: Element[], upperElId?: string): Element[] {
    const sdEl = elements?.find(el => el.id === element.id);
    if (isDefined(sdEl)) {
      const index = elements.indexOf(sdEl);
      elements[index] = element;
      return elements;
    }

    if (isDefined(upperElId)) {
      const upperEl = elements?.find(el => el.id === upperElId);
      if (isDefined(upperEl)) {
        const upperElIdx = elements.indexOf(upperEl);
        return [...elements.slice(0, upperElIdx + 1), element, ...elements.slice(upperElIdx + 1)];
      }
    }
    elements = [...(elements || []), element];
    return elements;
  }

  private findNode(nodes: DropListNode[], key: string): DropListNode {
    return findInTree(nodes, key, n => n.key, n => n.children);
  }
}
