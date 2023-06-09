import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, TemplateRef, TrackByFunction} from '@angular/core';
import {CdkDragDrop, CdkDragMove} from '@angular/cdk/drag-drop';
import {BooleanInput} from '@kodality-web/core-util';


export interface DropListNode {
  key: string,
  title?: string, // or use nodeRenderer
  expandable?: boolean;
  children?: DropListNode[]

  expanded?: boolean;
  level?: number;

  [key: string]: any;
}

export interface DropListMoveEvent {
  sourceContainerId: string,
  targetContainerId: string,
  index?: number,
  action: string,
  node: DropListNode
}

@Component({
  selector: 'tw-drop-list',
  templateUrl: 'drop-list.component.html',
  styleUrls: ['drop-list.component.less']
})
export class DropListComponent implements OnChanges {
  @Input() public nodes: DropListNode[] = [];
  @Input() public nodeRenderer: TemplateRef<any>;
  @Input() public nodeActions: TemplateRef<any>;

  @Input() public selectedKey: string;
  @Output() public selectedKeyChange = new EventEmitter();

  @Input() @BooleanInput() public disableDrag: string | boolean;

  @Output() public twSelect = new EventEmitter<DropListNode>();
  @Output() public twExpand = new EventEmitter<DropListNode>();
  @Output() public twMove = new EventEmitter<DropListMoveEvent>();

  protected readonly DEFAULT_ITEM_OFFSET = 1.25;
  protected readonly ZONE_BOUND_MARGIN = 0.75;

  protected dragInfo: {parentKey?: string, targetKey?: string, action?: string};
  protected trackBy: TrackByFunction<DropListNode> = (idx, node) => node.key;

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['nodes']) {
      this.recalcTree();
    }
  }

  public dropped(event: CdkDragDrop<DropListNode[]>): void {
    const draggedItem: DropListNode = event.item.data;
    if (!this.dragInfo) {
      return;
    }

    // has the node.key, because [id] attr on cdkDropList
    const sourceParentId = event.previousContainer.id;
    const sourceParentNode = this.findNode(this.nodes, sourceParentId);

    const targetId = this.dragInfo?.targetKey;
    const targetNode = this.findNode(this.nodes, targetId);
    const targetParentNode = this.getParentNode(this.nodes, undefined, targetId);


    const sourceContainer =
      sourceParentNode != undefined
        ? sourceParentNode.children
        : this.nodes;

    const targetContainer =
      targetParentNode != undefined
        ? targetParentNode.children
        : this.nodes;

    let i = sourceContainer.findIndex((c) => c.key === draggedItem.key);
    sourceContainer.splice(i, 1);


    switch (this.dragInfo.action) {
      case 'before':
      case 'after':
        const targetIndex = targetContainer.findIndex((c) => c.key === targetId);
        if (this.dragInfo.action == 'before') {
          targetContainer.splice(targetIndex, 0, draggedItem);
        } else {
          targetContainer.splice(targetIndex + 1, 0, draggedItem);
        }
        break;

      case 'inside':
        targetNode.children ??= [];
        targetNode.children.push(draggedItem);
        targetNode.expanded = true;
        break;
    }


    this.twMove.emit({
      sourceContainerId: sourceParentId,
      targetContainerId: this.dragInfo.action === 'inside' ? targetId : targetParentNode?.key,
      action: this.dragInfo.action,
      index: this.dragInfo.action === 'inside' ? targetNode.children.indexOf(draggedItem) : targetContainer.indexOf(draggedItem),
      node: draggedItem
    });

    this.dragInfo = undefined;
    this.recalcTree();
  }


  public dragMoved(event: CdkDragMove<DropListNode>): void {
    if (this.disableDrag) {
      return;
    }

    const e = document.elementFromPoint(event.pointerPosition.x, event.pointerPosition.y);
    if (!e) {
      return;
    }

    const findClosest = (selector: string): Element => {
      const element = e.closest(selector);
      return element?.contains(e) ? element : undefined;
    };

    // The drop container could be:
    // 1. specific drop item (usually the tree node, the cdkDrag content);
    // 2. the node children's wrapper
    const dropContainer =
      findClosest('.drop-container') ??
      findClosest('.drop-container__wrapper');

    if (!dropContainer || !dropContainer.getAttribute("data-key")) {
      // if container not found, or found some useless element
      return this.dragInfo = undefined;
    }


    const targetKey = dropContainer.getAttribute("data-key");
    const targetItem = this.findNode(this.nodes, targetKey);
    const targetRect = dropContainer.getBoundingClientRect();
    const parentKey = this.getParentNode(this.nodes, undefined, targetKey)?.key;

    const isDropContainer = dropContainer.classList.contains("drop-container");

    // whether element could be dropped in
    const inDropZone =
      isDropContainer ||
      event.pointerPosition.x <= targetRect.x + this.convertRemToPixels(this.DEFAULT_ITEM_OFFSET);

    if (!inDropZone) {
      return this.dragInfo = undefined;
    }


    // calculates where lower & upper bound clipping starts
    const ZONE_BOUND_MARGIN_PX = this.convertRemToPixels(isDropContainer ? this.ZONE_BOUND_MARGIN : this.ZONE_BOUND_MARGIN * 2);
    const isInUpperBound = (): boolean => event.pointerPosition.y - targetRect.top < ZONE_BOUND_MARGIN_PX;
    const isInLowerBound = (): boolean => event.pointerPosition.y - targetRect.top > targetRect.height - ZONE_BOUND_MARGIN_PX;


    const handleDefault = (): string => {
      if (isInUpperBound()) {
        return "before";
      } else if (isInLowerBound() && !targetItem.expanded) {
        return "after";
      } else {
        return "inside";
      }
    };

    const handleWrapper = (): string => {
      if (isInLowerBound()) {
        return "after";
      }
    };


    const action = isDropContainer
      ? handleDefault()
      : handleWrapper();

    this.dragInfo = {
      targetKey: targetKey,
      parentKey: isDropContainer ? undefined : parentKey,
      action: action
    };

    if (!this.dragInfo.targetKey || !this.dragInfo.action) {
      this.dragInfo = undefined;
    }
  }


  /* Internal API */

  protected onExpand(node: DropListNode, event?: MouseEvent): void {
    event?.preventDefault();
    event?.stopPropagation();
    node.expanded = !node.expanded;
    this.twExpand.emit(node);
  }

  protected onSelect(node: DropListNode, event?: MouseEvent): void {
    this.selectedKey = node?.key;
    this.selectedKeyChange.emit(this.selectedKey);
    this.twSelect.emit(node);
  }


  /* Utils */

  private getParentNode(nodesToSearch: DropListNode[], parent: DropListNode, key: string): DropListNode {
    for (let node of nodesToSearch) {
      if (node.key == key) {
        return parent;
      }
      const ret = this.getParentNode(node.children, node, key);
      if (ret) {
        return ret;
      }
    }
  }

  private findNode(nodesToSearch: DropListNode[], key: string): DropListNode {
    for (let node of nodesToSearch) {
      if (node.key == key) {
        return node;
      }
      const ret = this.findNode(node.children, key);
      if (ret) {
        return ret;
      }
    }
  }

  private convertRemToPixels(rem: number): number {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
  }

  private recalcTree(): void {
    this.nodes.forEach(n => {
      const prepareTree = (node: DropListNode, level: number): void => {
        node.level = level;

        node.children?.forEach(c => prepareTree(c, level + 1));
        if (!node.children?.length) {
          node.expanded = false;
        }
      };
      prepareTree(n, 1);
    });
  }
}
