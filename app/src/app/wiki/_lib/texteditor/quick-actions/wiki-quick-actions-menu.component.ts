import {AfterViewInit, Component, EventEmitter, Input, Output, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {DestroyService, isDefined} from '@kodality-web/core-util';
import {delay, filter, fromEvent, map, startWith, takeUntil} from 'rxjs';
import {ActiveDescendantKeyManager} from '@angular/cdk/a11y';
import {WikiQuickActionsDropdownOptionComponent} from '../../texteditor/quick-actions/components/wiki-quick-actions-dropdown-option.component';
import {WikiQuickActionsDropdownComponent} from '../../texteditor/quick-actions/components/wiki-quick-actions-dropdown.component';
import {WikiQuickActionDefinition, WikiQuickActionsBaseComponent} from './actions/wiki-quick-actions.base';


@Component({
  selector: "tw-dropdown-menu",
  template: `
    <!-- WikiQuickActionsDropdownComponent -->
    <tw-wiki-quick-actions-dropdown [reference]="containerRef">
      <div class="dropdown-options-container" id="options-container">
        <!-- WikiDropdownOptionComponent -->
        <tw-wiki-quick-actions-dropdown-option
            *ngFor="let item of popupOptions"
            [item]="item"
            (click)="onOptionSelect(item.id)"
        ></tw-wiki-quick-actions-dropdown-option>
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
  `],
  providers: [
    DestroyService
  ]
})
export class WikiQuickActionsMenuComponent implements AfterViewInit {
  @Input() public containerRef: HTMLElement;
  @Input() public lang: string;
  @Output() public composed = new EventEmitter<{result: any, cursorOffset: number}>();


  // both dynamicOptions & localOptions
  protected popupOptions: WikiQuickActionDefinition[] = [];

  @ViewChildren(WikiQuickActionsBaseComponent)
  private readonly dynamicOptions: QueryList<WikiQuickActionsBaseComponent>;
  private readonly localOptions: WikiQuickActionDefinition[] = [
    {id: '_md_bullet-list', icon: 'unordered-list', name: 'Bullet list', description: 'Create an unordered list', result: '* '},
    {id: '_md_numbered-list', icon: 'ordered-list', name: 'Numbered list', description: 'Create an ordered list', result: '1. '},
    {id: '_md_divider', icon: 'line', name: 'Divider', description: 'Separate content with horizontal line', result: '***\n'},
    {id: '_md_code', icon: 'code', name: 'Code', description: 'Syntax highlight', result: '```\n``` ', cursorOffset: () => 3},
    {id: '_md_heading-1', icon: 'font-size', name: 'Heading 1', description: 'Top level heading', result: '# '},
    {id: '_md_heading-2', icon: 'font-size', name: 'Heading 2', description: 'Sections', result: '## '},
  ];


  // dropdown component ref
  @ViewChild(WikiQuickActionsDropdownComponent) public dropdown?: WikiQuickActionsDropdownComponent;
  @ViewChildren(WikiQuickActionsDropdownOptionComponent) public options?: QueryList<WikiQuickActionsDropdownOptionComponent>;


  private keyManager: ActiveDescendantKeyManager<
    WikiQuickActionsDropdownOptionComponent
  >;

  public constructor(
    private destroy$: DestroyService
  ) { }


  public ngAfterViewInit(): void {
    this.keyManager = new ActiveDescendantKeyManager(this.options!)
      .withHorizontalOrientation('ltr')
      .withVerticalOrientation(true)
      .withWrap();

    this.dynamicOptions.changes.pipe(
      startWith(null),
      delay(0),
      map(() => this.dynamicOptions.map(c => c.definition))
    ).subscribe(dynamicOptions => {
      this.popupOptions = [
        ...dynamicOptions,
        ...this.localOptions,
      ];
    });

    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(takeUntil(this.destroy$), filter(() => this.dropdown.showing))
      .subscribe(e => this.proxyKeyDown(e));

    fromEvent<KeyboardEvent>(document, 'keyup')
      .pipe(takeUntil(this.destroy$), filter(() => this.dropdown.showing))
      .subscribe(e => this.proxyKeyUp(e));
  }


  protected onOptionSelect(id: string): void {
    this.hide();
    const item = this.popupOptions.find(i => i.id === id);

    if (isDefined(item.result)) {
      this.emitResult(item.result, item.cursorOffset?.(item.result));
      return;
    }

    const com = this.dynamicOptions.find(c => c.definition.id === item.id);
    if (!com?.resolve.observed) {
      com?.resolve.subscribe(r => this.emitResult(r, com.definition.cursorOffset?.(r)));
    }
    com?.handle({lang: this.lang});
    return;
  }

  private emitResult(result: string, offset: number = result?.length): void {
    this.composed.emit({
      result: result,
      cursorOffset: offset
    });
  }


  /* Dropdown handlers */

  private _prevFocusedEl: HTMLElement;

  private show(): void {
    this._prevFocusedEl = document.activeElement as HTMLElement;
    this._prevFocusedEl?.blur();

    this.dropdown?.show();
    if (this.options?.length) {
      this.keyManager.setFirstItemActive();
    }
  }

  private hide(): void {
    this.dropdown?.hide();
    this._prevFocusedEl?.focus();
  }


  /* Key handlers */

  public proxyKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.hide();
    }

    if (event.key === '/' && !this.dropdown?.showing) {
      this.show();
    }
  }

  public proxyKeyDown(event: KeyboardEvent): void {
    const km = this.keyManager;
    const key = event.key;
    const preventDefault = (): void => {
      event.preventDefault();
      event.stopImmediatePropagation();
    };

    // '/' is handled on UP press
    // No need to handle key presses if dropdown is already showing
    if (key === '/' || !this.dropdown?.showing) {
      return;
    }

    // 'Enter' selects active option in the dropdown
    if (key === 'Enter' && km.activeItem) {
      preventDefault();
      this.onOptionSelect(km.activeItem.item.id);
      return;
    }

    // Number shortcut to select option (1 - 9)
    if (!isNaN(Number(event.key)) && this.popupOptions[Number(event.key) - 1]) {
      preventDefault();
      this.onOptionSelect(this.popupOptions[Number(event.key) - 1].id);
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
}
