import {AfterViewInit, Component, EventEmitter, Input, Output, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {isDefined} from '@kodality-web/core-util';
import {startWith} from 'rxjs';
import {ActiveDescendantKeyManager} from '@angular/cdk/a11y';
import {ThesaurusDropdownOptionComponent} from './dropdown/thesaurus-dropdown-option.component';
import {ThesaurusDropdownComponent} from './dropdown/thesaurus-dropdown.component';
import {ThesaurusQuickActionDefinition, ThesaurusQuickActionsBaseComponent} from './thesaurus-quick-actions-base.directive';


@Component({
  selector: "tw-dropdown-menu",
  template: `
    <tw-dropdown [reference]="containerRef">
      <div class="dropdown-options-container" id="options-container">
        <tw-dropdown-option *ngFor="let item of popupOptions" [item]="item" (click)="onOptionSelect(item)"></tw-dropdown-option>
      </div>
    </tw-dropdown>


    <tw-link-modal/>
    <tw-structure-definition-modal/>
    <tw-template-modal [lang]="lang"/>
  `,
  styles: [`
    .dropdown-options-container {
      width: 100%;
      border-radius: 3px;
      box-shadow: 0 1px 4px 0 rgba(0, 0, 0, .24);
      overflow-y: scroll;
      scroll-behavior: smooth;
    }
  `]
})
export class ThesaurusQuickActionsMenuComponent implements AfterViewInit {
  @Input() public containerRef: HTMLElement;
  @Input() public lang: string;
  @Output() public resultComposed = new EventEmitter<{result: any, range: Range, cursorOffset: number}>();

  // internal variables
  protected popupOptions: ThesaurusQuickActionDefinition[] = []; // both componentOptions & baseOptions

  @ViewChildren(ThesaurusQuickActionsBaseComponent) private readonly componentOptions: QueryList<ThesaurusQuickActionsBaseComponent>;
  private readonly baseOptions: ThesaurusQuickActionDefinition[] = [
    {id: '_md_bullet-list', icon: 'unordered-list', name: 'Bullet list', description: 'Create an unordered list', result: '* '},
    {id: '_md_numbered-list', icon: 'ordered-list', name: 'Numbered list', description: 'Create an ordered list', result: '1. '},
    {id: '_md_divider', icon: 'line', name: 'Divider', description: 'Separate content with horizontal line', result: '***\n'},
    {id: '_md_code', icon: 'code', name: 'Code', description: 'Syntax highlight', result: '```\n``` ', cursorOffset: () => 3},
    {id: '_md_heading-1', icon: 'font-size', name: 'Heading 1', description: 'Top level heading', result: '# '},
    {id: '_md_heading-2', icon: 'font-size', name: 'Heading 2', description: 'Sections', result: '## '}
  ];

  // dropdown component refs and variables
  @ViewChild(ThesaurusDropdownComponent) public dropdown?: ThesaurusDropdownComponent;
  @ViewChildren(ThesaurusDropdownOptionComponent) public options?: QueryList<ThesaurusDropdownOptionComponent>;
  private keyManager?: ActiveDescendantKeyManager<ThesaurusDropdownOptionComponent>;
  private range?: Range;


  public ngAfterViewInit(): void {
    setTimeout(() => {
      this.keyManager = new ActiveDescendantKeyManager(this.options!)
        .withHorizontalOrientation('ltr')
        .withVerticalOrientation(true)
        .withWrap();
    });

    this.componentOptions.changes.pipe(startWith(null)).subscribe(() => {
      const components = this.componentOptions.toArray();
      setTimeout(() => {
        this.popupOptions = [...components.map(c => c.definition), ...this.baseOptions];

        components.forEach(comp =>
          // add resolve handler to QA component
          comp.resolve.subscribe(r => {
            const offset = comp.definition.cursorOffset?.(r);
            this.emitResult(r, offset);
          }));
      });
    });
  }


  protected onOptionSelect(item: ThesaurusQuickActionDefinition): void {
    this.hide();

    if (isDefined(item.result)) {
      this.emitResult(item.result, item.cursorOffset?.(item.result));
    } else {
      this.componentOptions.find(c => c.definition.id === item.id)?.handle({lang: this.lang});
    }
  }

  private emitResult(result: string, offset: number = result?.length): void {
    this.resultComposed.emit({
      result: result,
      range: this.range,
      cursorOffset: offset
    });
  }


  /* Key handlers */

  public handleKeyUp(event: KeyboardEvent): void {
    if (event.key === '/' && !this.dropdown?.showing) {
      const selection = window.getSelection();
      this.range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : undefined;
      this.show();
    }
  }

  public handleKeyDown(event: KeyboardEvent): void {
    if (event.key === '/' || !this.dropdown?.showing) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    if (event.key === 'Enter' && this.keyManager!.activeItem) {
      this.onOptionSelect(this.keyManager!.activeItem.item!);
    } else if (['ArrowUp', 'Up', 'ArrowDown', 'Down', 'ArrowRight', 'Right', 'ArrowLeft', 'Left'].includes(event.key)) {
      this.keyManager.onKeydown(event);

      if (this.keyManager.activeItem?.item?.id) {
        const targetElement = document.getElementById(this.keyManager!.activeItem?.item?.id);
        document.getElementById("options-container")?.scrollTo(0, targetElement!.offsetTop);
      }
    } else {
      this.hide();
    }
  }


  /* Dropdown handlers */

  public show(): void {
    this.dropdown?.show();
    if (this.options?.length) {
      this.keyManager!.setFirstItemActive();
    }
  }

  public hide(): void {
    this.dropdown?.hide();
  }
}
