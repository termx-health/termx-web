import {AfterViewInit, Component, EventEmitter, Input, Output, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {isDefined} from '@kodality-web/core-util';
import {delay, startWith} from 'rxjs';
import {ActiveDescendantKeyManager} from '@angular/cdk/a11y';
import {WikiQuickActionsDropdownOptionComponent} from './dropdown/wiki-quick-actions-dropdown-option.component';
import {WikiQuickActionsDropdownComponent} from './dropdown/wiki-quick-actions-dropdown.component';
import {WikiQuickActionDefinition, WikiQuickActionsBaseComponent} from './wiki-quick-actions-base.directive';


@Component({
  selector: "tw-dropdown-menu",
  template: `
    <!-- WikiDropdownComponent -->
    <tw-wiki-quick-actions-dropdown [reference]="containerRef">
      <div class="dropdown-options-container" id="options-container">
        <!-- WikiDropdownOptionComponent -->
        <tw-wiki-quick-actions-dropdown-option *ngFor="let item of popupOptions" [item]="item" (click)="onOptionSelect(item)"></tw-wiki-quick-actions-dropdown-option>
      </div>
    </tw-wiki-quick-actions-dropdown>


    <!-- WikiQuickActionsBaseComponent -->
    <tw-wiki-link-action/>
    <tw-wiki-structure-definition-action/>
    <tw-wiki-template-action [lang]="lang"/>
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
export class WikiQuickActionsMenuComponent implements AfterViewInit {
  @Input() public containerRef: HTMLElement;
  @Input() public lang: string;
  @Output() public resultComposed = new EventEmitter<{result: any, range: Range, cursorOffset: number}>();

  // dropdown component ref
  @ViewChild(WikiQuickActionsDropdownComponent) public dropdown?: WikiQuickActionsDropdownComponent;
  @ViewChildren(WikiQuickActionsDropdownOptionComponent) public options?: QueryList<WikiQuickActionsDropdownOptionComponent>;

  // both componentOptions & baseOptions
  protected popupOptions: WikiQuickActionDefinition[] = [];

  @ViewChildren(WikiQuickActionsBaseComponent) private readonly componentOptions: QueryList<WikiQuickActionsBaseComponent>;
  private readonly baseOptions: WikiQuickActionDefinition[] = [
    {id: '_md_bullet-list', icon: 'unordered-list', name: 'Bullet list', description: 'Create an unordered list', result: '* '},
    {id: '_md_numbered-list', icon: 'ordered-list', name: 'Numbered list', description: 'Create an ordered list', result: '1. '},
    {id: '_md_divider', icon: 'line', name: 'Divider', description: 'Separate content with horizontal line', result: '***\n'},
    {id: '_md_code', icon: 'code', name: 'Code', description: 'Syntax highlight', result: '```\n``` ', cursorOffset: () => 3},
    {id: '_md_heading-1', icon: 'font-size', name: 'Heading 1', description: 'Top level heading', result: '# '},
    {id: '_md_heading-2', icon: 'font-size', name: 'Heading 2', description: 'Sections', result: '## '},
  ];

  private keyManager?: ActiveDescendantKeyManager<WikiQuickActionsDropdownOptionComponent>;
  private range?: Range;

  public ngAfterViewInit(): void {
    setTimeout(() => {
      this.keyManager = new ActiveDescendantKeyManager(this.options!)
        .withHorizontalOrientation('ltr')
        .withVerticalOrientation(true)
        .withWrap();
    });

    this.componentOptions.changes.pipe(startWith(null), delay(0)).subscribe(() => {
      this.popupOptions = [
        ...this.componentOptions.map(c => c.definition),
        ...this.baseOptions,
      ];

      this.componentOptions.forEach(comp =>
        // add resolve handler to QA component
        comp.resolve.subscribe(r => {
          const offset = comp.definition.cursorOffset?.(r);
          this.emitResult(r, offset);
        }));
    });
  }


  protected onOptionSelect(item: WikiQuickActionDefinition): void {
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
    if (event.key === 'Escape') {
      this.hide();
    }

    if (event.key === '/' && !this.dropdown?.showing) {
      this.range = window.getSelection()?.getRangeAt(0);
      this.show();
    }
  }

  public handleKeyDown(event: KeyboardEvent): void {
    const km = this.keyManager;
    const key = event.key;
    const preventDefault = (): void => {
      event.preventDefault();
      event.stopImmediatePropagation();
    };

    // '/' is handled on UP press
    // No need to handle key presses is dropdown is already showing
    if (key === '/' || !this.dropdown?.showing) {
      return;
    }

    // 'Enter' selects active option in the dropdown
    if (key === 'Enter' && km.activeItem) {
      preventDefault();
      this.onOptionSelect(km.activeItem.item!);
      return;
    }

    // Number shortcut to select option (1 - 9)
    if (!isNaN(Number(event.key)) && this.popupOptions[Number(event.key) - 1]) {
      preventDefault();
      this.onOptionSelect(this.popupOptions[Number(event.key) - 1]);
      return;
    }

    // Dropdown arrow navigation
    if (['ArrowUp', 'Up', 'ArrowDown', 'Down', 'ArrowRight', 'Right', 'ArrowLeft', 'Left'].includes(key)) {
      preventDefault();
      km.onKeydown(event);
      if (km.activeItem?.item?.id) {
        const targetElement = document.getElementById(km.activeItem.item.id);
        document.getElementById("options-container")?.scrollTo(0, targetElement!.offsetTop);
      }
      return;
    }

    // Unknown key -> close dropdown
    this.hide();
  }


  /* Dropdown handlers */

  public show(): void {
    this.dropdown?.show();
    if (this.options?.length) {
      this.keyManager.setFirstItemActive();
    }
  }

  public hide(): void {
    this.dropdown?.hide();
  }
}
