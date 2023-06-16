import {AfterViewInit, Component, Directive, EventEmitter, Input, Output, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {isDefined} from '@kodality-web/core-util';
import {startWith, Subject} from 'rxjs';
import {ActiveDescendantKeyManager} from '@angular/cdk/a11y';
import {OptionItem, ThesaurusDropdownOptionComponent} from './dropdown/thesaurus-dropdown-option.component';
import {ThesaurusDropdownComponent} from './dropdown/thesaurus-dropdown.component';

@Directive()
export abstract class ThesaurusQuickActionsModalBaseComponent {
  public abstract definition: Omit<OptionItem, 'result'>;
  public resolve = new Subject<any>();

  public abstract handle(ctx?: {lang?: string});
}


@Component({
  selector: "tw-dropdown-menu",
  template: `
    <tw-dropdown [reference]="containerRef">
      <div class="dropdown-options-container" id="options-container">
        <tw-dropdown-option [item]="item" *ngFor="let item of popupOptions" (click)="selectOption(item)"></tw-dropdown-option>
      </div>
    </tw-dropdown>


    <tw-link-modal/>
    <tw-structure-definition-modal/>
    <tw-template-modal [lang]="lang"/>
  `,
  styles: [`
    .dropdown-options-container {
      width: 100%;
      max-height: 15rem;
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
  @Output() public resultComposed = new EventEmitter<{result: any, range: Range}>();

  // internal variables
  protected popupOptions: OptionItem[] = [];
  @ViewChildren(ThesaurusQuickActionsModalBaseComponent) private componentOptions: QueryList<ThesaurusQuickActionsModalBaseComponent>;
  private baseOptions = [
    {id: '_md_bullet-list', name: 'Bullet list', icon: 'unordered-list', description: 'Create an unordered list', result: '* '},
    {id: '_md_numbered-list', name: 'Numbered list', icon: 'ordered-list', description: 'Create an ordered list', result: '1. '},
    {id: '_md_divider', name: 'Divider', icon: 'line', description: 'Separate content with horizontal line', result: '*** '},
    {id: '_md_code', name: 'Code', icon: 'code', description: 'Syntax highlight', result: '```\n\n``` '},
    {id: '_md_heading-1', name: 'Heading 1', icon: 'font-size', description: 'Top level heading', result: '# '},
    {id: '_md_heading-2', name: 'Heading 2', icon: 'font-size', description: 'Sections', result: '## '}
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

    this.componentOptions.changes
      .pipe(startWith(null))
      .subscribe(() => {
        const components = this.componentOptions.toArray();
        setTimeout(() => {
          components.forEach(c => c.resolve.subscribe(result => this.emitResult(result)));
          this.popupOptions = [...components.map(c => c.definition), ...this.baseOptions];
        });
      });
  }


  protected selectOption(item: OptionItem): void {
    this.hide();

    if (isDefined(item.result)) {
      this.emitResult(item.result);
    } else {
      this.componentOptions.find(c => c.definition.id === item.id)?.handle({lang: this.lang});
    }
  }

  private emitResult<T>(result: T): void {
    this.resultComposed.emit({result: result, range: this.range});
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
    event.stopImmediatePropagation()

    if (event.key === 'Enter' && this.keyManager!.activeItem) {
      this.selectOption(this.keyManager!.activeItem.item!);
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
